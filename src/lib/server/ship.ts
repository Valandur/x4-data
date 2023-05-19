import { dirname } from 'node:path';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import chalk from 'chalk';
import superagent from 'superagent';

import { Size } from '$lib/models/Constants';
import type { Macro } from '$lib/models/Macro';
import type { Ship } from '$lib/models/Ship';

import { Logger } from './logger';
import { macros } from './macro';

const IMAGE_PATH = 'data/images/ships';

class ShipService {
	public readonly logger = new Logger('SHIP');

	private ships: Ship[] = [];

	public getAll() {
		return this.ships;
	}

	public async setup(): Promise<boolean> {
		this.ships = [];

		// Ships don't need the actual XML files to be processed
		return false;
	}

	public async process(fileName: string, xml: any): Promise<void> {
		// NO-OP
	}

	public async done(): Promise<void> {
		// NO-OP
	}

	public async ready(): Promise<void> {
		const rawShips = macros.getOfType('ship_xs', 'ship_s', 'ship_m', 'ship_l', 'ship_xl');

		for (let i = 0; i < rawShips.length; i++) {
			const ship = await this.parse(rawShips[i]);
			if (!ship) {
				continue;
			}

			this.ships.push(ship);
		}

		this.logger.info('Loaded', chalk.green(this.ships.length), 'ships');
	}

	private async parse(macro: Macro): Promise<Ship | null> {
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

					const sizeTag = this.tagToSize(tag);
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

		const name = macro.name;
		const size = macro.class.substring(5).toUpperCase() as Size;

		const imgUrl = `https://roguey.co.uk/x4/ships/pics/${size.toLowerCase()}/${name}_s.jpg`;
		const imgFileName = `${IMAGE_PATH}/${size}/${name}_s.jpg`;
		if (!(await stat(imgFileName).catch(() => null))) {
			this.logger.debug(name, 'Downloading image', chalk.magenta(imgUrl));
			await mkdir(dirname(imgFileName), { recursive: true });
			const resImg = await superagent.get(imgUrl).catch(() => ({ body: Buffer.alloc(0) }));
			await writeFile(imgFileName, resImg.body);
		}

		return {
			class: macro.class,
			name: name,
			size: size,
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

	private tagToSize(tag: string) {
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
}

export const ships = new ShipService();
