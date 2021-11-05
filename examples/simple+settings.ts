import envfull from "../src/index";
const parsed = envfull(process, {
	aliases: {
		"database.url": ["dbu", "db"],
		"database.port": ["dbp", "port"]
	},
	defaults: {
		"database.url": "http:
		"database.port": 9000
	},
	strings: ["database.url"],
	numbers: ["database.port"]
})();
console.log(parsed.$); 
console.log(parsed._); 
console.log(parsed["--"]); 
