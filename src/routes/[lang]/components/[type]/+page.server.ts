import { redirect } from '@sveltejs/kit';

import { getComponentsOfType } from '$lib/server/data';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const type = params.type;

	const components = getComponentsOfType(type);

	const { lang } = await parent();
	if (!components.length) {
		throw redirect(307, `/${lang}/components`);
	}

	return {
		type,
		components
	};
};
