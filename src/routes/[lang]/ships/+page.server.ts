import { i18n } from '$lib/server/i18n';
import { ships } from '$lib/server/ship';
import { CARGO_TYPES, Size } from '$lib/models/Constants';

import type { PageServerLoad } from './$types';

type StringMap = Record<string, string>;

const ENUMS = {
	ships: [Size.S, Size.M, Size.L, Size.XL],
	engines: [Size.S, Size.M, Size.L, Size.XL],
	shields: [Size.S, Size.M, Size.L, Size.XL],
	weapons: [Size.S, Size.M, Size.L, Size.XL],
	turrets: [Size.S, Size.M, Size.L],
	docks: [Size.S, Size.M],
	hangars: [Size.XS, Size.S, Size.M],
	cargo: CARGO_TYPES
};

const NAMES = {
	cargo: {
		CONTAINER: 'CT',
		CONDENSATE: 'CS',
		LIQUID: 'L',
		SOLID: 'S'
	} as StringMap,
	columns: {
		ident: 'Name',
		type: 'Role',
		timeToMaxSpeed: 'Time to Max Speed (TtMS)',
		dragPerEngine: 'Drag per Engine (DpE)'
	} as StringMap
};

interface Maxes {
	engines: Record<Size, number>;
}

export const load: PageServerLoad = async ({ parent }) => {
	let allShips = ships.getAll();

	const { lang } = await parent();

	allShips = allShips.filter((s) => s.size !== Size.XS).map((s) => i18n.t(s, lang));

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
			[Size.XS]: 0, // not used
			[Size.S]: allShips.reduce((acc, s) => Math.max(acc, s.engines[Size.S] ?? 0), 0),
			[Size.M]: allShips.reduce((acc, s) => Math.max(acc, s.engines[Size.M] ?? 0), 0),
			[Size.L]: allShips.reduce((acc, s) => Math.max(acc, s.engines[Size.L] ?? 0), 0),
			[Size.XL]: allShips.reduce((acc, s) => Math.max(acc, s.engines[Size.XL] ?? 0), 0)
		}
	};

	return {
		ships: allShips,
		enums: {
			...ENUMS,
			roles,
			purposes
		},
		names: NAMES,
		max
	};
};
