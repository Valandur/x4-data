import { format } from 'date-fns';
import { inspect } from 'node:util';
import chalk from 'chalk';

export class Logger {
	public constructor(private readonly moduleName: string) {}

	public debug(message: unknown, ...params: unknown[]) {
		const msg = chalk.gray(typeof message === 'string' ? message : inspect(message));
		console.log(
			`${this.getDate()} [${chalk.gray('DEBUG')}] [${chalk.green(this.moduleName)}] ${msg}`,
			...params
		);
	}

	public info(message: unknown, ...params: unknown[]) {
		const msg = typeof message === 'string' ? message : inspect(message);
		console.log(
			`${this.getDate()} [${chalk.cyan('INFO')}] [${chalk.green(this.moduleName)}] ${msg}`,
			...params
		);
	}

	public warn(message: unknown, ...params: unknown[]) {
		const msg = chalk.yellow(typeof message === 'string' ? message : inspect(message));
		console.log(
			`${this.getDate()} [${chalk.yellow('WARN')}] [${chalk.green(this.moduleName)}] ${msg}`,
			...params
		);
	}

	public error(message: unknown, ...params: unknown[]) {
		const msg = chalk.red(typeof message === 'string' ? message : inspect(message));
		console.error(
			`${this.getDate()} [${chalk.red('ERROR')}] [${chalk.green(this.moduleName)}] ${msg}`,
			...params
		);
	}

	private getDate() {
		return chalk.grey(format(new Date(), 'HH:mm:ss'));
	}
}
