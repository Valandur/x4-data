import { X4_BUILD_NUMBER, X4_VERSION } from '$env/static/private';
import { components } from '$lib/server/component';
import { macros } from '$lib/server/macro';
import { ships } from '$lib/server/ship';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const numShips = ships.count();
	const numComponents = components.count();
	const numMacros = macros.count();
	const lastUpdate = new Date();

	return {
		numShips,
		numComponents,
		numMacros,
		lastUpdate,
		version: X4_VERSION,
		build: X4_BUILD_NUMBER
	};
};
