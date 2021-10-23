import ProcessEnv = NodeJS.ProcessEnv;
import * as data from "./data";
import * as utils from "./utils";
import * as path from "path";
import * as fs from "fs";
const file = ".env";
export type ParsedEnv = {
	$: data.ArgItems;
}
function createParsedEnv(): ParsedEnv {
	return {
		$: {}
	}
}
export function parse(content: string | Buffer, opts: data.EnvfullOptions = {}): ParsedEnv {
	const env = createParsedEnv();
	content.toString().split(data.NEWLINES_MATCH).forEach(function (line, idx) {
		const attrs = line.match(data.ENV_KEY_VAL);
		if (attrs != null) {
			let [stringKey, val] = [attrs[1], attrs[2] || ""];
			val = val.trim();
			val = removeSingleQuotes(val);
			val = removeDoubleQuotes(val);
			const [where, key] = utils.loadWhere(env.$, utils.loadKey(opts, stringKey));
			where[key] = utils.value(where[key], utils.loadValue(opts, stringKey, val));
		}
	});
	return env;
}
export function enrich(env: ParsedEnv, currentEnv: ProcessEnv, opts: data.EnvfullOptions = {}): ParsedEnv {
	Object.keys(currentEnv).forEach((stringKey) => {
		const [where, key] = utils.loadWhere(env.$, utils.loadKey(opts, stringKey));
		if (currentEnv[stringKey] !== undefined) {
			where[key] = utils.value(undefined, utils.loadValue(opts, stringKey, currentEnv[stringKey]!));
		}
	});
	return env;
}
export function load(directory: string, opts: data.EnvfullOptions = {}): ParsedEnv {
	const envPath = path.resolve(directory, file);
	const envEncoding = 'utf8';
	const data = loadData(envPath, envEncoding);
	return parse(data, opts);
}
function removeSingleQuotes(value: string) {
	let val = value;
	if (val[0] === "'") {
		val = val.substr(1);
	}
	if (val[val.length - 1] === "'") {
		val = val.substr(0, val.length - 1);
	}
	return val;
}
function removeDoubleQuotes(value: string) {
	let val = value;
	if (val[0] === '"') {
		val = val.substr(1);
	}
	if (val[val.length - 1] === '"') {
		val = val.substr(0, val.length - 1);
	}
	return val.replace(data.ENV_NEWLINES, data.ENV_NEWLINE);
}
function loadData(path: string, encoding: string): string {
	let data: string;
	try {
		data = fs.readFileSync(path, { encoding });
	} catch (e) {
		data = "";
	}
	return data;
}
