###4. Define variables in .env file usage
```typescript
import {envfull} from "envfull";
const parsed = envfull(process)();
```
**File**: *.env*
```cmd
DB.USERNAME=shacker
DB.URL=http://env-url
DB.SECRET=dsa5f1sd65f1asd56f1dsa231fsd3a1fsda32fdsaf
```
### Results
 **1** `node index.js`
   ```javascript
   var res = {
     '$': {
        DB: { 
          USERNAME: 'shacker',
          URL: 'http://env-url',
          SECRET: 'dsa5f1sd65f1asd56f1dsa231fsd3a1fsda32fdsaf'
        } 
     },
     _: [],
     '--': []
   }
   ```
 **2** `node index.js --DB.USERNAME forced-user --production --DB.URL http://mydb`
```javascript
var res = {
  '$': {
     DB: { 
       USERNAME: 'forced-user',
       URL: 'http://mydb',
       SECRET: 'dsa5f1sd65f1asd56f1dsa231fsd3a1fsda32fdsaf'
     },
     production: true
  },
  _: [],
  '--': []
}
```
