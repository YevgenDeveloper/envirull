import {parse} from "../src/argv";
import {EnvfullOptions} from "../src/data";
describe("parsing of arguments from command line", () => {
	describe("without any options", () => {
		it("empty data parse", () => {
			const parsed = parse([]);
			expect(parsed.$).toEqual({});
			expect(parsed._).toEqual([]);
			expect(parsed["--"]).toEqual([]);
		});
		it("parse command line '--beep=boop --test --prod foo bar baz'", () => {
			const parsed = parse("--beep=boop --test --prod foo bar baz".split(" "));
			expect(parsed.$).toEqual({
				beep: 'boop',
				test: true,
				prod: "foo"
			});
			expect(parsed._).toEqual(["bar", "baz"]);
			expect(parsed["--"]).toEqual([]);
		});
		it("parse command line '--number=123 --boolean=true --boolean2=FALSE'", () => {
			const parsed = parse("--number=123 --boolean=true --boolean2=FALSE".split(" "));
			expect(parsed.$).toEqual({
				number: 123,
				boolean: true,
				boolean2: false
			});
			expect(parsed._).toEqual([]);
			expect(parsed["--"]).toEqual([]);
		});
		it("parse command line '--only=1 --only=2 --only=test'", () => {
			const parsed = parse("--only=1 --only=2 --only=test".split(" "));
			expect(parsed.$).toEqual({
				only: [1, 2, 'test']
			});
			expect(parsed._).toEqual([]);
			expect(parsed["--"]).toEqual([]);
		});
		it("parse command line '--prod -- --beep=boop --prod foo bar baz'", () => {
			const parsed = parse("--prod -- --beep=boop --prod foo bar baz".split(" "));
			expect(parsed.$).toEqual({
				prod: true
			});
			expect(parsed._).toEqual([]);
			expect(parsed["--"]).toEqual(['--beep=boop', "--prod", "foo", "bar", "baz"]);
		});
		it("parse command line '--prod YES --version 123 --test false'", () => {
			const parsed = parse("--prod YES --version 123 --test false build".split(" "));
			expect(parsed.$).toEqual({
				prod: "YES",
				version: 123,
				test: false
			});
			expect(parsed._).toEqual(["build"]);
			expect(parsed["--"]).toEqual([]);
		});
		it("parse command line '-n 1 -y test -abc'", () => {
			const parsed = parse("-n 1 -y test -abc".split(" "));
			expect(parsed.$).toEqual({
				n: 1,
				y: "test",
				abc: true
			});
			expect(parsed._).toEqual([]);
			expect(parsed["--"]).toEqual([]);
		});
		it("parse command line '--database.url http:
			const parsed = parse("--database.url http:
			expect(parsed.$).toEqual({
				database: {
					url: "http:
					port: 9999
				},
				user: {
					id: 12
				}
			});
			expect(parsed._).toEqual([]);
			expect(parsed["--"]).toEqual([]);
		});
		it("parse command line '-x-only core'", () => {
			const parsed = parse("-x-only core".split(" "));
			expect(parsed.$).toEqual({});
			expect(parsed._).toEqual(["-x-only"]);
			expect(parsed["--"]).toEqual([]);
		});
	});
	describe("with alias option", () => {
		let options: EnvfullOptions<{}>;
		beforeEach(() => {
			options = {
				aliases: {
					"build": ["b", "r", "m"],
					"beep": ["e"],
					"prod": ["production", "p"]
				}
			};
		});
		it("parse command line 'b --e=boop --p'", () => {
			const parsed = parse("b --e=boop --p".split(" "), options);
			expect(parsed.$).toEqual({
				beep: "boop",
				prod: true
			});
			expect(parsed._).toEqual(["build"]);
			expect(parsed["--"]).toEqual([]);
		});
	});
	describe("with nested alias option", () => {
		let options: EnvfullOptions<{}>;
		beforeEach(() => {
			options = {
				aliases: {
					"build": ["b", "r", "m"],
					db: {
						port: ["dbp"],
						url: ["dbu"]
					},
					"app.name": ["n"],
					prod: null
				}
			};
		});
		it("parse command line 'b --n=boop --dbp 9000 --dbu http:
			const parsed = parse("b --n=boop --dbp 9000 --dbu http:
			expect(parsed.$).toEqual({
				app: {
					name: 'boop'
				},
				db: {
					port: 9000,
					url: 'http:
				}
			});
			expect(parsed._).toEqual(["build"]);
			expect(parsed["--"]).toEqual([]);
		});
	});
	describe("with forced types behaviour option", () => {
		let options: EnvfullOptions<{}>;
		beforeEach(() => {
			options = {
				arrays: ["only"],
				booleans: ["prod"],
				numbers: ["year"],
				strings: ["name"]
			};
		});
		describe("forced string", () => {
			it("parse command line '--name John --test John'", () => {
				const parsed = parse("--name John --test John".split(" "), options);
				expect(parsed.$).toEqual({
					name: 'John',
					test: 'John'
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
			it("parse command line '--name 123 --test 123'", () => {
				const parsed = parse("--name 123 --test 123".split(" "), options);
				expect(parsed.$).toEqual({
					name: '123',
					test: 123
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
			it("parse command line '--name true --test true'", () => {
				const parsed = parse("--name true --test true".split(" "), options);
				expect(parsed.$).toEqual({
					name: 'true',
					test: true
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
		});
		describe("forced number", () => {
			it("parse command line '--year John --test John'", () => {
				const parsed = parse("--year John --test John".split(" "), options);
				expect(parsed.$).toEqual({
					year: NaN,
					test: 'John'
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
			it("parse command line '--year 123 --test 123'", () => {
				const parsed = parse("--year 123 --test 123".split(" "), options);
				expect(parsed.$).toEqual({
					year: 123,
					test: 123
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
			it("parse command line '--year true --test true'", () => {
				const parsed = parse("--year true --test true".split(" "), options);
				expect(parsed.$).toEqual({
					year: NaN,
					test: true
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
		});
		describe("forced boolean", () => {
			it("parse command line '--prod John --test John'", () => {
				const parsed = parse("--prod John --test John".split(" "), options);
				expect(parsed.$).toEqual({
					prod: false,
					test: 'John'
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
			it("parse command line '--prod 123 --test 123'", () => {
				const parsed = parse("--prod 123 --test 123".split(" "), options);
				expect(parsed.$).toEqual({
					prod: false,
					test: 123
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
			it("parse command line '--prod true --test true'", () => {
				const parsed = parse("--prod true --test true".split(" "), options);
				expect(parsed.$).toEqual({
					prod: true,
					test: true
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
		});
		describe("forced array", () => {
			it("parse command line '--only John --test John'", () => {
				const parsed = parse("--only John --test John".split(" "), options);
				expect(parsed.$).toEqual({
					only: [ 'John' ],
					test: 'John'
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
			it("parse command line '--only 123 --test 123'", () => {
				const parsed = parse("--only 123 --test 123".split(" "), options);
				expect(parsed.$).toEqual({
					only: [ 123 ],
					test: 123
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
			it("parse command line '--only true --test true'", () => {
				const parsed = parse("--only true --test true".split(" "), options);
				expect(parsed.$).toEqual({
					only: [ true ],
					test: true
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
			it("parse command line '--only 1 --only 2'", () => {
				const parsed = parse("--only 1 --only 2".split(" "), options);
				expect(parsed.$).toEqual({
					only: [1, 2]
				});
				expect(parsed._).toEqual([]);
				expect(parsed["--"]).toEqual([]);
			});
		});
	});
});
