import { format } from 'date-fns';
import { inspect } from 'node:util';
import chalk, { type ChalkInstance } from 'chalk';
import type { MultiBar } from 'cli-progress';

export class Logger {
	private readonly name: string;
	private readonly logName: string;

	private bars: MultiBar | null = null;

	public constructor(name: string) {
		this.name = name;
		this.logName = chalk.cyan(this.name);

		this.debug = this.log.bind(this, chalk.gray, `[${chalk.gray('DEBUG')}]`);
		this.info = this.log.bind(this, chalk.white, `[${chalk.white('INFO')}]`);
		this.warn = this.log.bind(this, chalk.yellow, `[${chalk.yellow('WARN')}]`);
		this.error = this.log.bind(this, chalk.red, `[${chalk.red('ERROR')}]`);
	}

	public setBars(bars: MultiBar | null) {
		this.bars = bars;
	}
	public clearBars() {
		this.bars = null;
	}

	public debug: (message: unknown, ...params: unknown[]) => void;
	public info: (message: unknown, ...params: unknown[]) => void;
	public warn: (message: unknown, ...params: unknown[]) => void;
	public error: (message: unknown, ...params: unknown[]) => void;

	private log(color: ChalkInstance, type: string, message: unknown, ...params: unknown[]) {
		const date = chalk.grey(format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
		const msg = typeof message === 'string' ? message : inspect(message, { colors: false });
		const ps = params.map((p) => (typeof p === 'string' ? p : inspect(p, { colors: false })));
		const str = `${date} ${type} [${this.logName}] ${color(msg)} ${color(ps.join(' '))}`;
		if (this.bars) {
			this.bars.log(str + '\n');
		} else {
			console.log(str);
		}
	}
}
