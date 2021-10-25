import * as path from "path";
import * as fs from "fs";
import * as data from "./data";
import * as utils from "./utils";
export enum SupportedType {
	JSON = ".json"
}
export type ParsedConfig = {
	$: data.ArgItems;
	type: SupportedType;
}
function createParsedConfig(type: SupportedType): ParsedConfig {
	return {
		$: {},
		type: type
	}
}
export function parse(type: SupportedType, content: string, opts: data.EnvfullOptions = {}): ParsedConfig {
	const config = createParsedConfig(type);
	switch (type) {
		case SupportedType.JSON:
			parseJson(config, content, opts);
			break;
		default:
			break;
	}
	return config;
}
function parseJson(config: ParsedConfig, content: string, opts: data.EnvfullOptions = {}): ParsedConfig {
	const json = toJson(content);
	parseProp("", json, (stringKey: string, value: any) => {
		const [where, key] = utils.loadWhere(config.$, utils.loadKey(opts, stringKey));
		if (value !== null && value !== undefined) {
			where[key] = utils.value(where[key], utils.loadValue(opts, stringKey, value));
		}
	});
	return config;
}
function parseProp(parent: string, data: Object, handler: (key: string, value: any) => void) {
	Object.keys(data).forEach((key) => {
		if (typeof data[key] === "object" && !Array.isArray(data[key])) {
			parseProp(createKey(parent, key), data[key], handler);
		} else {
			handler(createKey(parent, key), data[key]);
		}
	});
}
function createKey(parent: string, key: string): string {
	if (parent) {
		return parent + data.KEY_SEPARATOR + key;
	}
	return key;
}
function toJson(content: string): Object {
	try {
		return JSON.parse(content);
	} catch (e) {
		return {};
	}
}
export function load(pth: string | undefined, opts: data.EnvfullOptions = {}): ParsedConfig {
	if (!pth) {
		return createParsedConfig(SupportedType.JSON);
	}
	const configPath = path.resolve(pth);
	const configType = path.extname(configPath).toLowerCase() as SupportedType;
	if (SupportedType[configType]) {
		const data = loadData(configPath);
		if (data !== null) {
			return parse(configType, data, opts);
		}
	}
	return createParsedConfig(SupportedType.JSON);
}
function loadData(path: string): string | null {
	let data: string | null;
	try {
		data = fs.readFileSync(path).toString();
	} catch (e) {
		data = null;
	}
	return data;
}
