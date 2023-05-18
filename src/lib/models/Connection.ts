export interface Connection {
	name: string;
	group?: string;
	tags?: string;
	value?: number;
	optional?: number;
}

export interface ConnectionRef {
	ref: string;
	macro?: { ref: string; connection: string };
}

export interface ConnectionResolved<T> extends ConnectionRef {
	resolved: T | null;
}
