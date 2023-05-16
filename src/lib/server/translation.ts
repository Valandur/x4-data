import { dirname } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';

import { getAllXmlFilesInDir } from './util';
import { Logger } from './logger';

const CACHE = '.cache/translation';
const REGEX_REF = /{(\d+,\d+)}/gi;
const REGEX_DEFAULT = /(?<!\\)\((.*?)(?<!\\)\)/gi;
const KNOWN_LANGS: Record<string, string> = {
	'44': 'en',
	'49': 'de',
	'33': 'fr',
	'39': 'it',
	'7': 'ru',
	'34': 'es',
	'55': 'pt',
	'48': 'pl',
	'86': 'zh',
	'88': 'zh-cht',
	'82': 'kr',
	'81': 'jp'
};

const languages: Map<string, string> = new Map();
const translations: Map<string, Map<string, string>> = new Map();
const logger = new Logger('translation');
const parser = new XMLParser({
	ignoreDeclaration: true,
	ignoreAttributes: false,
	attributeNamePrefix: ''
});

logger.debug('Loading...');

const cache = await readFile(CACHE, 'utf-8')
	.then((res) => JSON.parse(res))
	.catch(() => null);

if (cache) {
	for (const cachedLanguage of cache.languages) {
		languages.set(cachedLanguage[0], cachedLanguage[1]);
	}
	for (const cachedTranslation of cache.translations) {
		translations.set(cachedTranslation[0], new Map(cachedTranslation[1]));
	}
	logger.debug('Restored languages & translations from cache');
} else {
	const xmlLangs = parser.parse(await readFile('dump/libraries/languages.xml'));
	const rawLangs: { id: string; name: string }[] = xmlLangs.languages.language;

	logger.debug(`Found ${rawLangs.length} supported languages`);

	const tFileNames = await getAllXmlFilesInDir(logger, 'dump/t');
	for (const tFileName of tFileNames) {
		const tObj = parser.parse(await readFile(tFileName));
		const id = tObj.language.id;
		const shortCode = KNOWN_LANGS[id] ?? id;
		const name = rawLangs.find((l) => l.id === id)?.name ?? id;
		languages.set(shortCode, name);

		const ts: Map<string, string> = new Map();
		for (const page of tObj.language.page) {
			if (!page.t.length) {
				page.t = [page.t];
			}
			for (const translation of page.t) {
				ts.set(`${page.id},${translation.id}`, translation['#text']);
			}
		}
		translations.set(shortCode, ts);
	}

	await mkdir(dirname(CACHE), { recursive: true });
	await writeFile(
		CACHE,
		JSON.stringify({
			languages: [...languages.entries()],
			translations: [...translations.entries()].map(([key, value]) => [key, [...value.entries()]])
		})
	);
}

logger.info(`Loaded ${languages.size} languages`);

export const LANGUAGES = [...languages.entries()].map(([key, name]) => ({ key, name }));

export function t(key: string, lang: string): string;
export function t<T>(obj: T, lang: string, depth?: number): T;
export function t<T>(keyOrObj: string | T, lang: string, depth = 2): string | T | object {
	if (typeof keyOrObj === 'string') {
		return keyOrObj
			.replaceAll(REGEX_DEFAULT, '')
			.replaceAll(REGEX_REF, (_, ref) => {
				const res = translations.get(lang)?.get(ref);
				if (!res) {
					console.warn(`Could not find translation ${_} in ${lang}`);
					return _;
				} else {
					return t(res, lang);
				}
			})
			.replaceAll('\\(', '(')
			.replaceAll('\\)', ')');
	} else if (Array.isArray(keyOrObj)) {
		const clone = [...keyOrObj];
		for (let i = 0; i < clone.length; i++) {
			if (typeof clone[i] === 'string') {
				clone[i] = t(clone[i], lang);
			} else if (typeof clone[i] === 'object' && clone[i] !== null && depth > 0) {
				clone[i] = t(clone[i], lang, depth - 1);
			}
		}
		return clone;
	} else {
		const clone = { ...keyOrObj };
		for (const key in clone) {
			if (typeof clone[key] === 'string') {
				clone[key] = t(clone[key], lang);
			} else if (typeof clone[key] === 'object' && clone[key] !== null && depth > 0) {
				clone[key] = t(clone[key], lang, depth - 1);
			}
		}
		return clone;
	}
}
