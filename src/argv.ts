import * as data from "./data";
import * as utils from "./utils";
export type ParsedArgs = {
	$: data.ArgItems;
	_: Array<data.ArgValue>;
	[data.NO_PARSE_AFTER]: Array<string>;
}
function createParsedArgs(): ParsedArgs {
	return {
		$: {},
		_: [],
		[data.NO_PARSE_AFTER]: []
	}
}
export function parse<T>(args: Array<string>, opts: data.EnvfullOptions<T> = {}): ParsedArgs {
	const [parseArgs, rawArgs] = noParseSplit(args);
	const argv = parseArrayOfArgv(parseArgs, opts);
	saveRawArgs(argv, rawArgs);
	return argv;
}
function noParseSplit(args: Array<string>): [Array<string>, Array<string>] {
	if (args.indexOf(data.NO_PARSE_AFTER) !== -1) {
		return [
			args.slice(0, args.indexOf(data.NO_PARSE_AFTER)),
			args.slice(args.indexOf(data.NO_PARSE_AFTER) + 1)
		];
	}
	return [args, []];
}
function parseArrayOfArgv<T>(args: Array<string>, opts: data.EnvfullOptions<T>): ParsedArgs {
	const argv = createParsedArgs();
	for (let i = 0; i < args.length; i++) {
		const current = args[i];
		const next = args[i + 1];
		let pair: [string, string] | null = null;
		pair = processOptionWithEqualValue(current, opts);
		pair = pair || processOptionAsBooleanValue(current, next, opts);
		pair = pair || processOptionAsTypedValue(current, next, opts, () => i++);
		pair = pair || processSwitchAsBooleanValue(current, next, opts);
		pair = pair || processSwitchAsTypedValue(current, next, opts, () => i++);
		pair && applyVariable(argv, pair[0], utils.loadValue(opts, pair[0], pair[1]));
		!pair && applyItems(argv, utils.loadKey(opts, current));
	}
	return argv;
}
function saveRawArgs(argv: ParsedArgs, rawArgs: Array<string>) {
	argv[data.NO_PARSE_AFTER] = rawArgs;
}
function processOptionWithEqualValue<T>(arg: string, opts: data.EnvfullOptions<T>): [string, string] | null {
	if (!data.OPT_START_WITH_EQUAL.test(arg)) {
		return null;
	}
	const matched = arg.match(data.OPT_WITH_EQUAL)!;
	if (matched === null) {
		return null;
	}
	return [
		utils.loadKey(opts, matched[1]),
		matched[2]
	];
}
function processOptionAsBooleanValue<T>(arg: string, next: string | undefined, opts: data.EnvfullOptions<T>): [string, string] | null {
	if (!data.OPT_START_BOOLEAN.test(arg) || !nextIsSwitchOrOption(next)) {
		return null;
	}
	const matched = arg.match(data.OPT_BOOLEAN)!;
	if (matched === null) {
		return null;
	}
	return [
		utils.loadKey(opts, matched[1]),
		true.toString()
	];
}
function processOptionAsTypedValue<T>(arg: string, next: string | undefined, opts: data.EnvfullOptions<T>, move: () => void): [string, string] | null {
	if (!data.OPT_START_BOOLEAN.test(arg) || nextIsSwitchOrOption(next)) {
		return null;
	}
	move();
	const matched = arg.match(data.OPT_BOOLEAN)!;
	if (matched === null) {
		return null;
	}
	return [
		utils.loadKey(opts, matched[1]),
		next!
	];
}
function processSwitchAsBooleanValue<T>(arg: string, next: string | undefined, opts: data.EnvfullOptions<T>): [string, string] | null {
	if (!data.OPT_START_SWITCH.test(arg) || !nextIsSwitchOrOption(next)) {
		return null;
	}
	const matched = arg.match(data.OPT_SWITCH)!;
	if (matched === null) {
		return null;
	}
	return [
		utils.loadKey(opts, matched[1]),
		true.toString()
	];
}
function processSwitchAsTypedValue<T>(arg: string, next: string | undefined, opts: data.EnvfullOptions<T>, move: () => void): [string, string] | null {
	if (!data.OPT_START_SWITCH.test(arg) || nextIsSwitchOrOption(next)) {
		return null;
	}
	move();
	const matched = arg.match(data.OPT_SWITCH)!;
	if (matched === null) {
		return null;
	}
	return [
		utils.loadKey(opts, matched[1]),
		next!
	];
}
function nextIsSwitchOrOption(arg: string | undefined) {
	return arg === undefined || data.OPT_START_FLAG.test(arg);
}
function applyVariable(argv: ParsedArgs, keyString: string, value: data.ArgValue | Array<data.ArgValue>) {
	const [where, key] = utils.loadWhere(argv.$, keyString);
	where[key] = utils.value(where[key], value);
}
function applyItems(argv: ParsedArgs, valueString: string) {
	const value = utils.loadItem(valueString);
	argv._.push(value);
}
