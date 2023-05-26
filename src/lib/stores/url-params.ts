import { onDestroy } from 'svelte';
import { writable } from 'svelte/store';

import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { page } from '$app/stores';

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
	invert?: boolean;
}
interface UrlParamFlags {
	type: 'flags';
	name: string;
	flags: Record<string, { name: string; default: boolean; invert?: boolean }>;
	invert?: boolean;
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
				const invert = 'invert' in param && param.invert;
				params[key] = {
					type: 'array',
					name: param.name,
					default: param.default,
					invert: invert
				};
				defaults[key] = invert ? [] : param.default;
			}
		} else if ('flags' in param) {
			params[key] = { type: 'flags', name: param.name, flags: param.flags, invert: param.invert };
			const defaultFlags: Record<string, boolean> = {};
			for (const [flagKey, flag] of Object.entries(param.flags)) {
				defaultFlags[flagKey] = flag.invert ? !flag.default : flag.default;
				if (param.invert) {
					defaultFlags[flagKey] = !defaultFlags[flagKey];
				}
			}
			defaults[key] = defaultFlags;
		}
	}

	const { subscribe, set } = writable<UrlParamValues<T>>({ ...defaults } as UrlParamValues<T>);

	const paramEntries = Object.entries(params);
	let navTimeout: ReturnType<typeof setTimeout> | null = null;

	function clearNavTimeout() {
		if (navTimeout) {
			clearTimeout(navTimeout);
			navTimeout = null;
		}
	}

	function toURLSearchParams(values: UrlParamValues<T>, others?: URLSearchParams): URLSearchParams {
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
				let val = value as string[];
				if (param.invert) {
					val = param.default.filter((d) => !val.includes(d));
				}

				if (val.length > 0) {
					urlParams.set(param.name, val.join(PARAM_SEP));
				} else {
					urlParams.delete(param.name);
				}
			} else if (param.type === 'flags') {
				const bools = value as Record<string, boolean>;
				if (param.invert) {
					for (const flagKey of Object.keys(param.flags)) {
						bools[flagKey] = !bools[flagKey];
					}
				}

				const str = Object.keys(bools)
					.filter((bKey) => (param.flags[bKey].invert ? !bools[bKey] : bools[bKey]))
					.map((bKey) => param.flags[bKey].name)
					.join('');
				if (str.length > 0) {
					urlParams.set(param.name, str);
				} else {
					urlParams.delete(param.name);
				}
			}
		}
		return urlParams;
	}

	function fromUrlSearchParams(urlParams: URLSearchParams): UrlParamValues<T> {
		const values: Record<string, unknown> = { ...defaults };

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
				let vals = value.split(PARAM_SEP);
				if (param.invert) {
					vals = param.default.filter((d) => !vals.includes(d));
				}
				values[key] = vals;
			} else if (param.type === 'flags') {
				const flags: Record<string, boolean> = {};
				for (const [flagKey, flag] of Object.entries(param.flags)) {
					if (value.includes(flag.name)) {
						flags[flagKey] = true;
					} else {
						flags[flagKey] = false;
					}

					if (flag.invert) {
						flags[flagKey] = !flags[flagKey];
					}
					if (param.invert) {
						flags[flagKey] = !flags[flagKey];
					}
				}
				values[key] = flags;
			}
		}

		return values as UrlParamValues<T>;
	}

	if (browser) {
		let oldSearch = '';

		const unsubPage = page.subscribe(({ url }) => {
			const urlParams = url.searchParams;
			const search = urlParams?.toString();

			if (urlParams && typeof search === 'string' && search !== oldSearch) {
				const values = fromUrlSearchParams(urlParams);
				oldSearch = search;
				set(values as UrlParamValues<T>);
			}
		});

		const unsubValues = subscribe((newValues) => {
			clearNavTimeout();
			navTimeout = setTimeout(() => {
				const newSearch = toURLSearchParams(newValues).toString();
				if (newSearch !== oldSearch) {
					oldSearch = newSearch;
					goto(`?${newSearch}`, { keepFocus: true, noScroll: true });
				}
			}, SAVE_DELAY);
		});

		onDestroy(() => {
			clearNavTimeout();
			unsubPage();
			unsubValues();
		});
	}

	return {
		subscribe,
		set,
		toURLSearchParams
	};
}
