import { redirect } from '@sveltejs/kit';

import { i18n } from '$lib/server/i18n';
import { macros } from '$lib/server/macro';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const type = params.type;
	const name = params.name;

	let macro = macros.getByName(name);

	const { lang } = await parent();

	if (!macro) {
		throw redirect(307, `/${lang}/macros/${type}`);
	}

	macro = i18n.t(macro, lang);

	return {
		lang,
		type,
		macro
	};
};
