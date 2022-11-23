### 1. Simple usage
```typescript
import { envfull } from "envfull";
console.log(envfull(process)());
```
### Results
**1** `node index.js`
```javascript
var res = {
	$: {},
	_: [],
	"--": [],
	config: {
		path: "",
		used: false,
	},
	env: {
		path: "",
		used: false,
	},
};
```
**2** `node index.js build create -n 5 --db.user=shacker --db.port 9999 --db.url http://db --prodcution`
```javascript
var res = {
	$: {
		n: 5,
		db: {
			user: "shacker",
			port: 9999,
			url: "http://db",
		},
		prodcution: true,
	},
	_: ["build", "create"],
	"--": [],
	config: {
		path: "",
		used: false,
	},
	env: {
		path: "",
		used: false,
	},
};
```
**3** `node index.js --user=shacker --port 9999 -- test hello -s --more`
```javascript
var res = {
	$: {
		user: "shacker",
		port: 9999,
	},
	_: [],
	"--": ["test", "hello", "-s", "--more"],
	config: {
		path: "",
		used: false,
	},
	env: {
		path: "",
		used: false,
	},
};
```
