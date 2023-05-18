import { redirect } from '@sveltejs/kit';

import { getComponentsOfType } from '$lib/server/data';
import { t } from '$lib/server/translation';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const type = params.type;
	const name = params.name;

	const components = getComponentsOfType(type);
	let component = components.find((o) => o.name === name);

	const { lang } = await parent();

	if (!components.length) {
		throw redirect(307, `/${lang}/components`);
	}
	if (!component) {
		throw redirect(307, `/${lang}/components/${type}`);
	}

	component = t(component, lang);

	return {
		lang,
		type,
		component,
		connections: component.connections
	};
};
