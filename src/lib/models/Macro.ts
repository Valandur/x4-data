import type {
	PropertyAmmunition,
	PropertyBullet,
	PropertyDamage,
	PropertyExplosionDamage,
	PropertyHeat,
	PropertyHull,
	PropertyIdentification,
	PropertyMissle,
	PropertyPeople,
	PropertyPurpose,
	PropertyRef,
	PropertyReload,
	PropertyRotationAcceleration,
	PropertyRotationSpeed,
	PropertyShip,
	PropertySoftware,
	PropertyStorage,
	PropertyThruster,
	PropertyWeapon
} from './Properties';

export interface Macro {
	class: string;
	name: string;
	alias: string;
	source: string;

	component?: PropertyRef;
	ammunition?: PropertyAmmunition;
	bullet?: PropertyBullet | PropertyRef;
	damage?: PropertyDamage;
	explosiondamage?: PropertyExplosionDamage;
	heat?: PropertyHeat;
	hull?: PropertyHull;
	identification?: PropertyIdentification;
	missle?: PropertyMissle;
	people?: PropertyPeople;
	purpose?: PropertyPurpose;
	reload?: PropertyReload;
	rotationacceleration?: PropertyRotationAcceleration;
	rotationspeed?: PropertyRotationSpeed;
	ship?: PropertyShip;
	software?: PropertySoftware;
	storage?: PropertyStorage;
	thruster?: PropertyThruster;
	weapon?: PropertyWeapon;
}
