### 2. Settings provided usage
```typescript
import {envfull} from "envfull";
console.log(envfull(process, {
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
})());
```
### Results
 **1** `node index.js`
```javascript
var res = {
  '$': { 
     database: {
       url: 'http://www.db.com/db',
       port: 9000,
       name: 'LocalDatabase'
     }
  },
  _: [],
  '--': []
}
```
 **2** `node index.js --dbu http://localhostdb --dbp 1234 --debug`
```javascript
var res = {
  '$': { 
     database: {
       url: 'http://localhostdb',
       port: 1234,
       name: 'LocalDatabase'
     },
     debug: true
  },
  _: [],
  '--': []
}
```
