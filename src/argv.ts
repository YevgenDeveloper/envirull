const NO_PARSE_AFTER = "--";
const OPT_START_WITH_EQUAL = /^--.+=/;
const OPT_WIDTH_EQUAL = /^--([^=]+)=([\s\S]*)$/;
export type ParsedArg = string | boolean | number;
export type ParsedArgs = {
	[key: string]: ParsedArg | Array<ParsedArg>;
	_: Array<string>;
}
export default function parse(args: Array<string>): ParsedArgs {
	const argv: ParsedArgs = { _: [] };
	const [toParse, rawArgs] = noParseSplit(args);
	return argv;
}
function noParseSplit(args: Array<string>): [Array<string>, Array<string>] {
	if (args.indexOf(NO_PARSE_AFTER) !== -1) {
		return [
			args.slice(args.indexOf(NO_PARSE_AFTER) + 1),
			args.slice(0, args.indexOf('--'))
		];
	}
	return [args, []];
}
function parseArrayOfArgv(args: Array<string>) {
	args.forEach((arg) => {
	});
}
function isOptionWithEqualValue(arg: string) {
	if (!OPT_START_WITH_EQUAL.test(arg)) {
	}
	const matched = arg.match(OPT_WIDTH_EQUAL)!;
	const [key, value] = [matched[1], matched[2]];
	if (flags.bools[key]) {
		value = value !== 'false';
	}
	setArg(key, value, arg);
}
function asTyped(value: string): ParsedArg {
	if (isNumber(value)) {
		return Number(value);
	}
}
function isNumber(value: any): boolean {
	if (typeof value === 'number') {
		return true;
	}
	if (/^0x[0-9a-f]+$/i.test(value)) {
		return true;
	}
	return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(value);
}
