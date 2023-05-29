import { differenceInSeconds } from 'date-fns';
import { MultiBar, Presets } from 'cli-progress';
import { readdir, stat } from 'node:fs/promises';
import chalk from 'chalk';

import { Size } from '$lib/models/Constants';

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
	source: Record<string, unknown>,
	path?: string
): Record<string, unknown> {
	for (const prop of Object.keys(source)) {
		const targetVal = target[prop];
		const sourceVal = source[prop];

		if (!(prop in target)) {
			target[prop] = source[prop];
		} else if (typeof targetVal !== typeof sourceVal) {
			// Some special case handling because of the way we parse XML
			if (typeof targetVal === 'number' && typeof sourceVal === 'boolean') {
				// If the value in the new object is 0 or 1, but the source says it's a bool, convert
				if (targetVal === 0) {
					target[prop] = false;
				} else if (targetVal === 1) {
					target[prop] = true;
				}
			} else if (typeof targetVal === 'string' && typeof sourceVal === 'number') {
				// If the target value is a string, but the source says it's a number, try to parse
				const val = parseFloat(targetVal);
				if (Number.isFinite(val)) {
					target[prop] = val;
				}
			} else if (targetVal === '' && typeof sourceVal === 'object') {
				// If the target value is an empty string and the source is an object, replace
				target[prop] = sourceVal;
			} else {
				console.warn('Different property types', path, prop, target, source);
			}
		} else if (typeof targetVal === 'object' && targetVal !== null) {
			if (Array.isArray(targetVal)) {
				target[prop] = (targetVal as unknown[]).concat(sourceVal);
			} else {
				target[prop] = deepMerge(
					targetVal as Record<string, unknown>,
					sourceVal as Record<string, unknown>,
					(path ? path + '.' : '') + prop
				);
			}
		}
	}

	return target;
}

export function emptyStatsPerSize(): Record<Size, number> {
	return {
		[Size.XS]: 0,
		[Size.S]: 0,
		[Size.M]: 0,
		[Size.L]: 0,
		[Size.XL]: 0
	};
}
