import { readdir, stat } from 'fs/promises';

const locations = ['C:\\Program Files (x86)\\Steam\\steamapps\\common\\X4 Foundations'];

for (const location of locations) {
	console.log(location);
	if (!(await stat(location).catch(() => false))) {
		continue;
	}

	const files = await readdir(location, { recursive: true });
	for (const file of files) {
		if (file.endsWith('.cat') || file.endsWith('.dat')) {
			console.log(file);
		}
	}
}
