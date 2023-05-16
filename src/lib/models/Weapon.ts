import type { Macro } from './Macro';
import type { PropertyIdentification, PropertyRef } from './Properties';

export interface Weapon extends Macro {
	identification: PropertyIdentification;
	bullet: PropertyRef;
}
