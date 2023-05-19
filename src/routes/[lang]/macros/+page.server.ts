import { macros } from '$lib/server/macro';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const types = macros.getTypes().sort((a, b) => a.name.localeCompare(b.name));

	return {
		types
	};
};
