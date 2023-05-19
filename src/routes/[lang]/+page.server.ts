import { LANGUAGES } from '$lib/server/i18n';

import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => {
	return LANGUAGES.map((l) => ({ lang: l.key }));
};
