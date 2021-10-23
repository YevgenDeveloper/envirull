export const KEY_SEPARATOR = ".";
export const NO_PARSE_AFTER = "--";
export const OPT_START_WITH_EQUAL = /^--.+=/;
export const OPT_WITH_EQUAL = /^--([^=]+)=([\s\S]*)$/;
export const OPT_START_BOOLEAN = /^--.+/;
export const OPT_BOOLEAN = /^--(.+)/;
export const OPT_START_SWITCH = /^-[^-]+/;
export const OPT_SWITCH = /^-([^-]+)$/;
export const NEWLINES_MATCH = /\n|\r|\r\n/;
export const ENV_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
export const ENV_NEWLINE = "\n";
export const ENV_NEWLINES = /\\n/g;
export type ArgValue = string | boolean | number;
export type ArgItem = ArgItems | ArgValue | Array<ArgValue>;
export type ArgItems = {
	[key: string]: ArgItem;
};
export interface EnvfullOptions {
	strings?: Array<string>;
	numbers?: Array<string>;
	booleans?: Array<string>;
	arrays?: Array<string>;
	aliases?: {
		[key: string]: Array<string>;
	};
	defaults?: {
		[key: string]: any;
	};
}
