import type { CargoType, Size } from './Constants';

export interface Ship {
	class: string;
	name: string;
	size: Size;
	type: string;
	purpose: string;
	ident: string;
	crew: number;
	hull: number;
	timeToMaxSpeed: number;
	engines: Record<Size, number>;
	shields: Record<Size, number>;
	weapons: Record<Size, number>;
	turrets: Record<Size, number>;
	docks: Record<Size, number>;
	hangars: Record<Size, number>;
	cargo: Record<CargoType, number>;
	massPerEngine: Record<Size, number>;
	dragPerEngine: Record<Size, number>;
}
