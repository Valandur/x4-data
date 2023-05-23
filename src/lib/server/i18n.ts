import { dirname } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import chalk from 'chalk';

import { Logger } from './logger';

const CACHE = '.cache/i18n';
const REGEX_REF = /{\s*(\d+)\s*,\s*(\d+)\s*}/gi;
const REGEX_DEFAULT = /(?<!\\)\((.*?)(?<!\\)\)/gi;
const KNOWN_LANGS: Record<string, string> = {
	'44': 'en',
	'49': 'de'
	// TODO: Currently disabled
	// '33': 'fr',
	// '39': 'it',
	// '7': 'ru',
	// '34': 'es',
	// '55': 'pt',
	// '48': 'pl',
	// '86': 'zh',
	// '88': 'zh-cht',
	// '82': 'kr',
	// '81': 'jp'
};

class I18NService {
	public readonly logger = new Logger('I18N');

	private readonly languages: Map<string, string> = new Map();
	private readonly translations: Map<string, Map<string, string>> = new Map();

	public getNameById(id: string): string | undefined {
		return this.languages.get(id);
	}
	public getLanguages(): [string, string][] {
		return [...this.languages.entries()];
	}

	public async setup(): Promise<boolean> {
		this.languages.clear();
		this.translations.clear();

		const cache = await readFile(CACHE, 'utf-8')
			.then((res) => JSON.parse(res))
			.catch(() => null);

		if (!cache) {
			return true;
		}

		for (const lang of cache.languages) {
			this.languages.set(lang[0], lang[1]);
		}
		for (const trans of cache.translations) {
			this.translations.set(trans[0], new Map(trans[1]));
		}

		this.logger.debug('Restored macros from cache');

		return false;
	}

	public async process(fileName: string, xml: any): Promise<void> {
		const xmlLangs = xml.languages?.language;
		if (xmlLangs) {
			for (const xmlLang of xmlLangs) {
				const shortCode = KNOWN_LANGS[xmlLang.id];
				if (shortCode) {
					this.languages.set(shortCode, xmlLang.name);
				}
			}

			return;
		}

		if (!xml.language) {
			return;
		}

		const id = xml.language.id;
		const shortCode = KNOWN_LANGS[id];
		if (!shortCode) {
			return;
		}

		const ts: Map<string, string> = new Map();
		for (const page of xml.language.page) {
			if (!page.t.length) {
				page.t = [page.t];
			}
			for (const translation of page.t) {
				ts.set(`${page.id},${translation.id}`, translation['#text']);
			}
		}
		this.translations.set(shortCode, ts);
	}

	public async done(): Promise<void> {
		await mkdir(dirname(CACHE), { recursive: true });
		await writeFile(
			CACHE,
			JSON.stringify({
				languages: [...this.languages.entries()],
				translations: [...this.translations.entries()].map(([key, value]) => [
					key,
					[...value.entries()]
				])
			})
		);
	}

	public async ready(): Promise<void> {
		this.logger.info('Loaded', chalk.green(this.languages.size), 'languages');
	}

	public t(key: string, lang: string): string;
	public t<T>(obj: T, lang: string, depth?: number): T;
	public t<T>(keyOrObj: string | T, lang: string, depth = 2): string | T | object {
		if (typeof keyOrObj === 'string') {
			return keyOrObj
				.replaceAll(REGEX_DEFAULT, '')
				.replaceAll(REGEX_REF, (_, pageId, tId) => {
					const res = this.translations.get(lang)?.get(`${pageId},${tId}`);
					if (!res) {
						console.warn(`Could not find translation ${_} in ${lang}`);
						return _;
					} else {
						return this.t(res, lang);
					}
				})
				.replaceAll('\\(', '(')
				.replaceAll('\\)', ')');
		} else if (Array.isArray(keyOrObj)) {
			const clone = [...keyOrObj];
			for (let i = 0; i < clone.length; i++) {
				if (typeof clone[i] === 'string') {
					clone[i] = this.t(clone[i], lang);
				} else if (typeof clone[i] === 'object' && clone[i] !== null && depth > 0) {
					clone[i] = this.t(clone[i], lang, depth - 1);
				}
			}
			return clone;
		} else {
			const clone = { ...keyOrObj };
			for (const key in clone) {
				if (typeof clone[key] === 'string') {
					clone[key] = this.t(clone[key], lang);
				} else if (typeof clone[key] === 'object' && clone[key] !== null && depth > 0) {
					clone[key] = this.t(clone[key], lang, depth - 1);
				}
			}
			return clone;
		}
	}
}

export const i18n = new I18NService();
