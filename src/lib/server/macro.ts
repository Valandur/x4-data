import { dirname } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';

import type { Macro } from '$lib/models/Macro';

import { getAllXmlFilesInDir } from './util';
import { Logger } from './logger';

const CACHE = '.cache/macro';
const CACHE_PATHS = '.cache/macro-paths';

const macros: Map<string, Macro[]> = new Map();
const logger = new Logger('macro');
const parser = new XMLParser({
	ignoreDeclaration: true,
	ignoreAttributes: false,
	parseAttributeValue: true,
	attributeNamePrefix: ''
});

logger.debug('Loading...');

let total = 0;

const cachedMacros = await readFile(CACHE, 'utf-8')
	.then((res) => JSON.parse(res))
	.catch(() => null);

if (cachedMacros) {
	for (const cachedMacro of cachedMacros) {
		macros.set(cachedMacro[0], cachedMacro[1]);
		total += cachedMacro[1].length;
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

		if (!xmlMacros.length) {
			xmlMacros = [xmlMacros];
		}

		for (const { name, class: _class, alias, component, properties } of xmlMacros) {
			const clazz = _class || 'unknown';
			let objs = macros.get(clazz);
			if (!objs) {
				objs = [];
				macros.set(clazz, objs);
			}

			objs.push({
				...properties,
				component,
				name,
				class: clazz,
				alias,
				source: fileName
			});
			total++;
		}
	}

	await mkdir(dirname(CACHE), { recursive: true });
	await writeFile(CACHE, JSON.stringify([...macros.entries()]));
}

logger.info(`Loaded ${total} macros in ${macros.size} classes`);

export const MACRO_TYPES = [...macros.entries()].map(([name, macros]) => ({
	name,
	count: macros.length
}));

export function getMacrosOfType<T extends Macro = Macro>(...types: string[]): T[] {
	return types.flatMap((type) => macros.get(type) || []) as T[];
}
