import { redirect } from '@sveltejs/kit';

import { getMacrosOfType } from '$lib/server/macro';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const type = params.type;

	const macros = getMacrosOfType(type);
	if (!macros.length) {
		throw redirect(307, '/macros');
	}

	return {
		type,
		macros
	};
};
