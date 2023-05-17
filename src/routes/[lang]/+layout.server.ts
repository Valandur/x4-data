import { redirect } from '@sveltejs/kit';

import { LANGUAGES } from '$lib/server/translation';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ params }) => {
	const lang = params.lang;
	const langName = LANGUAGES.find((l) => l.key === lang)?.name ?? null;

	if (!langName) {
		throw redirect(307, `/en`);
	}

	return {
		lang,
		langName,
		languages: LANGUAGES
	};
};
