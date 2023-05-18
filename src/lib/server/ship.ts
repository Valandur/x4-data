import { Size } from '$lib/models/Constants';
import type { Macro } from '$lib/models/Macro';
import type { Ship } from '$lib/models/Ship';

import { getMacrosOfType } from './data';

const rawShips = getMacrosOfType('ship_xs', 'ship_s', 'ship_m', 'ship_l', 'ship_xl');

const ships = rawShips.map((s) => macroToShip(s)).filter((s) => !!s) as Ship[];

export function getAllShips() {
	return ships;
}

function macroToShip(macro: Macro): Ship | null {
	// Exclude ships:
	// - with alias (usually used only internally)
	// - without properties/identification (should only be the dummy ship)
	// - without ship property (should only be the boarding pod)
	if (macro.alias || !macro.properties.identification || !macro.properties.ship) {
		return null;
	}

	const engines: Record<string, number> = {};
	const shields: Record<string, number> = {};
	const weapons: Record<string, number> = {};
	const turrets: Record<string, number> = {};
	const cargo: Record<string, number> = {};
	const docks: Record<string, number> = {};
	const hangars: Record<string, number> = {};

	const otherMacros = macro.connections.map((c) =>
		'resolved' in c && c.resolved ? c.resolved : null
	);
	while (otherMacros.length > 0) {
		const otherMacro = otherMacros.shift();
		if (!otherMacro) {
			continue;
		}

		const dockSizeTags = otherMacro.properties.docksize?.tags.split(' ');
		if (dockSizeTags) {
			for (const tag of dockSizeTags) {
				if (!tag.startsWith('dock_')) {
					continue;
				}

				const size = tag.substring(5).toUpperCase() as Size;
				if (otherMacro.properties.dock?.external) {
					docks[size] = (docks[size] ?? 0) + 1;
				} else if (otherMacro.properties.dock?.storage) {
					hangars[size] = (hangars[size] ?? 0) + (otherMacro.properties.dock.capacity ?? 0);
				}
			}
		}

		const cargoTypes = otherMacro.properties.cargo?.tags.toUpperCase().split(' ');
		if (cargoTypes) {
			for (const type of cargoTypes) {
				cargo[type] = (cargo[type] ?? 0) + (otherMacro.properties.cargo?.max ?? 0);
			}
		}

		otherMacros.push(
			...otherMacro.connections.map((c) => ('resolved' in c && c.resolved ? c.resolved : null))
		);
	}

	if (macro.component && !('ref' in macro.component)) {
		for (const conn of macro.component.connections) {
			if (!conn.tags) {
				continue;
			}

			const tags = conn.tags.split(' ');

			let size = Size.XS;
			for (const tag of tags) {
				if (!tag || tag === 'engine') {
					continue;
				}

				const sizeTag = tagToSize(tag);
				if (sizeTag) {
					size = sizeTag;
					continue;
				}
			}

			if (tags.includes('engine')) {
				engines[size] = (engines[size] ?? 0) + 1;
			} else if (tags.includes('shield')) {
				shields[size] = (shields[size] ?? 0) + 1;
			} else if (tags.includes('weapon')) {
				weapons[size] = (weapons[size] ?? 0) + 1;
			} else if (tags.includes('turret')) {
				turrets[size] = (turrets[size] ?? 0) + 1;
			}
		}
	}

	return {
		class: macro.class,
		name: macro.name,
		size: macro.class.substring(5).toUpperCase() as Size,
		type: macro.properties.ship.type,
		purpose: macro.properties.purpose?.primary ?? '-',
		ident: macro.properties.identification.name,
		crew: macro.properties.people?.capacity,
		hull: macro.properties.hull?.max,
		engines,
		shields,
		weapons,
		turrets,
		cargo,
		docks,
		hangars
	};
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
