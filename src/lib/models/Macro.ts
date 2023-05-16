import type { ComponentRef } from './Component';
import type { ConnectionRef, ConnectionResolved } from './Connection';
import type { Properties } from './Properties';

export interface Macro {
	class: string;
	name: string;
	alias: string;
	source: string;

	component?: ComponentRef;
	properties: Properties;
	connections: (ConnectionRef | ConnectionResolved<Macro>)[];

	versions: Macro[];
}
