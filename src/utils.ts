import * as data from "./data";
export function defaults<T = data.ArgItems>(opts: data.EnvfullOptions<T>, items: T) {
	const defaults = loadDefaults(opts.defaults || {});
	Object.keys(defaults).forEach((k) => {
		const [where, key] = loadWhere(items, loadKey(opts, k));
		if (where[key] === undefined) {
			where[key] = value(where[key], defaults[k]);
		}
	});
}
export function value(oldValue: data.ArgItem | undefined, value: data.ArgValue | Array<data.ArgValue>): data.ArgValue | Array<data.ArgValue> {
	if (oldValue === undefined) {
		return value;
	}
	if (Array.isArray(oldValue) && Array.isArray(value)) {
		const arr = oldValue as Array<data.ArgValue>;
		return arr.concat(value as Array<data.ArgValue>);
	}
	if (Array.isArray(oldValue)) {
		const arr = oldValue as Array<data.ArgValue>;
		arr.push(value as data.ArgValue);
		return arr;
	}
	if (!Array.isArray(oldValue) && Array.isArray(value)) {
		const arr = value as Array<data.ArgValue>;
		const old = oldValue as data.ArgValue;
		return [old, ...arr];
	}
	return [oldValue, value] as Array<data.ArgValue>;
}
export function loadWhere<T>(items: T, keyString: string): [T, string] {
	const keys = keyString.split(data.KEY_SEPARATOR);
	const key = keys[keys.length - 1];
	let o = items;
	keys.slice(0, -1).forEach(function (key) {
		o[key] = o[key] || {};
		o = o[key] as T;
	});
	return [o, key];
}
export function loadKey<T>(opts: data.EnvfullOptions<T>, key: string): string {
	const aliases = loadAliases(opts.aliases || {});
	const isMain = Boolean(aliases[key]);
	if (isMain) {
		return key;
	}
	const keys = Object.keys(aliases);
	for (let i = 0; i < keys.length; i++) {
		const mainKey = keys[i];
		if (aliases[mainKey].indexOf(key) >= 0) {
			return mainKey;
		}
	}
	return key;
}
export function loadValue<T>(opts: data.EnvfullOptions<T>, key: string, value: string): data.ArgValue | Array<data.ArgValue> {
	if (opts.arrays && opts.arrays.indexOf(key) >= 0) {
		return [asTyped(value)];
	}
	if (opts.booleans && opts.booleans.indexOf(key) >= 0) {
		return asBoolean(value)[1];
	}
	if (opts.numbers && opts.numbers.indexOf(key) >= 0) {
		return asNumber(value)[1];
	}
	if (opts.strings && opts.strings.indexOf(key) >= 0) {
		return value.toString();
	}
	return asTyped(value);
}
export function loadItem(valueString: string): data.ArgValue {
	return asTyped(valueString);
}
function asTyped(value: string): data.ArgValue {
	const [isNumber, number] = asNumber(value);
	if (isNumber) {
		return number;
	}
	const [isBoolean, bool] = asBoolean(value);
	if (isBoolean) {
		return bool;
	}
	return value;
}
function asNumber(value: any): [boolean, number] {
	if (typeof value === 'number') {
		return [true, Number(value)];
	}
	if (/^0x[0-9a-f]+$/i.test(value)) {
		return [true, Number(value)];
	}
	return [/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(value), Number(value)];
}
function asBoolean(value: any): [boolean, boolean] {
	if (typeof value === "string") {
		const val = value.toLowerCase();
		if (val === "true") {
			return [true, true];
		}
		if (val === "false") {
			return [true, false];
		}
	}
	if (value === true || value === false) {
		return [true, value];
	}
	return [false, false];
}
export function merge<T = data.ArgItems>(items: Array<data.ArgItems>): T {
	const merged: T = {} as T;
	items.forEach((item: data.ArgItems) => {
		mergeItems(merged, item);
	});
	return merged;
}
function mergeItems<T = data.ArgItems>(into: T, from: data.ArgItems) {
	Object.keys(from).forEach((key) => {
		if (typeof from[key] === "object" && !Array.isArray(from[key])) {
			into[key] = into[key] || {};
			mergeItems(into[key] as data.ArgItems, from[key] as data.ArgItems);
		} else {
			into[key] = from[key] as data.ArgItems;
		}
	});
}
type AliasesMap = {
	[key: string]: Array<string>;
}
function loadAliases<T>(aliases: data.Aliases<T>, items: AliasesMap = {}, parents: Array<string> = []): AliasesMap {
	if (!aliases) {
		return items;
	}
	Object.keys(aliases).forEach((key) => {
		if (Array.isArray(aliases[key])) {
			const fullKey = [...parents, key].join(data.KEY_SEPARATOR);
			items[fullKey] = aliases[key] as Array<string>;
		} else {
			loadAliases(aliases[key] as data.Aliases<T>, items, [...parents, key]);
		}
	});
	return items;
}
type DefaultsMap = {
	[key: string]: number | boolean | string;
}
function loadDefaults<T>(defaults1: data.Defaults<T>, items: DefaultsMap = {}, parents: Array<string> = []): DefaultsMap {
	if (defaults1 === undefined) {
		return items;
	}
	Object.keys(defaults1).forEach((key) => {
		if (defaults1[key] === null) {
			const fullKey = [...parents, key].join(data.KEY_SEPARATOR);
			items[fullKey] = null as any;
		} else if (typeof defaults1[key] !== "object" || Array.isArray(defaults1[key])) {
			const fullKey = [...parents, key].join(data.KEY_SEPARATOR);
			items[fullKey] = defaults1[key] as any;
		} else {
			loadDefaults(defaults1[key] as data.Defaults<T>, items, [...parents, key]);
		}
	});
	return items;
}
