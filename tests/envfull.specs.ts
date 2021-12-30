import Process = NodeJS.Process;
import ProcessEnv = NodeJS.ProcessEnv;
import {envfull} from "../src/index";
describe("working with envfull api", () => {
	function createProcess(cwd: string, argv: Array<string>, env: ProcessEnv = {}): Process {
		const process = jasmine.createSpyObj<Process>("process", ["cwd"]);
		process.cwd.and.returnValue(cwd);
		process.env = env;
		process.argv = ["node", "index.js", ...argv];
		return process;
	}
	describe("envfull without config", () => {
		it("empty command line arguments", () => {
			const process = createProcess("/path/to/dir", []);
			const data = envfull(process)();
			expect(data.$).toEqual({});
			expect(data._).toEqual([]);
			expect(data["--"]).toEqual([]);
		});
		it("parse command line only without default and env", () => {
			const process = createProcess("/path/to/dir", [
				"build", "clean", "--db.port", "9587", "--db.url", "http:
				"--", "create", "new", "--force"
			]);
			const data = envfull(process)();
			expect(data.$).toEqual({
				db: {
					port: 9587,
					url: 'http:
				},
				production: true,
				c: 3
			});
			expect(data._).toEqual(["build", "clean"]);
			expect(data["--"]).toEqual(["create", "new", "--force"]);
		});
		it("parse command line only with default and without env", () => {
			const process = createProcess("/path/to/dir", [
				"build", "clean", "--db.port", "9587"
			]);
			const data = envfull<{}>(process, {
				defaults: {
					"db.port": 9000,
					"db.url": "http:
					"production": false,
					"c": 1
				}
			})();
			expect(data.$).toEqual({
				db: {
					port: 9587,
					url: 'http:
				},
				production: false,
				c: 1,
			});
			expect(data._).toEqual(["build", "clean"]);
			expect(data["--"]).toEqual([]);
		});
		it("parse command line only with default as object tree and without env", () => {
			const process = createProcess("/path/to/dir", [
				"build", "clean", "--db.port", "9587"
			]);
			const data = envfull<{}>(process, {
				defaults: {
					db: {
						port: 9000,
						url: "http:
					},
					production: false,
					c: 1
				}
			})();
			expect(data.$).toEqual({
				db: {
					port: 9587,
					url: 'http:
				},
				production: false,
				c: 1,
			});
			expect(data._).toEqual(["build", "clean"]);
			expect(data["--"]).toEqual([]);
		});
		it("empty command line arguments with env", () => {
			const process = createProcess("/path/to/dir", [], {
				PATH: "/this/is/path;/user/home/bin",
				NODE_PATH: "/bin/nodejs/node",
				"TEST.DATABASE.URL": "http:
				"TEST.DATABASE.PORT": "9123"
			});
			const data = envfull(process)();
			expect(data.$).toEqual({
				PATH: '/this/is/path;/user/home/bin',
				NODE_PATH: '/bin/nodejs/node',
				TEST: {
					DATABASE: {
						URL: 'http:
						PORT: 9123
					}
				}
			});
			expect(data._).toEqual([]);
			expect(data["--"]).toEqual([]);
		});
		it("empty command line arguments with env and with defaults", () => {
			const process = createProcess("/path/to/dir", [], {
				PATH: "/this/is/path;/user/home/bin",
				NODE_PATH: "/bin/nodejs/node",
				"TEST.DATABASE.URL": "http:
				"TEST.DATABASE.PORT": "9123"
			});
			const data = envfull<{}>(process, {
				defaults: {
					"TEST.DATABASE.NAME": "MYDB",
					"TEST.DATABASE.PORT": 9222
				}
			})();
			expect(data.$).toEqual({
				PATH: '/this/is/path;/user/home/bin',
				NODE_PATH: '/bin/nodejs/node',
				TEST: {
					DATABASE: {
						URL: 'http:
						PORT: 9123,
						NAME: 'MYDB'
					}
				}
			});
			expect(data._).toEqual([]);
			expect(data["--"]).toEqual([]);
		});
		it("empty command line arguments with env, with defaults and alias", () => {
			const process = createProcess("/path/to/dir", [], {
				PATH: "/this/is/path;/user/home/bin",
				NODE_PATH: "/bin/nodejs/node",
				"TEST.DATABASE.URL": "http:
				"TEST.DATABASE.PORT": "9123"
			});
			const data = envfull<{}>(process, {
				defaults: {
					"database.name": "MYDB",
					"database.port": 9222
				},
				aliases: {
					"database.url": ["TEST.DATABASE.URL"],
					"database.port": ["TEST.DATABASE.PORT"],
					"database.name": ["TEST.DATABASE.NAME"]
				}
			})();
			expect(data.$).toEqual({
				PATH: '/this/is/path;/user/home/bin',
				NODE_PATH: '/bin/nodejs/node',
				database: {
					url: 'http:
					port: 9123,
					name: 'MYDB'
				}
			});
			expect(data._).toEqual([]);
			expect(data["--"]).toEqual([]);
		});
		it("empty command line arguments with env and with defaults and null", () => {
			const process = createProcess("/path/to/dir", [], {
				PATH: "/this/is/path;/user/home/bin",
				NODE_PATH: "/bin/nodejs/node",
				"TEST.DATABASE.URL": "http:
				"TEST.DATABASE.PORT": "9123"
			});
			const data = envfull<{}>(process, {
				defaults: {
					"TEST.DATABASE.NAME": "MYDB",
					"TEST.DATABASE.PORT": 9222,
					"TEST.DATABASE.USER": null,
				}
			})();
			expect(data.$).toEqual({
				PATH: '/this/is/path;/user/home/bin',
				NODE_PATH: '/bin/nodejs/node',
				TEST: {
					DATABASE: {
						URL: 'http:
						PORT: 9123,
						NAME: 'MYDB',
						USER: null
					}
				}
			});
			expect(data._).toEqual([]);
			expect(data["--"]).toEqual([]);
		});
	});
});
