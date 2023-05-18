import type { Connection } from './Connection';

export interface Component {
	class: string;
	name: string;
	alias: string;

	source?: ComponentSource;
	connections: Connection[];

	duplicates: Component[];

	xmlSourceFile: string;
}

export interface ComponentRef {
	ref: string;
}

export interface ComponentSource {
	geometry: string;
}
