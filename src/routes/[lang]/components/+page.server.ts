import { COMPONENT_TYPES } from '$lib/server/data';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const types = COMPONENT_TYPES.sort((a, b) => a.name.localeCompare(b.name));

	return {
		types
	};
};
