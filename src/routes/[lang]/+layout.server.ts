import { redirect } from '@sveltejs/kit';

import { i18n } from '$lib/server/i18n';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ params }) => {
	const lang = params.lang;
	const langName = i18n.getNameById(lang);

	if (!langName) {
		throw redirect(307, `/en`);
	}

	return {
		lang,
		langName,
		languages: i18n.getLanguages()
	};
};
