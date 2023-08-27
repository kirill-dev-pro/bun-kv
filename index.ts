import { Database, Statement } from 'bun:sqlite'

type Row = {
  key: string
  value: string
}

const _rows2obj = <T>(rows: Row[]) => {
  try {
    return rows.reduce<Record<string, any>>((acc, row) => {
      const key = row.key
      acc[key] = JSON.parse(row.value) as T
      return acc
    }, {})
  } catch (error) {
    console.error(error)
    throw new Error("Can't parse value from database")
  }
}

class KV<T> {
  db: Database

  getQuery: Statement<Row, [string]>
  insertQuery: Statement<Row, [string, string, number, number]>
  updateQuery: Statement<Row, [string, number, string]>
  getAllQuery: Statement<Row, []>
  findQuery: Statement<Row, [string]>
  deleteQuery: Statement<unknown, [string]>

  constructor(path: string) {
    const db = (this.db = new Database(path))

    db.run(
      'CREATE TABLE IF NOT EXISTS items(' +
        ' key   TEXT PRIMARY KEY,' +
        ' value TEXT,' +
        ' ctime INTEGER,' +
        ' mtime INTEGER)',
    )

    this.getQuery = db.prepare('SELECT * FROM items WHERE key=? LIMIT 1')
    this.insertQuery = db.prepare('INSERT INTO items (key,value,ctime,mtime) VALUES (?,?,?,?)')
    this.updateQuery = db.prepare('UPDATE items SET value=?, mtime=? WHERE key=?')
    this.getAllQuery = db.prepare('SELECT * FROM items')
    this.findQuery = db.prepare('SELECT * FROM items WHERE key LIKE ?')
    this.deleteQuery = db.prepare('DELETE FROM items WHERE key = ?')
  }

  close() {
    this.db.close()
  }

  get(key: string) {
    const row = this.getQuery.get(key)
    if (!row || !row.value) {
      return undefined
    }
    return JSON.parse(row.value) as T
  }

  set(key: string, value: T) {
    const t = Date.now()
    const value_p = JSON.stringify(value)
    const update = this.get(key)
    if (update) {
      // update content ==> value=?, mtime=?, key=?'
      this.updateQuery.run(value_p, t, key)
      return this
    }

    // initial input ==> key,value,ctime,mtime
    this.insertQuery.run(key, value_p, t, t)
    return this
  }

  delete(key: string) {
    this.deleteQuery.run(key)
    return this
  }

  all() {
    const rows = this.getAllQuery.all()
    return _rows2obj<T>(rows)
  }

  find(prefix: string) {
    const rows = this.findQuery.all(prefix + '%')
    return _rows2obj<T>(rows)
  }
}

export { KV }
