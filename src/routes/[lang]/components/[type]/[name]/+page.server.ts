import { redirect } from '@sveltejs/kit';

import { components } from '$lib/server/component';
import { t } from '$lib/server/i18n';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const type = params.type;
	const name = params.name;

	let component = components.getByName(name);

	const { lang } = await parent();

	if (!component) {
		throw redirect(307, `/${lang}/components/${type}`);
	}

	component = t(component, lang);

	return {
		lang,
		type,
		component
	};
};
