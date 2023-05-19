import { differenceInSeconds } from 'date-fns';
import { MultiBar, Presets } from 'cli-progress';
import { readdir, stat } from 'node:fs/promises';
import chalk from 'chalk';

import type { Logger } from './logger';

export async function getAllFilesInDir(logger: Logger, dir: string, ext?: string) {
	const files: string[] = [];
	const todo = [dir];

	logger.debug(`Searching ${chalk.magenta(dir)} for files ending in ${chalk.magenta(ext)}`);

	let filesNum = 0;
	let foldersNum = 0;
	let lastUpdate = new Date();
	let next: string | undefined;
	while ((next = todo.shift())) {
		if (!ext || next.endsWith(ext)) {
			filesNum++;
			files.push(next);
		} else if (next.includes('.')) {
			filesNum++;
		} else if ((await stat(next)).isDirectory()) {
			todo.push(...(await readdir(next)).map((f) => `${next}/${f}`));
			foldersNum++;
		}

		if (differenceInSeconds(new Date(), lastUpdate) > 2) {
			logger.debug(
				`    Found ${files.length} files, searched ${filesNum} files in ${foldersNum} folders...`
			);
			lastUpdate = new Date();
		}
	}

	logger.debug(`Found ${files.length} files`);

	return files;
}

export function createMultiBars() {
	return new MultiBar(
		{ format: '{bar} | {name} | {value}/{total}', clearOnComplete: true },
		Presets.shades_classic
	);
}

export function deepMerge(
	target: Record<string, unknown>,
	...sources: Record<string, unknown>[]
): Record<string, unknown> {
	for (const source of sources) {
		for (const prop of Object.keys(source)) {
			if (!(prop in target)) {
				target[prop] = source[prop];
			} else if (typeof target[prop] !== typeof source[prop]) {
				console.error('Different property types:', prop, target[prop], '<-->', source[prop]);
			} else if (typeof target[prop] === 'object') {
				target[prop] = deepMerge(
					target[prop] as Record<string, unknown>,
					source[prop] as Record<string, unknown>
				);
			} else {
				target[prop] = source[prop];
			}
		}
	}

	return target;
}
