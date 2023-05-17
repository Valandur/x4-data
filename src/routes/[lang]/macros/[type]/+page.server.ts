import { redirect } from '@sveltejs/kit';

import { getMacrosOfType } from '$lib/server/macro';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const type = params.type;

	const macros = getMacrosOfType(type);

	const { lang } = await parent();
	if (!macros.length) {
		throw redirect(307, `/${lang}/macros`);
	}

	return {
		type,
		macros
	};
};
