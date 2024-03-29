import Process = NodeJS.Process;
import * as utils from "./utils";
import * as data from "./data";
import * as Argv from "./argv";
import * as Env from "./env";
import * as Config from "./config";
export type EnvfullVars<T = data.ArgItems> = {
	$: Partial<T>;
	_: Array<data.ArgValue>;
	[data.NO_PARSE_AFTER]: Array<string>;
	config: {
		used: boolean;
		path: string;
	};
	env: {
		used: boolean;
		path: string;
	};
};
function createEnvfullVars<T = data.ArgItems>(
	items: T,
	rest: Array<data.ArgValue>,
	after: Array<string>,
	config: EnvfullVars<T>["config"],
	env: EnvfullVars<T>["env"]
): EnvfullVars<T> {
	return {
		$: items,
		_: rest,
		[data.NO_PARSE_AFTER]: after,
		config,
		env,
	};
}
export function envfull<T = data.ArgItems>(
	process: Process,
	options: data.EnvfullOptions<T> = {}
): (config?: string) => EnvfullVars<T> {
	const argv = Argv.parse(process.argv.slice(2), options);
	const env = Env.enrich(Env.load(process.cwd(), options), process.env, options);
	return (config?: string) => {
		const cfg = Config.load(config, options);
		const items = utils.merge([env.$, cfg.$, argv.$]) as T;
		utils.defaults(options, items);
		return createEnvfullVars(
			items,
			argv._,
			argv[data.NO_PARSE_AFTER],
			{ path: config || "", used: cfg.used },
			{ path: Env.envFile(process.cwd()), used: env.used }
		);
	};
}
envfull.argv = Argv.parse;
envfull.env = Env.parse;
envfull.config = Config.parse;
