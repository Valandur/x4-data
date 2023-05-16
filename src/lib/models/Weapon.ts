import type { Macro } from './Macro';
import type { Properties, PropertyIdentification, PropertyRef } from './Properties';

export interface Weapon extends Macro {
	properties: WeaponProperties;
}

export interface WeaponProperties extends Properties {
	identification: PropertyIdentification;
	bullet: PropertyRef;
}
