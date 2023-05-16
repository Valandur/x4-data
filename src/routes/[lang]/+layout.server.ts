import { LANGUAGES } from '$lib/server/translation';
import { redirect } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ url, params }) => {
	const lang = params.lang;
	const langName = LANGUAGES.find((l) => l.key === lang)?.name ?? null;

	if (!langName) {
		throw redirect(307, `/en`);
	}

	return {
		lang,
		langName,
		languages: LANGUAGES,
		path: url.pathname.substring(3)
	};
};

export const prerender = true;
