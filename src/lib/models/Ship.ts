import type { Macro } from './Macro';
import type {
	Properties,
	PropertyHull,
	PropertyIdentification,
	PropertyPurpose,
	PropertyShip
} from './Properties';

export interface Ship extends Macro {
	properties: ShipProperties;
}

export interface ShipProperties extends Properties {
	identification: PropertyIdentification;
	purpose: PropertyPurpose;
	ship: PropertyShip;
	hull: PropertyHull;
}
