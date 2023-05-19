import { redirect } from '@sveltejs/kit';

import { components } from '$lib/server/component';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const type = params.type;

	const componentsOfType = components.getOfType(type);

	const { lang } = await parent();
	if (!componentsOfType.length) {
		throw redirect(307, `/${lang}/components`);
	}

	return {
		type,
		components: componentsOfType
	};
};
