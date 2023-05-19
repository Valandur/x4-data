import { redirect } from '@sveltejs/kit';

import { macros } from '$lib/server/macro';
import { t } from '$lib/server/i18n';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const type = params.type;
	const name = params.name;

	let macro = macros.getByName(name);

	const { lang } = await parent();

	if (!macro) {
		throw redirect(307, `/${lang}/macros/${type}`);
	}

	macro = t(macro, lang);

	return {
		lang,
		type,
		macro
	};
};
