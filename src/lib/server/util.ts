import { readdir, stat } from 'node:fs/promises';

import type { Logger } from './logger';

export async function getAllXmlFilesInDir(logger: Logger, dir: string, part?: string) {
	const files: string[] = [];
	const todo = [dir];
	const end = `${part || ''}.xml`;

	logger.debug(`Searching '${dir}' for files ending in '${end}'`);

	let next: string | undefined;
	while ((next = todo.shift())) {
		if (next.endsWith(end)) {
			files.push(next);
			if (files.length % 500 == 0) {
				logger.debug(`    Found ${files.length} files so far...`);
			}
		} else if (next.includes('.')) {
			continue;
		} else if ((await stat(next)).isDirectory()) {
			todo.push(...(await readdir(next)).map((f) => `${next}/${f}`));
		}
	}

	logger.debug(`Found ${files.length} files`);

	return files;
}
