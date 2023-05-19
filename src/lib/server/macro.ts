import { dirname } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import chalk from 'chalk';

import type { Macro } from '$lib/models/Macro';

import { components } from './component';
import { Logger } from './logger';
import { defaults } from './default';
import { deepMerge } from './util';

const CACHE = '.cache/macros';

class MacroService {
	public readonly logger = new Logger('MACRO');

	private readonly macros: Map<string, Macro> = new Map();
	private readonly macrosByClass: Map<string, Macro[]> = new Map();

	public getTypes(): { name: string; count: number }[] {
		return [...this.macrosByClass.entries()].map(([name, macros]) => ({
			name,
			count: macros.length
		}));
	}
	public getOfType(...types: string[]): Macro[] {
		return types.flatMap((type) => this.macrosByClass.get(type) ?? []);
	}
	public getByName(name: string): Macro | undefined {
		return this.macros.get(name);
	}

	public async setup(): Promise<boolean> {
		this.macros.clear();
		this.macrosByClass.clear();

		const cache = await readFile(CACHE, 'utf-8')
			.then((res) => JSON.parse(res))
			.catch(() => null);

		if (!cache) {
			return true;
		}

		for (const macro of cache) {
			const macrosOfClass = this.macrosByClass.get(macro.class) || [];
			this.macrosByClass.set(macro.class, macrosOfClass.concat(macro));
			this.macros.set(macro.name, macro);
		}

		this.logger.debug('Restored macros from cache');

		return false;
	}

	public async process(fileName: string, xml: any): Promise<void> {
		let xmlMacros = xml.macros?.macro;
		if (!xmlMacros) {
			return;
		}

		if (!('length' in xmlMacros)) {
			xmlMacros = [xmlMacros];
		}

		for (const xmlMacro of xmlMacros) {
			const name = xmlMacro.name;
			const clazz = xmlMacro.class ?? 'unknown';

			let connections = xmlMacro.connections?.connection ?? [];
			if (!('length' in connections)) {
				connections = [connections];
			}

			let properties = xmlMacro.properties ?? {};
			if (typeof properties !== 'object') {
				properties = {};
			}

			const macro: Macro = {
				class: clazz,
				name: name,
				alias: xmlMacro.alias,
				component: xmlMacro.component,
				properties: properties,
				connections: connections,
				xmlSourceFile: fileName,
				duplicates: []
			};

			const other = this.macros.get(name);
			if (other) {
				this.logger.warn(`Duplicate`, chalk.white(name), chalk.magenta(fileName));
				other.duplicates.push(macro);
			} else {
				const macrosOfClass = this.macrosByClass.get(clazz) ?? [];
				this.macrosByClass.set(clazz, macrosOfClass.concat(macro));
				this.macros.set(name, macro);
			}
		}
	}

	public async done(): Promise<void> {
		await mkdir(dirname(CACHE), { recursive: true });
		await writeFile(CACHE, JSON.stringify([...this.macros.values()]));
	}

	public async ready(): Promise<void> {
		for (const macro of this.macros.values()) {
			const def = defaults.getByClass(macro.class);
			if (def) {
				if (def.properties) {
					deepMerge(macro.properties, def.properties);
				}
			}

			if (macro.component && 'ref' in macro.component) {
				const component = components.getByName(macro.component.ref);
				if (component) {
					macro.component = component;
				} else {
					this.logger.warn(
						'Could not find referenced component',
						chalk.white(macro.component.ref),
						chalk.magenta(macro.xmlSourceFile)
					);
				}
			}

			for (let i = 0; i < macro.connections.length; i++) {
				const conn = macro.connections[i];
				if (!conn.macro) {
					continue;
				}

				const otherMacro = this.macros.get(conn.macro.ref) || null;
				macro.connections[i] = {
					...conn,
					resolved: otherMacro
				};
			}
		}

		this.logger.info(
			'Loaded',
			chalk.green(this.macros.size),
			'macros in',
			chalk.green(this.macrosByClass.size),
			'classes'
		);
	}
}

export const macros = new MacroService();
