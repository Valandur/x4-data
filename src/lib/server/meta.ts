import { basename, dirname } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { Logger } from './logger';

const CACHE = '.cache/meta';

class MetaService {
	public readonly logger = new Logger('META');

	private _version: string = '';
	private _tag: string = '';

	public get version() {
		return this._version;
	}

	public get tag() {
		return this._tag;
	}

	public async setup(): Promise<boolean> {
		this._version = '';
		this._tag = '';

		const cache = await readFile(CACHE, 'utf-8')
			.then((res) => JSON.parse(res))
			.catch(() => null);

		if (!cache) {
			return true;
		}

		this._version = cache.version;
		this._tag = cache.tag;

		this.logger.debug('Restored meta from cache');

		return false;
	}

	public async process(fileName: string, _: any, content: string): Promise<void> {
		const name = basename(fileName);
		if (name === 'version.dat') {
			this._version = `${content.substring(0, 1)}.${content.substring(1).trim()}`;
		} else if (name === 'beta.dat') {
			this._tag = content.trim();
		}
	}

	public async done(): Promise<void> {
		await mkdir(dirname(CACHE), { recursive: true });
		await writeFile(CACHE, JSON.stringify({ version: this.version, tag: this.tag }), 'utf-8');
	}

	public async ready(): Promise<void> {
		this.logger.info('Loaded meta');
	}
}

export const meta = new MetaService();
