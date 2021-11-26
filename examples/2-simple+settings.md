### 2. Usage with aliases
```typescript
import {envfull} from "../src/index";
const parsed = envfull(process, {
	aliases: {
		"database.url": ["dbu", "db"],
		"database.port": ["dbp", "port"]
	},
	defaults: {
		"database.url": "http://www.db.com/db",
		"database.port": 9000,
		database: {
			name: "LocalDatabase"
		}
	},
	strings: ["database.url"],
	numbers: ["database.port"]
})();
```
