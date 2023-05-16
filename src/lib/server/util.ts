import { readdir, stat } from 'node:fs/promises';

import type { Logger } from './logger';
import { differenceInSeconds } from 'date-fns';

export async function getAllXmlFilesInDir(logger: Logger, dir: string, part?: string) {
	const files: string[] = [];
	const todo = [dir];
	const end = `${part ?? ''}.xml`;

	logger.debug(`Searching '${dir}' for files ending in '${end}'`);

	let filesNum = 0;
	let foldersNum = 0;
	let lastUpdate = new Date();
	let next: string | undefined;
	while ((next = todo.shift())) {
		if (next.endsWith(end)) {
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
				`    Found ${files.length} XML files, searched ${filesNum} files in ${foldersNum} folders...`
			);
			lastUpdate = new Date();
		}
	}

	logger.debug(`Found ${files.length} files`);

	return files;
}
