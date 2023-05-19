import { redirect } from '@sveltejs/kit';

import { macros } from '$lib/server/macro';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const type = params.type;

	const macrosOfType = macros.getOfType(type);

	const { lang } = await parent();
	if (!macrosOfType.length) {
		throw redirect(307, `/${lang}/macros`);
	}

	return {
		type,
		macros: macrosOfType
	};
};
