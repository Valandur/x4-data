import { dirname } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';

import type { Macro } from '$lib/models/Macro';

import { getAllXmlFilesInDir } from './util';
import { Logger } from './logger';

const CACHE = '.cache/macro';
const CACHE_PATHS = '.cache/macro-paths';

const macros: Map<string, Macro> = new Map();
const byClass: Map<string, Macro[]> = new Map();
const logger = new Logger('macro');
const parser = new XMLParser({
	ignoreDeclaration: true,
	ignoreAttributes: false,
	parseAttributeValue: true,
	attributeNamePrefix: ''
});

logger.debug('Loading...');

const cache = await readFile(CACHE, 'utf-8')
	.then((res) => JSON.parse(res))
	.catch(() => null);

if (cache) {
	for (const cachedMacro of cache) {
		byClass.set(cachedMacro.class, (byClass.get(cachedMacro.class) || []).concat(cachedMacro));
		macros.set(cachedMacro.name, cachedMacro);
	}
	logger.debug('Restored macros from cache');
} else {
	let macroFiles: string[] = [];

	const cachedMacroFiles = await readFile(CACHE_PATHS, 'utf-8').catch(() => null);
	if (cachedMacroFiles) {
		macroFiles = cachedMacroFiles.split('\n');
		logger.debug('Restored macro file paths from cache');
	} else {
		macroFiles = await getAllXmlFilesInDir(logger, 'dump', 'macro');
		await mkdir(dirname(CACHE_PATHS), { recursive: true });
		await writeFile(CACHE_PATHS, macroFiles.join('\n'));
	}

	for (const fileName of macroFiles) {
		const fileObj = parser.parse(await readFile(fileName));
		let xmlMacros = fileObj.macros.macro;
		if (!xmlMacros) {
			continue;
		}

		if (!('length' in xmlMacros)) {
			xmlMacros = [xmlMacros];
		}

		for (const xmlMacro of xmlMacros) {
			const name = xmlMacro.name;
			const clazz = xmlMacro.class ?? 'unknown';
			let objs = byClass.get(clazz);
			if (!objs) {
				objs = [];
				byClass.set(clazz, objs);
			}

			let connections = xmlMacro.connections?.connection ?? [];
			if (!('length' in connections)) {
				connections = [connections];
			}

			const macro: Macro = {
				class: clazz,
				name: name,
				alias: xmlMacro.alias,
				component: xmlMacro.component,
				properties: xmlMacro.properties ?? {},
				connections: connections,
				source: fileName,
				versions: []
			};

			const other = macros.get(name);
			if (other) {
				other.versions.push(macro);
			} else {
				objs.push(macro);
				macros.set(name, macro);
			}
		}
	}

	await mkdir(dirname(CACHE), { recursive: true });
	await writeFile(CACHE, JSON.stringify([...macros.values()]));
}

for (const macro of macros.values()) {
	if (!macro.connections) {
		continue;
	}

	for (let i = 0; i < macro.connections.length; i++) {
		const conn = macro.connections[i];
		if (!conn.macro) {
			continue;
		}

		const otherMacro = macros.get(conn.macro.ref) || null;
		macro.connections[i] = {
			...conn,
			resolved: otherMacro
		};
	}
}

logger.info(`Loaded ${macros.size} macros in ${byClass.size} classes`);

export const MACRO_TYPES = [...byClass.entries()].map(([name, macros]) => ({
	name,
	count: macros.length
}));

export function getMacrosOfType<T extends Macro = Macro>(...types: string[]): T[] {
	return types.flatMap((type) => byClass.get(type) ?? []) as T[];
}
