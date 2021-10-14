const noParseSplitter = "--";
export type ParsedArgs = {
	[key: string]: string | boolean | Array<string>;
	_: Array<string>;
}
export default function parse(args: Array<string>): ParsedArgs {
	const argv: ParsedArgs = { _: [] };
	const [toParse, rawArgs] = noParseSplit(args);
	return argv;
}
function noParseSplit(args: Array<string>): [Array<string>, Array<string>] {
	if (args.indexOf(noParseSplitter) !== -1) {
		return [
			args.slice(args.indexOf(noParseSplitter) + 1),
			args.slice(0, args.indexOf('--'))
		];
	}
	return [args, []];
}
function parseArrayOfArgv(args: Array<string>) {
	args.forEach((arg) => {
	});
}
