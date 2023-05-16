import { MACRO_TYPES } from '$lib/server/macro';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const types = MACRO_TYPES.sort((a, b) => a.name.localeCompare(b.name));

	return {
		types
	};
};
