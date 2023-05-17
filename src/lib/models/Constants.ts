export enum Size {
	XS = 'XS',
	S = 'S',
	M = 'M',
	L = 'L',
	XL = 'XL'
}

export const SIZES = Object.keys(Size);

export enum CargoType {
	CONDENSATE = 'CONDENSATE',
	CONTAINER = 'CONTAINER',
	LIQUID = 'LIQUID',
	SOLID = 'SOLID'
}

export const CARGO_TYPES = Object.keys(CargoType);
