import { i18n } from '$lib/server/i18n';
import { ships } from '$lib/server/ship';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	let allShips = ships.getAll();

	const { lang } = await parent();

	allShips = allShips.map((s) => i18n.t(s, lang));

	const roles = allShips
		.map((s) => s.type)
		.filter((r, i, arr) => arr.indexOf(r) === i)
		.sort((a, b) => a.localeCompare(b));

	const purposes = allShips
		.map((s) => s.purpose)
		.filter((r, i, arr) => arr.indexOf(r) === i)
		.sort((a, b) => a.localeCompare(b));

	return {
		roles,
		purposes,
		ships: allShips
	};
};
