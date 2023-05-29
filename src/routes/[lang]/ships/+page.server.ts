import { i18n } from '$lib/server/i18n';
import { ships } from '$lib/server/ship';
import { CARGO_TYPES, CargoType, SIZES, Size } from '$lib/models/Constants';

import type { PageServerLoad } from './$types';
import { emptyStatsPerSize } from '$lib/server/util';

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
	shields: Record<Size, number>;
	weapons: Record<Size, number>;
	turrets: Record<Size, number>;
	cargo: Record<CargoType, number>;
	docks: Record<Size, number>;
	hangars: Record<Size, number>;
	massPerEngine: Record<Size, number>;
	dragPerEngine: Record<Size, number>;
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
		engines: emptyStatsPerSize(),
		shields: emptyStatsPerSize(),
		weapons: emptyStatsPerSize(),
		turrets: emptyStatsPerSize(),
		docks: emptyStatsPerSize(),
		hangars: emptyStatsPerSize(),
		massPerEngine: emptyStatsPerSize(),
		dragPerEngine: emptyStatsPerSize(),
		cargo: {
			[CargoType.CONDENSATE]: 0,
			[CargoType.CONTAINER]: 0,
			[CargoType.LIQUID]: 0,
			[CargoType.SOLID]: 0
		}
	};

	for (const ship of allShips) {
		for (const size of SIZES) {
			max.engines[size] = Math.max(max.engines[size], ship.engines[size] ?? 0);
			max.shields[size] = Math.max(max.shields[size], ship.shields[size] ?? 0);
			max.weapons[size] = Math.max(max.weapons[size], ship.weapons[size] ?? 0);
			max.turrets[size] = Math.max(max.turrets[size], ship.turrets[size] ?? 0);
			max.docks[size] = Math.max(max.docks[size], ship.docks[size] ?? 0);
			max.hangars[size] = Math.max(max.hangars[size], ship.hangars[size] ?? 0);
			max.massPerEngine[size] = Math.max(max.massPerEngine[size], ship.massPerEngine[size] ?? 0);
			max.dragPerEngine[size] = Math.max(max.dragPerEngine[size], ship.dragPerEngine[size] ?? 0);
		}
		for (const type of CARGO_TYPES) {
			max.cargo[type] = Math.max(max.cargo[type], ship.cargo[type] ?? 0);
		}
	}

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
