import Process = NodeJS.Process;
import envfull from "../src/index";
describe("working with envfull api", () => {
	function createProcess(cwd: string, argv: Array<string>): Process {
		const process = jasmine.createSpyObj<Process>("process", ["cwd"]);
		process.cwd.and.returnValue(cwd);
		process.env = {};
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
			const data = envfull(process, {
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
	});
});
