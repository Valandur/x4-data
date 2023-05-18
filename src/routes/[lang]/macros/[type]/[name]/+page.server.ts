import { redirect } from '@sveltejs/kit';

import { getMacrosOfType } from '$lib/server/data';
import { t } from '$lib/server/translation';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const type = params.type;
	const name = params.name;

	const macros = getMacrosOfType(type);
	let macro = macros.find((o) => o.name === name);

	const { lang } = await parent();

	if (!macros.length) {
		throw redirect(307, `/${lang}/macros`);
	}
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
