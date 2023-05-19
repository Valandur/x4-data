import type { Connection } from './Connection';
import type { Properties } from './Properties';

export interface Default {
	properties?: Properties;
	connections?: Connection[];
}
