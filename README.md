# bun-kv

A simple key-value store with SQLite.

```bash
bun add bun-kv
```

Sample usage:

```js
import { KV } from 'bun-kv'

const items = new KV('items.sqlite')

await items.set('foo', 'bar')

console.log(await items.get('foo'))
```
