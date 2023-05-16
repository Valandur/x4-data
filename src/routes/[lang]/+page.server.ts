import { LANGUAGES } from '$lib/server/translation';

import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => {
	return LANGUAGES.map((l) => ({ lang: l.key }));
};
