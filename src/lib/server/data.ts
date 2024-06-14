import { dirname, extname } from 'node:path';
import { copyFile, mkdir, open, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';
import chalk from 'chalk';

import { createMultiBars } from './util';
import { Logger } from './logger';

const IN_DIR = 'data/raw';
const OUT_DIR = 'data/out';
const CACHE = '.cache/files';

export interface Subscriber {
	logger: Logger;
	process: (fileName: string, xml: any, content: string) => Promise<void>;
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

		if (this.subscriberCount === 0) {
			this.logger.debug('No subscribers, skipping load');
			return;
		}

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
			const fileContent = await readFile(fileName, 'utf-8');
			const xml = fileName.endsWith('.xml') ? this.parser.parse(fileContent) : {};
			await Promise.all(allSubs.map((sub) => sub.process(relFileName, xml, fileContent)));
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

		const relativeFileNames = await readdir(IN_DIR, { recursive: true });
		const allFileNames = relativeFileNames.map((file) => `${IN_DIR}/${file}`);
		this.logger.debug(`Found ${allFileNames.length} files`);

		const outFileNames: Set<string> = new Set();
		const datFileNames = allFileNames.filter((f) => f.endsWith('.dat'));

		const bars = createMultiBars();

		this.logger.setBars(bars);

		const subBar = bars.create(1, 0);
		const bar = bars.create(datFileNames.length, 0);

		for (let i = 0; i < datFileNames.length; i++) {
			const datFileName = datFileNames[i];
			const catFileName = datFileName.replace(/\.dat$/, '.cat');
			bar.update(i, { name: datFileName });

			this.logger.debug(datFileName, 'Loading');

			let offset = 0;
			const files: CatFileEntry[] = [];

			if (await stat(catFileName).catch(() => false)) {
				const catFs = await open(catFileName);
				for await (const line of catFs.readLines()) {
					const parts = line.split(' ');
					const hash = parts.pop() ?? '';
					const ts = new Date(Number(parts.pop()));
					const size = Number(parts.pop());
					const path = parts.join(' ');

					const type = extname(path).toLowerCase();
					if (type === '.xml') {
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

				this.logger.debug(catFileName, 'Found', chalk.green(files.length), 'XML files');

				if (!files.length) {
					continue;
				}

				this.logger.debug(catFileName, 'Writing...');
				const subFolder = dirname(catFileName).substring(IN_DIR.length);

				subBar.setTotal(files.length);
				subBar.update(0);

				const datFs = await open(datFileName);
				for (let j = 0; j < files.length; j++) {
					const file = files[j];
					subBar.update(j, { name: file.path });
					bar.update(i, { name: datFileName });

					const { buffer } = await datFs.read(Buffer.alloc(file.size), 0, file.size, file.offset);
					const outFileName = `${OUT_DIR}${subFolder}/${file.path}`.toLowerCase();
					await mkdir(dirname(outFileName), { recursive: true });
					await writeFile(outFileName, buffer);
					outFileNames.add(outFileName);
				}
				await datFs.close();
			} else {
				const newFileName = datFileName.substring(IN_DIR.length);
				const outFileName = `${OUT_DIR}${newFileName}`.toLowerCase();
				await mkdir(dirname(outFileName), { recursive: true });
				await copyFile(datFileName, outFileName);
				outFileNames.add(outFileName);
			}

			subBar.update(files.length, { name: 'Done' });

			this.logger.debug(datFileName, 'Done!');
		}

		bar.update(datFileNames.length, { name: 'Done' });
		bars.stop();

		this.logger.clearBars();

		const all = [...outFileNames.values()];

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
