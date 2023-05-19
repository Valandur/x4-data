import { dirname } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import chalk from 'chalk';

import type { Default } from '$lib/models/Default';

import { Logger } from './logger';

const CACHE = '.cache/defaults';

class DefaultService {
	public readonly logger = new Logger('DEFAULT');

	private readonly defaults: Map<string, Default> = new Map();

	public getByClass(name: string): Default | undefined {
		return this.defaults.get(name);
	}

	public async setup(): Promise<boolean> {
		this.defaults.clear();

		const cache = await readFile(CACHE, 'utf-8')
			.then((res) => JSON.parse(res))
			.catch(() => null);

		if (!cache) {
			return true;
		}

		for (const def of cache) {
			this.defaults.set(def.class, def);
		}

		this.logger.debug('Restored defaults from cache');

		return false;
	}

	public async process(fileName: string, xml: any): Promise<void> {
		let xmlDatasets = xml.defaults?.dataset;
		if (!xmlDatasets) {
			return;
		}

		if (!('length' in xmlDatasets)) {
			xmlDatasets = [xmlDatasets];
		}

		for (const xmlDataset of xmlDatasets) {
			const clazz = xmlDataset.class;
			if (!clazz) {
				// Some datasets are for specific macros instead of classes
				// This is currently only the case for map stuff, so we're ignoring it for now
				continue;
			}

			let connections = xmlDataset.connections?.connection ?? [];
			if (!('length' in connections)) {
				connections = [connections];
			}

			const def: Default = {
				...xmlDataset,
				connections,
				xmlSourceFile: fileName
			};

			if (this.defaults.has(clazz)) {
				this.logger.warn(
					'Multiple defaults for class',
					chalk.white(clazz),
					chalk.magenta(fileName)
				);
			}

			this.defaults.set(clazz, def);
		}
	}

	public async done(): Promise<void> {
		await mkdir(dirname(CACHE), { recursive: true });
		await writeFile(CACHE, JSON.stringify([...this.defaults.values()]));
	}

	public async ready(): Promise<void> {
		this.logger.info('Loaded', chalk.green(this.defaults.size), 'defaults');
	}
}

export const defaults = new DefaultService();
