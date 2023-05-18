import type { Component, ComponentRef } from './Component';
import type { ConnectionRef, ConnectionResolved } from './Connection';
import type { Properties } from './Properties';

export interface Macro {
	class: string;
	name: string;
	alias: string;

	component?: ComponentRef | Component;
	properties: Properties;
	connections: (ConnectionRef | ConnectionResolved<Macro>)[];

	duplicates: Macro[];

	xmlSourceFile: string;
}
