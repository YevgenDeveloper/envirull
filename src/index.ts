import Process = NodeJS.Process;
import * as utils from "./utils";
import * as data from "./data";
import * as Argv from "./argv";
export default function (process: Process, options: data.EnvfullOptions = {}) {
	const argv = Argv.parse(process.argv.slice(2), options);
	utils.defaults(options, argv.$);
}
