import { components } from '$lib/server/component';
import { macros } from '$lib/server/macro';
import { ships } from '$lib/server/ship';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const numShips = ships.count();
	const numComponents = components.count();
	const numMacros = macros.count();

	return {
		numShips,
		numComponents,
		numMacros
	};
};
