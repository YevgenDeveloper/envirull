### 3. Define .json config usage
```typescript
import { envfull } from "envfull";
const parsed = envfull(process)("/path/to/config.json");
```
**File**: _/path/to/config.json_
```json
{
	"db": {
		"url": "http://config-url",
		"port": 8888
	},
	"username": "localhost-db"
}
```
### Results
**1** `node index.js`
```javascript
var res = {
	$: {
		db: {
			url: "http://config-url",
			port: 8888,
		},
		username: "localhost-db",
	},
	_: [],
	"--": [],
	config: {
		path: "/path/to/config.json",
		used: true,
	},
	env: {
		path: "",
		used: false,
	},
};
```
**2** `node index.js --db.url http://overided-url --username shacker`
```javascript
var res = {
	$: {
		db: {
			url: "http://overided-url",
			port: 8888,
		},
		username: "shacker",
	},
	_: [],
	"--": [],
	config: {
		path: "/path/to/config.json",
		used: true,
	},
	env: {
		path: "",
		used: false,
	},
};
```
