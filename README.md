# bun-kv

A simple key-value store with SQLite that use `bun:sqlite`. No dependencies.

```bash
bun add bun-kv
```

### Sample usage with TypeScript:

```ts
import { KV } from 'bun-kv'

type Item = {
  id: string
  created_at: number
}

const items = new KV<Item>('items.sqlite')

items.set('foo', { created_at: Date.now(), id: 'foo' })

const foo = items.get('foo')
      ^? { created_at: number, id: string } | undefined
```

### License

MIT
