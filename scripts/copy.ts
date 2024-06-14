import { Presets, SingleBar } from 'cli-progress';
import { copyFile, mkdir, readdir, stat } from 'fs/promises';
import { dirname } from 'path';

const dest = 'data/raw';
const sources = ['C:/Program Files (x86)/Steam/steamapps/common/X4 Foundations'];

const files: { from: string; to: string }[] = [];

console.log('Scanning...');

for (const source of sources) {
	if (!(await stat(source).catch(() => false))) {
		continue;
	}

	const dirFiles = await readdir(source, { recursive: true });
	for (const dirFile of dirFiles) {
		if ((!dirFile.endsWith('.cat') && !dirFile.endsWith('.dat')) || dirFile.includes('_sig.')) {
			continue;
		}
		if (dirFile.includes('extensions') && !dirFile.includes('ego_dlc')) {
			continue;
		}

		files.push({ from: `${source}/${dirFile}`, to: `${dest}/${dirFile}` });
	}

	break;
}

console.log('Found', files.length, 'files');

const bar = new SingleBar({}, Presets.shades_classic);
bar.start(files.length, 0);

await mkdir(dest, { recursive: true });

console.log('Copying...');
for (let i = 0; i < files.length; i++) {
	const { from, to } = files[i];
	await mkdir(dirname(to), { recursive: true });
	await copyFile(from, to);
	bar.update(i + 1);
}

bar.stop();

console.log('Done!');
