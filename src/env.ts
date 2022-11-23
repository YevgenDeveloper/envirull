import ProcessEnv = NodeJS.ProcessEnv;
import * as data from "./data";
import * as utils from "./utils";
import * as path from "path";
import * as fs from "fs";
const file = ".env";
export type ParsedEnv = {
	$: data.ArgItems;
	used: boolean;
};
function createParsedEnv(): ParsedEnv {
	return {
		$: {},
		used: false,
	};
}
export function parse<T>(content: string | Buffer, opts: data.EnvfullOptions<T> = {}): ParsedEnv {
	const env = createParsedEnv();
	content
		.toString()
		.split(data.NEWLINES_MATCH)
		.forEach(function (line) {
			const attrs = line.match(data.ENV_KEY_VAL);
			if (attrs != null) {
				const stringKey = attrs[1];
				let val = attrs[2] || "";
				val = val.trim();
				val = removeSingleQuotes(val);
				val = removeDoubleQuotes(val);
				const [where, key] = utils.loadWhere(env.$, utils.loadKey(opts, stringKey));
				where[key] = utils.value(where[key], utils.loadValue(opts, stringKey, val));
				env.used = true;
			}
		});
	return env;
}
export function enrich<T>(
	env: ParsedEnv,
	currentEnv: ProcessEnv,
	opts: data.EnvfullOptions<T> = {}
): ParsedEnv {
	loadEnvVariables(currentEnv, opts).forEach((stringKey) => {
		const [where, key] = utils.loadWhere(env.$, utils.loadKey(opts, stringKey));
		if (currentEnv[stringKey] !== undefined) {
			where[key] = utils.value(
				undefined,
				utils.loadValue(opts, stringKey, currentEnv[stringKey] || "")
			);
		}
	});
	return env;
}
export function load<T>(directory: string, opts: data.EnvfullOptions<T> = {}): ParsedEnv {
	const envPath = envFile(directory);
	const envEncoding = "utf8";
	const data = loadData(envPath, envEncoding);
	return parse(data, opts);
}
export function envFile(directory: string): string {
	return path.resolve(directory, file);
}
function loadEnvVariables<T>(
	currentEnv: ProcessEnv,
	opts: data.EnvfullOptions<T> = {}
): Array<string> {
	const envVariables = Object.keys(currentEnv);
	if (opts.env && opts.env.length > 0) {
		const keys = opts.env.filter((env) => typeof env === "string") as Array<string>;
		const regex = opts.env.filter((env) => env instanceof RegExp) as Array<RegExp>;
		return envVariables.filter((env) => keys.indexOf(env) >= 0 || loadEnvPatterns(regex, env));
	}
	return envVariables;
}
function loadEnvPatterns(regex: Array<RegExp>, env: string): boolean {
	return regex.some((rg) => Boolean(env.match(rg)));
}
function removeSingleQuotes(value: string): string {
	let val = value;
	if (val[0] === "'") {
		val = val.substr(1);
	}
	if (val[val.length - 1] === "'") {
		val = val.substr(0, val.length - 1);
	}
	return val;
}
function removeDoubleQuotes(value: string): string {
	let val = value;
	if (val[0] === '"') {
		val = val.substr(1);
	}
	if (val[val.length - 1] === '"') {
		val = val.substr(0, val.length - 1);
	}
	return val.replace(data.ENV_NEWLINES, data.ENV_NEWLINE);
}
function loadData(path: string, encoding: BufferEncoding): string {
	let data: string;
	try {
		data = fs.readFileSync(path, { encoding });
	} catch (e) {
		data = "";
	}
	return data;
}
