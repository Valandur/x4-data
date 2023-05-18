import { getAllShips } from '$lib/server/ship';
import { t } from '$lib/server/translation';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	let ships = getAllShips();

	const { lang } = await parent();

	ships = ships.map((s) => t(s, lang));

	const roles = ships
		.map((s) => s.type)
		.filter((r, i, arr) => arr.indexOf(r) === i)
		.sort((a, b) => a.localeCompare(b));

	const purposes = ships
		.map((s) => s.purpose)
		.filter((r, i, arr) => arr.indexOf(r) === i)
		.sort((a, b) => a.localeCompare(b));

	return {
		roles,
		purposes,
		ships
	};
};
