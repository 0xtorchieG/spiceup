import fs from 'fs'

type TableName = 'auth' | 'users'

export class Database<T> {
  private jsonValues: Record<TableName, Record<string, any>> | undefined

  constructor() {
    this.readJson()
  }

  private readJson() {
    const jsonFileContent = fs.readFileSync(`${process.cwd()}/db.json`, {
      encoding: 'utf-8',
    })
    this.jsonValues = JSON.parse(jsonFileContent)
  }

  private writeJson() {
    const stringifiedJson = JSON.stringify(this.jsonValues, null, 2)

    fs.writeFileSync(`${process.cwd()}/db.json`, stringifiedJson, {
      encoding: 'utf-8',
    })
  }

  protected createEntry<U>(
    tableName: TableName,
    id: string,
    values: U extends null | undefined ? T : U,
    options?: { upsert?: boolean }
  ) {
    if (!this.jsonValues) {
      throw new Error('An error has occured')
    }

    if (!options?.upsert && this.jsonValues[tableName][id] !== undefined) {
      throw new Error(`Record already exists in ${tableName}`)
    }

    this.jsonValues[tableName][id] = values

    this.writeJson()

    return values
  }

  protected readEntry(tableName: TableName, id: string): T | undefined {
    if (!this.jsonValues) {
      throw new Error('An error has occured')
    }

    return this.jsonValues[tableName][id]
  }
}
