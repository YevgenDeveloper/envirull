import * as fs from "fs";
import {load, parse, SupportedType} from "../src/config";
import {EnvfullOptions} from "../src/data";
describe("loading and parsing config file", () => {
	describe("without any options", () => {
		it("invalid type parse", () => {
			const parsed = parse(null as any, JSON.stringify({}));
			expect(parsed.$).toEqual({});
			expect(parsed.type).toBe(null as any);
		});
		it("empty json parse", () => {
			const parsed = parse(SupportedType.JSON, JSON.stringify({}));
			expect(parsed.$).toEqual({});
			expect(parsed.type).toBe(SupportedType.JSON);
		});
		it("no json parse", () => {
			const parsed = parse(SupportedType.JSON, "");
			expect(parsed.$).toEqual({});
			expect(parsed.type).toBe(SupportedType.JSON);
		});
		it("json with variables and structure", () => {
			const parsed = parse(SupportedType.JSON, JSON.stringify({
				database: {
					url: "http:
					port: 999
				},
				base: "http:
				prod: true
			}));
			expect(parsed.$).toEqual({
				database: {
					url: 'http:
					port: 999
				},
				base: 'http:
				prod: true
			});
			expect(parsed.type).toBe(SupportedType.JSON);
		});
	});
	describe("with alias option", () => {
		let options: EnvfullOptions;
		beforeEach(() => {
			options = {
				aliases: {
					"database.url": ["dbu", "url"],
					"database.port": ["dbp", "p"]
				}
			};
		});
		it("parse with options to right structure", () => {
			const parsed = parse(SupportedType.JSON, JSON.stringify({
				dbu: "http:
				dbp: 999,
				base: "http:
				prod: true
			}), options);
			expect(parsed.$).toEqual({
				database: {
					url: 'http:
					port: 999
				},
				base: 'http:
				prod: true
			});
			expect(parsed.type).toBe(SupportedType.JSON);
		});
	});
	describe("with forced types behaviour option", () => {
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
			it("parse name as string with string", () => {
				const parsed = parse(SupportedType.JSON, JSON.stringify({
					name: "John",
					test: "John"
				}), options);
				expect(parsed.$).toEqual({
					name: "John",
					test: "John"
				});
				expect(parsed.type).toBe(SupportedType.JSON);
			});
			it("parse name as string with number", () => {
				const parsed = parse(SupportedType.JSON, JSON.stringify({
					name: 123,
					test: 123
				}), options);
				expect(parsed.$).toEqual({
					name: "123",
					test: 123
				});
				expect(parsed.type).toBe(SupportedType.JSON);
			});
			it("parse name as string with boolean", () => {
				const parsed = parse(SupportedType.JSON, JSON.stringify({
					name: true,
					test: true
				}), options);
				expect(parsed.$).toEqual({
					name: "true",
					test: true
				});
				expect(parsed.type).toBe(SupportedType.JSON);
			});
		});
		describe("forced number", () => {
			it("parse year as number with string", () => {
				const parsed = parse(SupportedType.JSON, JSON.stringify({
					year: "John",
					test: "John"
				}), options);
				expect(parsed.$).toEqual({
					year: NaN,
					test: "John"
				});
				expect(parsed.type).toBe(SupportedType.JSON);
			});
			it("parse year as number with number", () => {
				const parsed = parse(SupportedType.JSON, JSON.stringify({
					year: 123,
					test: 123
				}), options);
				expect(parsed.$).toEqual({
					year: 123,
					test: 123
				});
				expect(parsed.type).toBe(SupportedType.JSON);
			});
			it("parse year as number with boolean", () => {
				const parsed = parse(SupportedType.JSON, JSON.stringify({
					year: true,
					test: true
				}), options);
				expect(parsed.$).toEqual({
					year: 1,
					test: true
				});
				expect(parsed.type).toBe(SupportedType.JSON);
			});
		});
		describe("forced boolean", () => {
			it("parse prod as boolean with string", () => {
				const parsed = parse(SupportedType.JSON, JSON.stringify({
					prod: "John",
					test: "John"
				}), options);
				expect(parsed.$).toEqual({
					prod: false,
					test: "John"
				});
				expect(parsed.type).toBe(SupportedType.JSON);
			});
			it("parse prod as boolean with number", () => {
				const parsed = parse(SupportedType.JSON, JSON.stringify({
					prod: 123,
					test: 123
				}), options);
				expect(parsed.$).toEqual({
					prod: false,
					test: 123
				});
				expect(parsed.type).toBe(SupportedType.JSON);
			});
			it("parse prod as boolean with boolean", () => {
				const parsed = parse(SupportedType.JSON, JSON.stringify({
					prod: true,
					test: true
				}), options);
				expect(parsed.$).toEqual({
					prod: true,
					test: true
				});
				expect(parsed.type).toBe(SupportedType.JSON);
			});
		});
		describe("forced array", () => {
			it("parse only as Array with string", () => {
				const parsed = parse(SupportedType.JSON, JSON.stringify({
					only: "John",
					test: "John"
				}), options);
				expect(parsed.$).toEqual({
					only: ["John"],
					test: "John"
				});
				expect(parsed.type).toBe(SupportedType.JSON);
			});
			it("parse only as Array with number", () => {
				const parsed = parse(SupportedType.JSON, JSON.stringify({
					only: 123,
					test: 123
				}), options);
				expect(parsed.$).toEqual({
					only: [123],
					test: 123
				});
				expect(parsed.type).toBe(SupportedType.JSON);
			});
			it("parse only as Array with boolean", () => {
				const parsed = parse(SupportedType.JSON, JSON.stringify({
					only: true,
					test: true
				}), options);
				expect(parsed.$).toEqual({
					only: [true],
					test: true
				});
				expect(parsed.type).toBe(SupportedType.JSON);
			});
		});
	});
	describe("load from disk", () => {
		it("file not exists", () => {
			spyOn(fs, "readFileSync").and.throwError("not found");
			const parsed = load("/path/to/config/config.json");
			expect(parsed.$).toEqual({});
			expect(parsed.type).toBe(SupportedType.JSON);
		});
		it("file exists", () => {
			spyOn(fs, "readFileSync").and.returnValue(JSON.stringify({
				BASIC: 'basic',
				database: {
					url: 'http:
					port: 9999
				}
			}));
			const parsed = load("/path/to/config/config.json");
			expect(parsed.$).toEqual({
				BASIC: 'basic',
				database: {
					url: 'http:
					port: 9999
				}
			});
			expect(parsed.type).toBe(SupportedType.JSON);
		});
		it("file exist but is unknown", () => {
			spyOn(fs, "readFileSync").and.returnValue("<xml />");
			const parsed = load("/path/to/config/config.xml");
			expect(parsed.$).toEqual({});
			expect(parsed.type).toBe(SupportedType.JSON);
		});
	});
});
