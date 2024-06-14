import { X4_BUILD_NUMBER } from '$env/static/private';
import { components } from '$lib/server/component';
import { macros } from '$lib/server/macro';
import { meta } from '$lib/server/meta';
import { ships } from '$lib/server/ship';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const numShips = ships.count();
	const numComponents = components.count();
	const numMacros = macros.count();
	const lastUpdate = new Date();
	const version = meta.version;
	const tag = meta.tag;

	return {
		numShips,
		numComponents,
		numMacros,
		lastUpdate,
		version,
		tag,
		build: X4_BUILD_NUMBER
	};
};
