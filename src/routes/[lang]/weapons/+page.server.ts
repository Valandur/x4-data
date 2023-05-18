import { getMacrosOfType } from '$lib/server/data';
import { t } from '$lib/server/translation';
import type { Weapon } from '$lib/models/Weapon';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	let weapons = getMacrosOfType<Weapon>('weapon', 'turret');

	const { lang } = await parent();

	// Exclude weapons:
	// - with alias (usually used only internally)
	weapons = weapons.filter((w) => !w.alias).map((w) => t(w, lang));

	return {
		weapons
	};
};
