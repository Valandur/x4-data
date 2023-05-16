export interface ConnectionRef {
	ref: string;
	macro?: { ref: string; connection: string };
}

export interface ConnectionResolved<T> extends ConnectionRef {
	resolved: T | null;
}
