import { differenceInSeconds } from 'date-fns';
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
