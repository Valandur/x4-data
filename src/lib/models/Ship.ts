import type { Size } from './Constants';

export interface Ship {
	class: string;
	name: string;
	size: Size;
	type: string;
	purpose: string;
	ident: string;
	crew?: number;
	hull?: number;
	engines: Record<string, number>;
	shields: Record<string, number>;
	weapons: Record<string, number>;
	turrets: Record<string, number>;
	cargo: Record<string, number>;
	docks: Record<string, number>;
	hangars: Record<string, number>;
}
