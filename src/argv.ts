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
export function parse(args: Array<string>, opts: data.EnvfullOptions = {}): ParsedArgs {
	const [parseArgs, rawArgs] = noParseSplit(args);
	const argv = parseArrayOfArgv(parseArgs, opts);
	saveRawArgs(argv, rawArgs);
	return argv;
}
function noParseSplit(args: Array<string>): [Array<string>, Array<string>] {
	if (args.indexOf(data.NO_PARSE_AFTER) !== -1) {
		return [
			args.slice(args.indexOf(data.NO_PARSE_AFTER) + 1),
			args.slice(0, args.indexOf('--'))
		];
	}
	return [args, []];
}
function parseArrayOfArgv(args: Array<string>, opts: data.EnvfullOptions): ParsedArgs {
	const argv = createParsedArgs();
	args.forEach((arg) => {
		const pair =
			processOptionWithEqualValue(arg, opts) ||
			processOptionAsBooleanValue(arg, opts) ||
			processOptionAsSwitchValue(arg, opts);
		pair && applyVariable(argv, pair[0], utils.loadValue(opts, pair[0], pair[1]));
		!pair && applyItems(argv, arg);
	});
	return argv;
}
function saveRawArgs(argv: ParsedArgs, rawArgs: Array<string>) {
	argv[data.NO_PARSE_AFTER] = rawArgs;
}
function processOptionWithEqualValue(arg: string, opts: data.EnvfullOptions): [string, string] | null {
	if (!data.OPT_START_WITH_EQUAL.test(arg)) {
		return null;
	}
	const matched = arg.match(data.OPT_WITH_EQUAL)!;
	return [
		utils.loadKey(opts, matched[1]),
		matched[2]
	];
}
function processOptionAsBooleanValue(arg: string, opts: data.EnvfullOptions): [string, string] | null {
	if (!data.OPT_START_BOOLEAN.test(arg)) {
		return null;
	}
	const matched = arg.match(data.OPT_BOOLEAN)!;
	return [
		utils.loadKey(opts, matched[1]),
		true.toString()
	];
}
function processOptionAsSwitchValue(arg: string, opts: data.EnvfullOptions): [string, string] | null {
	if (!data.OPT_START_SWITCH.test(arg)) {
		return null;
	}
	const matched = arg.match(data.OPT_SWITCH)!;
	return [
		utils.loadKey(opts, matched[1]),
		true.toString()
	];
}
function applyVariable(argv: ParsedArgs, keyString: string, value: data.ArgValue | Array<data.ArgValue>) {
	const [where, key] = utils.loadWhere(argv, keyString);
	where[key] = utils.value(where[key], value);
}
function applyItems(argv: ParsedArgs, valueString: string) {
	const value = utils.loadItem(valueString);
	argv._.push(value);
}
