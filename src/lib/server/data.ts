import { dirname } from 'node:path';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';

import { createMultiBars, getAllFilesInDir } from './util';
import { Logger } from './logger';
import chalk from 'chalk';

const IN_DIR = 'data/raw';
const OUT_DIR = 'data/out';
const CACHE = '.cache/files';

export interface Subscriber {
	logger: Logger;
	process: (fileName: string, xml: any) => Promise<void>;
	done: () => Promise<void>;
}

class DataService {
	private readonly logger = new Logger('DATA');
	private readonly parser = new XMLParser({
		ignoreDeclaration: true,
		ignoreAttributes: false,
		parseAttributeValue: true,
		attributeNamePrefix: ''
	});
	private readonly subs: Set<Subscriber> = new Set();

	public get subscriberCount() {
		return this.subs.size;
	}

	public subscribe(sub: Subscriber) {
		this.subs.add(sub);
	}
	public unsubscribe(sub: Subscriber) {
		this.subs.delete(sub);
	}

	public async init(): Promise<void> {
		this.logger.debug('Loading...');

		const fileNames = await this.loadFileNames();

		this.logger.info(`Found ${chalk.green(fileNames.length)} files`);

		const allSubs = [...this.subs.values()];

		const bars = createMultiBars();
		const bar = bars.create(fileNames.length, 0);

		this.logger.setBars(bars);
		for (const sub of allSubs) {
			sub.logger.setBars(bars);
		}

		for (let i = 0; i < fileNames.length; i++) {
			const fileName = fileNames[i];
			bar.update(i, { name: fileName });

			const relFileName = fileName.substring(OUT_DIR.length);
			const xml = this.parser.parse(await readFile(fileName));

			await Promise.all(allSubs.map((sub) => sub.process(relFileName, xml)));
		}

		bar.update(fileNames.length, { name: 'Done' });
		bars.stop();

		this.logger.clearBars();
		for (const sub of allSubs) {
			sub.logger.clearBars();
		}

		this.logger.info(`Loaded ${chalk.green(fileNames.length)} files`);
		await Promise.all(allSubs.map((sub) => sub.done()));
	}

	private async loadFileNames(): Promise<string[]> {
		const cache = await readFile(CACHE, 'utf-8').catch(() => null);
		if (cache) {
			this.logger.debug('Restored file names from cache');
			return cache.split('\n');
		}

		const allFileNames: Set<string> = new Set();
		const catFileNames = await getAllFilesInDir(this.logger, IN_DIR, '.cat');

		const bars = createMultiBars();

		this.logger.setBars(bars);

		const subBar = bars.create(1, 0);
		const bar = bars.create(catFileNames.length, 0);

		for (let i = 0; i < catFileNames.length; i++) {
			const fileName = catFileNames[i];
			bar.update(i, { name: fileName });

			this.logger.debug(fileName, 'Loading');

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

			this.logger.debug(fileName, 'Found', chalk.green(files.length), 'XML files');

			if (!files.length) {
				continue;
			}

			this.logger.debug(fileName, 'Writing...');
			const subFolder = dirname(fileName).substring(IN_DIR.length);

			subBar.setTotal(files.length);
			subBar.update(0);

			const datFs = await open(fileName.replace('.cat', '.dat'));
			for (let j = 0; j < files.length; j++) {
				const file = files[j];
				subBar.update(j, { name: file.path });
				bar.update(i, { name: fileName });

				const { buffer } = await datFs.read(Buffer.alloc(file.size), 0, file.size, file.offset);
				const outFileName = `${OUT_DIR}${subFolder}/${file.path}`.toLowerCase();
				await mkdir(dirname(outFileName), { recursive: true });
				await writeFile(outFileName, buffer);
				allFileNames.add(outFileName);
			}
			await datFs.close();

			subBar.update(files.length, { name: 'Done' });

			this.logger.debug(fileName, 'Done!');
		}

		bar.update(catFileNames.length, { name: 'Done' });
		bars.stop();

		this.logger.clearBars();

		const all = [...allFileNames.values()];

		await mkdir(dirname(CACHE), { recursive: true });
		await writeFile(CACHE, all.join('\n'));

		return all;
	}
}

export const data = new DataService();

interface CatFileEntry {
	path: string;
	offset: number;
	size: number;
	ts: Date;
	hash: string;
}
