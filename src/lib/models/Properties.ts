export interface Properties {
	ammunition?: PropertyAmmunition;
	bullet?: PropertyBullet | PropertyRef;
	cargo?: PropertyCargo;
	damage?: PropertyDamage;
	dock?: PropertyDock;
	docksize?: PropertyDockSize;
	explosiondamage?: PropertyExplosionDamage;
	heat?: PropertyHeat;
	hull?: PropertyHull;
	identification?: PropertyIdentification;
	missle?: PropertyMissle;
	people?: PropertyPeople;
	physics?: PropertyPhysics;
	purpose?: PropertyPurpose;
	reload?: PropertyReload;
	rotationacceleration?: PropertyRotationAcceleration;
	rotationspeed?: PropertyRotationSpeed;
	ship?: PropertyShip;
	software?: PropertySoftware;
	storage?: PropertyStorage;
	thruster?: PropertyThruster;
	undock?: PropertyUndock;
	weapon?: PropertyWeapon;

	[key: string]: unknown;
}

export interface PropertyAmmunition {
	tags: string;
	value: number;
	reload: number;
}

export interface PropertyBullet {
	speed: number;
	lifetime: number;
	amount: number;
	barrelamount: number;
	icon: string;
	timediff: number;
	angle: number;
	maxhits: number;
	ricochet: number;
	scale: number;
	attach: number;
}

export interface PropertyCargo {
	max: number;
	tags: string;
}

export interface PropertyDamage {
	value: number;
	repair: number;
}

export interface PropertyDock {
	external: number;
	storage?: number;
	capacity?: number;
	allow?: number;
	uselandinggear?: number;
}

export interface PropertyDockSize {
	tags: string;
}

export interface PropertyExplosionDamage {
	value: number;
	shield: number;
}

export interface PropertyHeat {
	overheat: number;
	cooldelay: number;
	coolrate: number;
	reenable: number;
}

export interface PropertyHull {
	max: number;
}

export interface PropertyIdentification {
	name: string;
	basename?: string;
	short?: string;
	variation?: string;
	shortvariation?: string;
	makerrace?: string;
	description: string;
	mark?: number;
	icon?: string;
}

export interface PropertyMissle {
	lifetime: number;
	range: number;
	icon: string;
}

export interface PropertyPeople {
	capacity: number;
}

export interface PropertyPhysics {
	mass: number;
	inertia: {
		pitch: number;
		yaw: number;
		roll: number;
	};
	drag: {
		forward: number;
		reverse: number;
		horizontal: number;
		vertical: number;
		pitch: number;
		yaw: number;
		roll: number;
	};
}

export interface PropertyPurpose {
	primary: string;
}

export interface PropertyRef {
	class: string;
}

export interface PropertyReload {
	rate: number;
	time?: number;
}

export interface PropertyRotationAcceleration {
	max: number;
}

export interface PropertyRotationSpeed {
	max: number;
}
export interface PropertyShip {
	type: string;
}

export interface PropertySoftware {
	software: {
		ware: string;
		compatible?: number;
		default?: number;
	}[];
}

export interface PropertyStorage {
	missile: number;
	unit: number;
}

export interface PropertyThruster {
	tags: string;
}

export interface PropertyUndock {
	rotate: number;
	speed: number;
	distance: number;
	allow: number;
}

export interface PropertyWeapon {
	system: string;
}
