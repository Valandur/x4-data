import { normalize, resolve as resolvePath } from 'node:path';
import { readFile } from 'node:fs/promises';
import { error, type Handle, type HandleServerError } from '@sveltejs/kit';

import { components } from '$lib/server/component';
import { data } from '$lib/server/data';
import { defaults } from '$lib/server/default';
import { i18n } from '$lib/server/i18n';
import { Logger } from '$lib/server/logger';
import { macros } from '$lib/server/macro';
import { ships } from '$lib/server/ship';
import { meta } from '$lib/server/meta';

const logger = new Logger('MAIN');

await init();

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	if (path.startsWith('/data/images/')) {
		const file = await readFile(resolvePath('.' + normalize(path))).catch(() => null);
		if (!file) {
			throw error(404);
		}

		return new Response(file, { status: 200 });
	}

	return resolve(event);
};

export const handleError: HandleServerError = async ({ error, event }) => {
	logger.error(error);
	return {
		message: error instanceof Error ? error.message : JSON.stringify(error),
		key: 'unhandled',
		params: { route: event.route, error: JSON.parse(JSON.stringify(error)) }
	};
};

async function init() {
	logger.info('Starting...');

	if (await i18n.setup()) {
		data.subscribe(i18n);
	}
	if (await defaults.setup()) {
		data.subscribe(defaults);
	}
	if (await macros.setup()) {
		data.subscribe(macros);
	}
	if (await components.setup()) {
		data.subscribe(components);
	}
	if (await ships.setup()) {
		data.subscribe(ships);
	}
	if (await meta.setup()) {
		data.subscribe(meta);
	}

	await data.init();

	data.unsubscribe(i18n);
	data.unsubscribe(defaults);
	data.unsubscribe(macros);
	data.unsubscribe(components);
	data.unsubscribe(ships);
	data.unsubscribe(meta);

	await i18n.ready();
	await defaults.ready();
	await macros.ready();
	await components.ready();
	await ships.ready();
	await meta.ready();

	logger.info('Ready!');
}
