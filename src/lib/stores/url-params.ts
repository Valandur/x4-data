import { onDestroy } from 'svelte';
import { writable } from 'svelte/store';

import { afterNavigate, goto } from '$app/navigation';
import { browser } from '$app/environment';

const PARAM_SEP = '_';
const SAVE_DELAY = 500;

interface UrlParamNumber {
	type: 'number';
	name: string;
	default: number;
}
interface UrlParamString {
	type: 'string';
	name: string;
	default: string;
}
interface UrlParamArray {
	type: 'array';
	name: string;
	default: string[];
}
interface UrlParamFlags {
	type: 'flags';
	name: string;
	flags: Record<string, { name: string; default: boolean }>;
}
type UrlParamWithType = UrlParamNumber | UrlParamString | UrlParamArray | UrlParamFlags;

type UrlParam =
	| Omit<UrlParamNumber, 'type'>
	| Omit<UrlParamString, 'type'>
	| Omit<UrlParamArray, 'type'>
	| Omit<UrlParamFlags, 'type'>;
type UrlParams = Record<string, UrlParam>;
type UrlParamValues<T extends UrlParams> = {
	[K in keyof T]: 'default' extends keyof T[K]
		? T[K]['default'] extends object
			? string[]
			: T[K]['default']
		: 'flags' extends keyof T[K]
		? { [K2 in keyof T[K]['flags']]: boolean }
		: never;
};

export function trackUrlParams<T extends UrlParams = UrlParams>(initParams: T) {
	const params: Record<string, UrlParamWithType> = {};
	const defaults: Record<string, unknown> = {};

	for (const [key, param] of Object.entries(initParams)) {
		if ('default' in param) {
			if (typeof param.default === 'number') {
				params[key] = { type: 'number', name: param.name, default: param.default };
				defaults[key] = param.default;
			} else if (typeof param.default === 'string') {
				params[key] = { type: 'string', name: param.name, default: param.default };
				defaults[key] = param.default;
			} else if (Array.isArray(param.default)) {
				params[key] = { type: 'array', name: param.name, default: param.default };
				defaults[key] = param.default;
			}
		} else if ('flags' in param) {
			const flags: Record<string, boolean> = {};
			for (const [flagKey, flag] of Object.entries(param.flags)) {
				flags[flagKey] = flag.default;
			}
			params[key] = { type: 'flags', name: param.name, flags: param.flags };
			defaults[key] = flags;
		}
	}
	const { subscribe, set } = writable<UrlParamValues<T>>(defaults as UrlParamValues<T>);

	const paramEntries = Object.entries(params);
	let navTimeout: ReturnType<typeof setTimeout> | null = null;

	function clearNavTimeout() {
		if (navTimeout) {
			clearTimeout(navTimeout);
			navTimeout = null;
		}
	}

	function toURLSearchParams(values: UrlParamValues<T>, others?: URLSearchParams) {
		const urlParams = new URLSearchParams(others);
		for (const [key, param] of paramEntries) {
			const value = values[key];
			if (param.type === 'number') {
				if (value || value === 0) {
					urlParams.set(param.name, `${value}`);
				} else {
					urlParams.delete(param.name);
				}
			} else if (param.type === 'string') {
				if (value) {
					urlParams.set(param.name, `${value}`);
				} else {
					urlParams.delete(param.name);
				}
			} else if (param.type === 'array') {
				const val = value as string[];
				if (val.length > 0) {
					urlParams.set(param.name, val.join(PARAM_SEP));
				} else {
					urlParams.delete(param.name);
				}
			} else if (param.type === 'flags') {
				const bools = value as Record<string, boolean>;
				const str = Object.keys(bools)
					.filter((bKey) => bools[bKey])
					.map((bKey) => param.flags[bKey].name)
					.join('');
				if (str.length > 0) {
					urlParams.set(param.name, str);
				} else {
					urlParams.delete(param.name);
				}
			}
		}
		return urlParams.toString();
	}

	if (browser) {
		let oldSearch = '';

		afterNavigate((nav) => {
			const urlParams = nav.to?.url.searchParams;
			const search = urlParams?.toString();

			if (urlParams && search && search !== oldSearch) {
				const values: Record<string, unknown> = defaults;

				for (const [key, param] of paramEntries) {
					const value = urlParams.get(param.name);
					if (value === null) {
						continue;
					}

					if (param.type === 'number') {
						values[key] = Number(value);
					} else if (param.type === 'string') {
						values[key] = value;
					} else if (param.type === 'array') {
						values[key] = value.split(PARAM_SEP);
					} else if (param.type === 'flags') {
						const flags: Record<string, boolean> = {};
						for (const [flagKey, flag] of Object.entries(param.flags)) {
							if (value.includes(flag.name)) {
								flags[flagKey] = true;
							}
						}
						values[key] = flags;
					}
				}

				oldSearch = search;
				set(values as UrlParamValues<T>);
			}
		});

		const unsub = subscribe((newValues) => {
			clearNavTimeout();
			navTimeout = setTimeout(() => {
				const newSearch = toURLSearchParams(newValues);
				if (newSearch !== oldSearch) {
					oldSearch = newSearch;
					goto(`?${newSearch}`, { keepFocus: true, noScroll: true });
				}
			}, SAVE_DELAY);
		});

		onDestroy(unsub);
	}

	return {
		subscribe,
		set,
		toURLSearchParams
	};
}
