import * as fs from "fs";
import {parse, enrich, load} from "../src/env";
import {EnvfullOptions} from "../src/data";
describe("parsing and loading .env file and ENVIRONMENTAL variables", () => {
	function join(arr: Array<string>): string {
		return arr.join("\r\n");
	}
	describe("parse without any options", () => {
		it("empty content parse", () => {
			const parsed = parse("");
			expect(parsed.$).toEqual({});
		});
		it("filled content parse", () => {
			const parsed = parse(join([
				"BASIC=basic",
				"",
				"EMPTY=",
				"#this is a test",
				"database.url='http:
				"database.port=9999",
				"TRIM= this is trimmed     ",
				"MULTILINE='this\\nis\\nline'"
			]));
			expect(parsed.$).toEqual({
				BASIC: 'basic',
				EMPTY: '',
				database: {
					url: 'http:
					port: 9999
				},
				TRIM: 'this is trimmed',
				MULTILINE: 'this\nis\nline'
			});
		});
	});
	describe("parse with alias options", () => {
		let options: EnvfullOptions;
		beforeEach(() => {
			options = {
				aliases: {
					"database.url": ["DB"],
					"database.port": ["DBP"]
				}
			};
		});
		it("filled content parse", () => {
			const parsed = parse(join([
				"BASIC=basic",
				"EMPTY=",
				"DB='http:
				"DBP=9999"
			]), options);
			expect(parsed.$).toEqual({
				BASIC: 'basic',
				EMPTY: '',
				database: {
					url: 'http:
					port: 9999
				}
			});
		});
	});
	describe("parse with forced types behaviour option", () => {
		let options: EnvfullOptions;
		beforeEach(() => {
			options = {
				arrays: ["only"],
				booleans: ["prod"],
				numbers: ["year"],
				strings: ["name"]
			};
		});
		describe("forced string", () => {
			it("parse env file with name as string", () => {
				const parsed = parse(join([
					"name=John",
					"test=John"
				]), options);
				expect(parsed.$).toEqual({
					name: 'John',
					test: 'John'
				});
			});
			it("parse env file with name as number", () => {
				const parsed = parse(join([
					"name=123",
					"test=123"
				]), options);
				expect(parsed.$).toEqual({
					name: '123',
					test: 123
				});
			});
			it("parse env file with name as boolean", () => {
				const parsed = parse(join([
					"name=true",
					"test=true"
				]), options);
				expect(parsed.$).toEqual({
					name: 'true',
					test: true
				});
			});
		});
		describe("forced number", () => {
			it("parse env file with name as string", () => {
				const parsed = parse(join([
					"year=John",
					"test=John"
				]), options);
				expect(parsed.$).toEqual({
					year: NaN,
					test: 'John'
				});
			});
			it("parse env file with name as number", () => {
				const parsed = parse(join([
					"year=123",
					"test=123"
				]), options);
				expect(parsed.$).toEqual({
					year: 123,
					test: 123
				});
			});
			it("parse env file with name as boolean", () => {
				const parsed = parse(join([
					"year=true",
					"test=true"
				]), options);
				expect(parsed.$).toEqual({
					year: NaN,
					test: true
				});
			});
		});
		describe("forced boolean", () => {
			it("parse env file with name as string", () => {
				const parsed = parse(join([
					"prod=John",
					"test=John"
				]), options);
				expect(parsed.$).toEqual({
					prod: false,
					test: 'John'
				});
			});
			it("parse env file with name as number", () => {
				const parsed = parse(join([
					"prod=123",
					"test=123"
				]), options);
				expect(parsed.$).toEqual({
					prod: false,
					test: 123
				});
			});
			it("parse env file with name as boolean", () => {
				const parsed = parse(join([
					"prod=true",
					"test=true"
				]), options);
				expect(parsed.$).toEqual({
					prod: true,
					test: true
				});
			});
		});
		describe("forced array", () => {
			it("parse env file with name as string", () => {
				const parsed = parse(join([
					"only=John",
					"test=John"
				]), options);
				expect(parsed.$).toEqual({
					only: ['John'],
					test: 'John'
				});
			});
			it("parse env file with name as number", () => {
				const parsed = parse(join([
					"only=123",
					"test=123"
				]), options);
				expect(parsed.$).toEqual({
					only: [123],
					test: 123
				});
			});
			it("parse env file with name as boolean", () => {
				const parsed = parse(join([
					"only=true",
					"test=true"
				]), options);
				expect(parsed.$).toEqual({
					only: [true],
					test: true
				});
			});
		});
	});
	describe("enrich with ENVIRONMENTAL variables without any options", () => {
		const env = {
			"database.url": "http:
			"PATH": "aaa;bbb",
			"NODE_PATH": "/nodejs/bin"
		};
		it("empty content parse", () => {
			const parsed = enrich(parse(""), env);
			expect(parsed.$).toEqual({
				database: {
					url: 'http:
				},
				PATH: 'aaa;bbb',
				NODE_PATH: '/nodejs/bin'
			});
		});
		it("filled content parse and preserver env variables not in file", () => {
			const parsed = enrich(parse(join([
				"BASIC=basic",
				"database.url='http:
				"database.port=9999"
			])), env);
			expect(parsed.$).toEqual({
				BASIC: 'basic',
				database: {
					url: 'http:
					port: 9999
				},
				PATH: 'aaa;bbb',
				NODE_PATH: '/nodejs/bin'
			});
		});
	});
	describe("enrich with ENVIRONMENTAL variables with alias options", () => {
		const env = {
			"DB": "http:
			"PATH": "aaa;bbb",
			"NODE_PATH": "/nodejs/bin"
		};
		let options: EnvfullOptions;
		beforeEach(() => {
			options = {
				aliases: {
					"database.url": ["DB"],
					"database.port": ["DBP"]
				}
			};
		});
		it("empty content parse", () => {
			const parsed = enrich(parse(""), env, options);
			expect(parsed.$).toEqual({
				database: {
					url: 'http:
				},
				PATH: 'aaa;bbb',
				NODE_PATH: '/nodejs/bin'
			});
		});
		it("filled content parse and preserver env variables not in file", () => {
			const parsed = enrich(parse(join([
				"BASIC=basic",
				"database.url='http:
				"database.port=9999"
			])), env, options);
			expect(parsed.$).toEqual({
				BASIC: 'basic',
				database: {
					url: 'http:
					port: 9999
				},
				PATH: 'aaa;bbb',
				NODE_PATH: '/nodejs/bin'
			});
		});
	});
	describe("loading env file from path", () => {
		it("file not exists", () => {
			spyOn(fs, "readFileSync").and.throwError("not found");
			const parsed = load("/path/to/dir");
			expect(parsed.$).toEqual({});
		});
		it("file exists", () => {
			spyOn(fs, "readFileSync").and.returnValue(join([
				"BASIC=basic",
				"database.url='http:
				"database.port=9999"
			]));
			const parsed = load("/path/to/dir");
			expect(parsed.$).toEqual({
				BASIC: 'basic',
				database: {
					url: 'http:
					port: 9999
				}
			});
		});
	});
});
