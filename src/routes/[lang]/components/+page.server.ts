import { components } from '$lib/server/component';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const types = components.getTypes().sort((a, b) => a.name.localeCompare(b.name));

	return {
		types
	};
};
