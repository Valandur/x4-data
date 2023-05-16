import { getMacrosOfType } from '$lib/server/macro';
import { t } from '$lib/server/translation';
import type { Ship } from '$lib/models/Ship';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	let ships = getMacrosOfType<Ship>('ship_xs', 'ship_s', 'ship_m', 'ship_l', 'ship_xl');

	const { lang } = await parent();

	// Exclude ships:
	// - with alias (usually used only internally
	// - without identification (should only be the dummy ship)
	// - without ship property (should only be the boarding pod)
	ships = ships.filter((s) => !s.alias && !!s.identification && !!s.ship).map((s) => t(s, lang));

	return {
		ships
	};
};
