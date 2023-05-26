import { writable } from 'svelte/store';

import { browser } from '$app/environment';

import type { Settings } from '$lib/models/Settings';

const STORAGE_KEY = 'x4_settings';
const DEFAULT: Settings = {
	darkTheme: true,
	sidebarCollapsed: false
};

function createStore() {
	let settings: Settings = { ...DEFAULT };

	if (browser && window.localStorage) {
		const strSettings = window.localStorage.getItem(STORAGE_KEY);
		if (strSettings) {
			settings = JSON.parse(strSettings);
		}
	}
	const { subscribe, set } = writable<Settings>(settings);

	function onSet(newSettings: Settings) {
		if (!browser) {
			return;
		}

		if (window.localStorage) {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
		}
		set(newSettings);
	}

	return {
		subscribe,
		set: onSet
	};
}

export const settings = createStore();
