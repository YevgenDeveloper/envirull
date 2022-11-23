import * as path from "path";
import * as fs from "fs";
import * as data from "./data";
import * as utils from "./utils";
export enum SupportedType {
	JSON = ".json",
}
export type ParsedConfig = {
	$: data.ArgItems;
	type: SupportedType;
	used: boolean;
};
function createParsedConfig(type: SupportedType): ParsedConfig {
	return {
		$: {},
		type: type,
		used: false,
	};
}
export function parse<T>(
	type: SupportedType,
	content: string,
	opts: data.EnvfullOptions<T> = {}
): ParsedConfig {
	const config = createParsedConfig(type);
	if (type === SupportedType.JSON) {
		return parseJson(config, content, opts);
	}
	return config;
}
export function load<T>(pth: string | undefined, opts: data.EnvfullOptions<T> = {}): ParsedConfig {
	if (!pth) {
		return createParsedConfig(SupportedType.JSON);
	}
	const configPath = path.resolve(pth);
	const configType = getType(path.extname(configPath));
	if (configType) {
		const data = loadData(configPath);
		if (data !== null) {
			return parse(configType, data, opts);
		}
	}
	return createParsedConfig(SupportedType.JSON);
}
function parseJson<T>(
	config: ParsedConfig,
	content: string,
	opts: data.EnvfullOptions<T> = {}
): ParsedConfig {
	const json = toJson(content);
	parseProp("", json, (stringKey: string, value: any) => {
		const [where, key] = utils.loadWhere(config.$, utils.loadKey(opts, stringKey));
		if (value !== null && value !== undefined) {
			where[key] = utils.value(where[key], utils.loadValue(opts, stringKey, value));
		}
	});
	config.used = true;
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
function getType(ext: string): SupportedType | null {
	const extension = ext.toLowerCase();
	if (extension === ".json") {
		return SupportedType.JSON;
	}
	return null;
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
