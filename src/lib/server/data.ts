import { dirname } from 'node:path';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';
import chalk from 'chalk';

import type { Component } from '$lib/models/Component';
import type { Macro } from '$lib/models/Macro';

import { getAllFilesInDir } from './util';
import { Logger } from './logger';

const IN_DIR = 'dump/raw';
const OUT_DIR = 'dump/out';
const CACHE_FILES = '.cache/files';
const CACHE_DATA = '.cache/data';

const logger = new Logger('data');
const parser = new XMLParser({
	ignoreDeclaration: true,
	ignoreAttributes: false,
	parseAttributeValue: true,
	attributeNamePrefix: ''
});

const macros: Map<string, Macro> = new Map();
const macrosByClass: Map<string, Macro[]> = new Map();

const components: Map<string, Component> = new Map();
const componentsByClass: Map<string, Component[]> = new Map();

logger.debug('Loading...');

const cache = await readFile(CACHE_DATA, 'utf-8')
	.then((res) => JSON.parse(res))
	.catch(() => null);

if (cache) {
	for (const cachedComponent of cache.components) {
		componentsByClass.set(
			cachedComponent.class,
			(componentsByClass.get(cachedComponent.class) || []).concat(cachedComponent)
		);
		components.set(cachedComponent.name, cachedComponent);
	}
	logger.debug('Restored components from cache');

	for (const cachedMacro of cache.macros) {
		macrosByClass.set(
			cachedMacro.class,
			(macrosByClass.get(cachedMacro.class) || []).concat(cachedMacro)
		);
		macros.set(cachedMacro.name, cachedMacro);
	}
	logger.debug('Restored macros from cache');
} else {
	let xmlFileNames: string[] = [];

	const cachedXmlFileNames = await readFile(CACHE_FILES, 'utf-8').catch(() => null);
	if (cachedXmlFileNames) {
		xmlFileNames = cachedXmlFileNames.split('\n');
		logger.debug('Restored XML file names from cache');
	} else {
		xmlFileNames = await readCatFiles(logger, IN_DIR, OUT_DIR);
		await mkdir(dirname(CACHE_FILES), { recursive: true });
		await writeFile(CACHE_FILES, xmlFileNames.join('\n'));
	}

	logger.info(`Found ${xmlFileNames.length} XML files`);

	for (const xmlFileName of xmlFileNames) {
		const file = parser.parse(await readFile(xmlFileName));

		let xmlMacros = file.macros?.macro;
		if (xmlMacros) {
			if (!('length' in xmlMacros)) {
				xmlMacros = [xmlMacros];
			}

			for (const xmlMacro of xmlMacros) {
				const macro = loadMacro(xmlFileName, xmlMacro);
				const other = macros.get(macro.name);
				if (other) {
					logger.warn(`Duplicate macro`, chalk.magenta(macro.name), macro.xmlSourceFile);
					other.duplicates.push(macro);
				} else {
					macros.set(macro.name, macro);
					macrosByClass.set(macro.class, (macrosByClass.get(macro.class) ?? []).concat(macro));
				}
			}
		}

		let xmlComponents = file.components?.component;
		if (xmlComponents) {
			if (!('length' in xmlComponents)) {
				xmlComponents = [xmlComponents];
			}

			for (const xmlComponent of xmlComponents) {
				const component = loadComponent(xmlFileName, xmlComponent);
				const other = components.get(component.name);
				if (other) {
					logger.warn(
						`Duplicate component`,
						chalk.magenta(component.name),
						component.xmlSourceFile
					);
					other.duplicates.push(component);
				} else {
					components.set(component.name, component);
					componentsByClass.set(
						component.class,
						(componentsByClass.get(component.class) ?? []).concat(component)
					);
				}
			}
		}
	}

	await mkdir(dirname(CACHE_DATA), { recursive: true });
	await writeFile(
		CACHE_DATA,
		JSON.stringify({ macros: [...macros.values()], components: [...components.values()] })
	);
}

