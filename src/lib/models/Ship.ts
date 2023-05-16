import type { Macro } from './Macro';
import type {
	PropertyHull,
	PropertyIdentification,
	PropertyPurpose,
	PropertyShip
} from './Properties';

export interface Ship extends Macro {
	identification: PropertyIdentification;
	purpose: PropertyPurpose;
	ship: PropertyShip;
	hull: PropertyHull;
}
