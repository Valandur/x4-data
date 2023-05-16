import { redirect } from '@sveltejs/kit';

import { getMacrosOfType } from '$lib/server/macro';
import { t } from '$lib/server/translation';
import type { Macro } from '$lib/models/Macro';

import type { PageServerLoad } from './$types';

const EXCLUDED_PROPS = ['name', 'class', 'alias', 'source'];

export const load: PageServerLoad = async ({ params, parent }) => {
	const type = params.type;
	const name = params.name;

	const macros = getMacrosOfType(type);
	if (!macros.length) {
		throw redirect(307, '/macros');
	}

	let macro = macros.find((o) => o.name === name);
	if (!macro) {
		throw redirect(307, `/macros/${type}`);
	}

	const { lang } = await parent();

	macro = t(macro, lang);

	const props = Object.keys(macro).filter((p) => !EXCLUDED_PROPS.includes(p)) as (keyof Macro)[];

	return {
		type,
		props,
		macro
	};
};
