import { i18n } from '$lib/server/i18n';
import { ships } from '$lib/server/ship';
import { Size } from '$lib/models/Constants';

import type { PageServerLoad } from './$types';

interface Maxes {
	engines: Record<Size, number>;
}

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

	const max: Maxes = {
		engines: {
			[Size.XS]: 0,
			[Size.S]: 0,
			[Size.M]: allShips.reduce((acc, s) => Math.max(acc, s.engines[Size.M] ?? 0), 0),
			[Size.L]: 0,
			[Size.XL]: 0
		}
	};

	return {
		roles,
		purposes,
		ships: allShips,
		max
	};
};
