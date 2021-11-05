import envfull from "../src/index";
const parsed = envfull(process)("/path/to/config.json");
console.log(parsed.$); 
console.log(parsed._); 
console.log(parsed["--"]); 
