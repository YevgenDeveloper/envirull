const { envfull } = require("../dist/index");
console.log(envfull(process, {
    env: ["OS", "COMPUTERNAME"],
    aliases: {
        "database.url": ["dbu", "db"],
        "database.port": ["dbp", "port"]
    },
    defaults: {
        "database.url": "http:
        "database.port": 9000,
        database: {
            name: "LocalDatabase"
        }
    },
    strings: ["database.url"],
    numbers: ["database.port"]
})());
