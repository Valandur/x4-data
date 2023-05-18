import { getMacrosOfType } from '$lib/server/data';
import { Size } from '$lib/models/Constants';
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
			docks: getDocks(s),
			engines: getEngines(s),
			shields: getShields(s),
			weapons: getWeapons(s),
			turrets: getTurrets(s)
		}));

	const roles = ships
		.map((s) => s.properties.ship.type)
		.filter((r, i, arr) => arr.indexOf(r) === i)
		.sort((a, b) => a.localeCompare(b));

	const purposes = ships
		.map((s) => s.properties.purpose.primary)
		.filter((r, i, arr) => arr.indexOf(r) === i)
		.sort((a, b) => a.localeCompare(b));

	return {
		roles,
		purposes,
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
		const types = macro.properties.cargo?.tags.toUpperCase().split(' ');
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

function getEngines(macro: Macro) {
	if (!macro.component || 'ref' in macro.component) {
		return {};
	}

	const engines: Record<string, { total: number; type: string }> = {};

	const engineTagList = macro.component.connections
		.filter((conn) => conn.tags?.includes('engine'))
		.map((c) => c.tags?.split(' ') ?? []);

	for (const engineTags of engineTagList) {
		let size = Size.XS;
		let type = 'standard';

		for (const tag of engineTags) {
			if (!tag || tag === 'engine') {
				continue;
			}

			const sizeTag = tagToSize(tag);
			if (sizeTag) {
				size = sizeTag;
				continue;
			}

			const typeTag = tagToType(tag);
			if (typeTag) {
				type = typeTag;
				continue;
			}
		}

		engines[size] = { total: (engines[size]?.total ?? 0) + 1, type };
	}

	return engines;
}

function getShields(macro: Macro) {
	if (!macro.component || 'ref' in macro.component) {
		return {};
	}

	const shields: Record<string, { total: number; type: string }> = {};

	const shieldTagList = macro.component.connections
		.filter((conn) => conn.tags?.includes('shield'))
		.map((c) => c.tags?.split(' ') ?? []);

	for (const shieldTags of shieldTagList) {
		let size = Size.XS;
		let type = 'standard';

		for (const tag of shieldTags) {
			if (!tag || tag === 'shield') {
				continue;
			}

			const sizeTag = tagToSize(tag);
			if (sizeTag) {
				size = sizeTag;
				continue;
			}

			const typeTag = tagToType(tag);
			if (typeTag) {
				type = typeTag;
				continue;
			}
		}

		shields[size] = { total: (shields[size]?.total ?? 0) + 1, type };
	}

	return shields;
}

function getTurrets(macro: Macro) {
	if (!macro.component || 'ref' in macro.component) {
		return {};
	}

	const turrets: Record<string, { total: number; type: string }> = {};

	const turretTagList = macro.component.connections
		.filter((conn) => conn.tags?.includes('turret'))
		.map((c) => c.tags?.split(' ') ?? []);

	for (const turretTags of turretTagList) {
		let size = Size.XS;
		let type = 'standard';

		for (const tag of turretTags) {
			if (!tag || tag === 'turret') {
				continue;
			}

			const sizeTag = tagToSize(tag);
			if (sizeTag) {
				size = sizeTag;
				continue;
			}

			const typeTag = tagToType(tag);
			if (typeTag) {
				type = typeTag;
				continue;
			}
		}

		turrets[size] = { total: (turrets[size]?.total ?? 0) + 1, type };
	}

	return turrets;
}

function getWeapons(macro: Macro) {
	if (!macro.component || 'ref' in macro.component) {
		return {};
	}

	const weapons: Record<string, { total: number; type: string }> = {};

	const weaponTagList = macro.component.connections
		.filter((conn) => conn.tags?.includes('weapon'))
		.map((c) => c.tags?.split(' ') ?? []);

	for (const weaponTags of weaponTagList) {
		let size = Size.XS;
		let type = 'standard';

		for (const tag of weaponTags) {
			if (!tag || tag === 'weapon') {
				continue;
			}

			const sizeTag = tagToSize(tag);
			if (sizeTag) {
				size = sizeTag;
				continue;
			}

			const typeTag = tagToType(tag);
			if (typeTag) {
				type = typeTag;
				continue;
			}
		}

		weapons[size] = { total: (weapons[size]?.total ?? 0) + 1, type };
	}

	return weapons;
}

function tagToSize(tag: string) {
	return tag === 'extralarge'
		? Size.XL
		: tag === 'large'
		? Size.L
		: tag === 'medium'
		? Size.M
		: tag === 'small'
		? Size.S
		: tag === 'extrasmall'
		? Size.XS
		: null;
}

function tagToType(tag: string) {
	return tag === 'standard' ? 'standard' : tag === 'boron' ? 'boron' : null;
}