for (const macro of macros.values()) {
	if (macro.component && 'ref' in macro.component) {
		const component = components.get(macro.component.ref);
		if (component) {
			macro.component = component;
		} else {
			logger.warn(
				'Could not find referenced component',
				chalk.magenta(macro.component.ref),
				macro.xmlSourceFile
			);
		}
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

logger.info(`Loaded ${components.size} components in ${componentsByClass.size} classes`);
logger.info(`Loaded ${macros.size} macros in ${macrosByClass.size} classes`);

export const MACRO_TYPES = [...macrosByClass.entries()].map(([name, macros]) => ({
	name,
	count: macros.length
}));

export function getMacrosOfType<T extends Macro = Macro>(...types: string[]): T[] {
	return types.flatMap((type) => macrosByClass.get(type) ?? []) as T[];
}

export const COMPONENT_TYPES = [...componentsByClass.entries()].map(([name, comps]) => ({
	name,
	count: comps.length
}));

export function getComponentsOfType<T extends Component = Component>(...types: string[]): T[] {
	return types.flatMap((type) => componentsByClass.get(type) ?? []) as T[];
}

function loadComponent(xmlFileName: string, xmlComponent: any): Component {
	const name = xmlComponent.name;
	const clazz = xmlComponent.class ?? 'unknown';

	let connections = xmlComponent.connections?.connection ?? [];
	if (!('length' in connections)) {
		connections = [connections];
	}

	return {
		class: clazz,
		name: name,
		alias: xmlComponent.alias,
		connections: connections,
		xmlSourceFile: xmlFileName,
		duplicates: []
	};
}

function loadMacro(xmlFileName: string, xmlMacro: any): Macro {
	const name = xmlMacro.name;
	const clazz = xmlMacro.class ?? 'unknown';

	let connections = xmlMacro.connections?.connection ?? [];
	if (!('length' in connections)) {
		connections = [connections];
	}

	return {
		class: clazz,
		name: name,
		alias: xmlMacro.alias,
		component: xmlMacro.component,
		properties: xmlMacro.properties ?? {},
		connections: connections,
		xmlSourceFile: xmlFileName,
		duplicates: []
	};
}

async function readCatFiles(logger: Logger, inDir: string, outDir: string): Promise<string[]> {
	const allFiles: string[] = [];

	const fileNames = await getAllFilesInDir(logger, inDir, '.cat');
	for (const fileName of fileNames) {
		if (!fileName.endsWith('.cat')) {
			continue;
		}

		logger.debug(fileName, 'Loading');

		let offset = 0;
		const files: CatFileEntry[] = [];

		const catFs = await open(fileName);
		for await (const line of catFs.readLines()) {
			const parts = line.split(' ');
			const hash = parts.pop() ?? '';
			const ts = new Date(Number(parts.pop()));
			const size = Number(parts.pop());
			const path = parts.join(' ');

			if (path.endsWith('.xml')) {
				files.push({
					path,
					offset,
					size,
					ts,
					hash
				});
			}

			offset += size;
		}
		await catFs.close();

		logger.debug(fileName, `Found ${files.length} XML files`);

		if (!files.length) {
			continue;
		}

		logger.debug(fileName, 'Writing...');
		const subFolder = dirname(fileName).substring(inDir.length);

		const datFs = await open(fileName.replace('.cat', '.dat'));
		for (const file of files) {
			const { buffer } = await datFs.read(Buffer.alloc(file.size), 0, file.size, file.offset);
			const outFileName = `${outDir}${subFolder}/${file.path}`.toLowerCase();
			await mkdir(dirname(outFileName), { recursive: true });
			await writeFile(outFileName, buffer);
			allFiles.push(outFileName);
		}
		await datFs.close();

		logger.debug(fileName, 'Done!');
	}

	return allFiles;
}

interface CatFileEntry {
	path: string;
	offset: number;
	size: number;
	ts: Date;
	hash: string;
}
