import { dirname } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import chalk from 'chalk';

import type { Component } from '$lib/models/Component';

import { Logger } from './logger';
import { defaults } from './default';

const CACHE = '.cache/components';

class ComponentService {
	public readonly logger = new Logger('COMPONENT');

	private readonly comps: Map<string, Component> = new Map();
	private readonly compsByClass: Map<string, Component[]> = new Map();

	public getTypes(): { name: string; count: number }[] {
		return [...this.compsByClass.entries()].map(([name, comps]) => ({
			name,
			count: comps.length
		}));
	}
	public getOfType(...types: string[]): Component[] {
		return types.flatMap((type) => this.compsByClass.get(type) ?? []);
	}
	public getByName(name: string): Component | undefined {
		return this.comps.get(name);
	}
	public count(): number {
		return this.comps.size;
	}

	public async setup(): Promise<boolean> {
		this.comps.clear();
		this.compsByClass.clear();

		const cache = await readFile(CACHE, 'utf-8')
			.then((res) => JSON.parse(res))
			.catch(() => null);

		if (!cache) {
			return true;
		}

		for (const comp of cache) {
			const compsOfClass = this.compsByClass.get(comp.class) || [];
			this.compsByClass.set(comp.class, compsOfClass.concat(comp));
			this.comps.set(comp.name, comp);
		}

		this.logger.debug('Restored components from cache');

		return false;
	}

	public async process(fileName: string, xml: any): Promise<void> {
		let xmlComps = xml.components?.component;
		if (!xmlComps) {
			return;
		}

		if (!('length' in xmlComps)) {
			xmlComps = [xmlComps];
		}

		for (const xmlComp of xmlComps) {
			const name = xmlComp.name;
			const clazz = xmlComp.class ?? 'unknown';

			let connections = xmlComp.connections?.connection ?? [];
			if (!('length' in connections)) {
				connections = [connections];
			}

			const comp: Component = {
				class: clazz,
				name: name,
				alias: xmlComp.alias,
				source: xmlComp.source,
				connections: connections,
				xmlSourceFile: fileName,
				duplicates: []
			};

			const other = this.comps.get(name);
			if (other) {
				this.logger.warn(`Duplicate`, chalk.white(name), chalk.magenta(fileName));
				other.duplicates.push(comp);
			} else {
				const compsOfClass = this.compsByClass.get(clazz) || [];
				this.compsByClass.set(clazz, compsOfClass.concat(comp));
				this.comps.set(name, comp);
			}
		}
	}

	public async done(): Promise<void> {
		await mkdir(dirname(CACHE), { recursive: true });
		await writeFile(CACHE, JSON.stringify([...this.comps.values()]));
	}

	public async ready(): Promise<void> {
		for (const comp of this.comps.values()) {
			const def = defaults.getByClass(comp.class);
			if (def) {
				if (def.connections) {
					comp.connections.push(...def.connections);
				}
			}
		}

		this.logger.info(
			'Loaded',
			chalk.green(this.comps.size),
			'components in',
			chalk.green(this.compsByClass.size),
			'classes'
		);
	}
}

export const components = new ComponentService();
