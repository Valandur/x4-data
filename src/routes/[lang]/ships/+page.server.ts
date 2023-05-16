import { getMacrosOfType } from '$lib/server/macro';
import { SIZES } from '$lib/models/Size';
import { t } from '$lib/server/translation';
import type { Macro } from '$lib/models/Macro';
import type { Ship } from '$lib/models/Ship';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const rawShips = getMacrosOfType<Ship>('ship_xs', 'ship_s', 'ship_m', 'ship_l', 'ship_xl');

	const { lang } = await parent();

	// Exclude ships:
	// - with alias (usually used only internally)
	// - without properties/identification (should only be the dummy ship)
	// - without ship property (should only be the boarding pod)
	const ships = rawShips
		.filter((s) => !s.alias && s.properties.identification && s.properties.ship)
		.map((s) => ({
			...t(s, lang),
			size: classToSize(s.class),
			cargo: getCargo(s),
			docks: getDocks(s)
		}));

	const sizes = SIZES;

	const roles = ships
		.map((s) => s.properties.ship.type)
		.filter((r, i, arr) => arr.indexOf(r) === i)
		.sort((a, b) => a.localeCompare(b));

	const purposes = ships
		.map((s) => s.properties.purpose.primary)
		.filter((r, i, arr) => arr.indexOf(r) === i)
		.sort((a, b) => a.localeCompare(b));

	const cargoTypes = ships
		.flatMap((s) => Object.keys(s.cargo))
		.filter((r, i, arr) => arr.indexOf(r) === i)
		.sort((a, b) => a.localeCompare(b));

	return {
		roles,
		purposes,
		sizes,
		cargoTypes,
		ships
	};
};

function classToSize(clazz: string) {
	return clazz.substring(5).toUpperCase();
}

function getDocks(macro: Macro) {
	const docks: Record<string, { external: number; storage: number }> = {};
	for (const conn of macro.connections) {
		if (!('resolved' in conn) || !conn.resolved) {
			continue;
		}

		const macro = conn.resolved;
		const sizes = macro.properties.docksize?.tags.split(' ');
		if (sizes) {
			for (const size of sizes) {
				if (!size.startsWith('dock_')) {
					continue;
				}

				const sz = size.substring(5).toUpperCase();
				let stats = docks[sz];
				if (!stats) {
					stats = { external: 0, storage: 0 };
					docks[sz] = stats;
				}

				if (macro.properties.dock?.external) {
					stats.external++;
				} else if (macro.properties.dock?.storage) {
					stats.storage += macro.properties.dock.capacity ?? 0;
				}
			}
		}

		const subDocks = getDocks(macro);
		for (const [subSize, subStats] of Object.entries(subDocks)) {
			let stats = docks[subSize];
			if (!stats) {
				stats = { external: 0, storage: 0 };
				docks[subSize] = stats;
			}

			stats.external += subStats.external;
			stats.storage += subStats.storage;
		}
	}
	return docks;
}

function getCargo(macro: Macro) {
	const cargo: Record<string, number> = {};
	for (const conn of macro.connections) {
		if (!('resolved' in conn) || !conn.resolved) {
			continue;
		}

		const macro = conn.resolved;
		const types = macro.properties.cargo?.tags.split(' ');
		if (types) {
			for (const type of types) {
				cargo[type] = (cargo[type] ?? 0) + (macro.properties.cargo?.max ?? 0);
			}
		}

		const subCargo = getCargo(macro);
		for (const [type, amount] of Object.entries(subCargo)) {
			cargo[type] = (cargo[type] ?? 0) + amount;
		}
	}
	return cargo;
}
