import envfull from "../src/index";
const parsed = envfull(process)();
console.log(parsed.$); 
console.log(parsed._); 
console.log(parsed["--"]); 
