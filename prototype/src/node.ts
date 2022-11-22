import {
  AST,
  Create,
  Delete,
  From,
  Insert_Replace,
  Select,
  Update,
} from "node-sql-parser";
import { filterAndProject, filterItem } from "./condition";
import { join } from "./join";
import { Database, DatabaseType, Table } from "./services/database";
import { lambdaFilterHandler, lambdaJoinHandler } from "./services/lambda";
import { socketfilterHandler, socketJoinHandler } from "./services/socket";
import { StorageService } from "./services/storage";

type KeyOffset = {
  [key: string]: number;
};

const MIN_CHUNK_SIZE = 1;
const WORKER_COUNT = 2;
const WORKER_TYPE: string = "socket";
const LAMBDA_MEMORY = 256;
const workers = ["", "http://localhost:3000"];

export class Node {
  offsetLookupTable: KeyOffset = {};
  storageService: StorageService;
  database: Database;

  constructor(database: string) {
    this.database = new Database(database);
    this.storageService = new StorageService();
    this.init();
  }

  private async init() {
    await this.initDatabase();
    await this.initOffsetLookupTable();
  }

  private async initOffsetLookupTable() {
    const content = await this.storageService.readObject(
      `${this.database.name}/offsets`
    );

    if (content) {
      const data = await this.storageService.streamToString(content);
      this.offsetLookupTable = JSON.parse(data);
    }
  }

  private async initDatabase() {
    await this.database.init();

    if (
      !(await this.storageService.objectExists(`${this.database.name}/offsets`))
    ) {
      await this.storageService.writeObject(
        `${this.database.name}/offsets`,
        Buffer.from("{}")
      );
    }

    for (const table of this.database.tables) {
      const key = `${this.database.name}/${table.name}`;
      if (!(await this.storageService.objectExists(key)))
        await this.storageService.writeObject(key, Buffer.from(""));
    }
  }

  public addOffset(id: string, offset: number) {
    this.offsetLookupTable[id] = offset;
  }

  public async run(statemnts: AST | AST[]) {
    if (Array.isArray(statemnts)) {
      await Promise.all(
        statemnts.map(async (statement: AST) => await this.run(statement))
      );
    } else {
      return await this.runStatement(statemnts);
    }
  }

  public async runStatement(statement: AST) {
    switch (statement.type) {
      case "select":
        return await this.runSelectStatement(statement);
      case "insert":
        return await this.runInsertStatement(statement);
      case "update":
        return await this.runUpdateStatement(statement);
      case "delete":
        return await this.runDeleteStatement(statement);
      case "create":
        return await this.runCreateStatement(statement);
    }
  }

  private async getTable(name: string): Promise<Table> {
    const data = await this.storageService.readObject(
      `${this.database.name}/${name}`
    );
    const table = this.database.getTable(name);

    if (!data) {
      throw new Error(`Table ${table} does not exist`);
    }

    const totalBuffer = await this.storageService.streamToBuffer(data);

    // Split buffer into items
    const items: Buffer[] = [];
    let splitStart = 0;
    while (splitStart < totalBuffer.length) {
      items.push(
        totalBuffer.slice(
          splitStart,
          splitStart + this.database.getTableLength(table.name)
        )
      );
      splitStart += this.database.getTableLength(table.name);
    }

    let response: any[] = [];
    for (const buffer of items) {
      let item: { [key: string]: any } = {};
      let start = 0;
      for (const key in table.attributes) {
        const value = table.attributes[key];
        switch (value.type) {
          case DatabaseType.VARCHAR:
            if (!value.length)
              throw new Error(`Length of ${key} is not defined`);
            item[`${name}.${key}`] = buffer
              .toString("utf8", start, start + value.length)
              .replace(/^[\s\uFEFF\xA0\0]+|[\s\uFEFF\xA0\0]+$/g, "");

            start += value.length;
            break;
          case DatabaseType.INT:
            item[`${name}.${key}`] = buffer.readInt32BE(start);
            start += 4;
            break;
          default:
            throw new Error(`Type ${value.type} is not supported`);
        }
      }

      response.push(item);
    }

    return {
      name,
      attributes: table.attributes,
      items: response,
    };
  }

  private async runInsertStatement(statement: Insert_Replace) {
    const table = statement.table[0].table;
    const tableDefinition = this.database.getTable(table);

    if (!tableDefinition) {
      throw new Error(`Table ${table} does not exist`);
    }

    const columns = statement.columns;
    const values = statement.values[0].value.map((v) => v.value);

    if (!columns || columns.length !== values.length) {
      throw new Error(`Column count does not match value count`);
    }

    let buffer = Buffer.alloc(this.database.getTableLength(table));
    let primaryKey: string | undefined;

    let offset = 0;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const value = values[i];
      const attribute = tableDefinition.attributes[column];

      if (attribute.primaryKey) {
        primaryKey = value;
      }

      switch (attribute.type) {
        case DatabaseType.VARCHAR:
          if (!attribute.length)
            throw new Error(`Length of ${column} is not defined`);
          buffer.write(value, offset, attribute.length);
          offset += attribute.length;
          break;
        case DatabaseType.INT:
          buffer.writeInt32BE(parseInt(value), offset);
          offset += 4;
          break;
        default:
          break;
      }
    }

    if (!primaryKey) {
      throw new Error("Primary key is not defined");
    }

    const position = await this.storageService.append(
      `${this.database.name}/${table}`,
      buffer
    );

    this.addOffset(primaryKey, position);
    await this.storageService.writeObject(
      `${this.database.name}/offsets`,
      Buffer.from(JSON.stringify(this.offsetLookupTable))
    );

    return [];
  }

  private async runSelectStatement(statement: Select) {
    const from = statement.from;
    console.dir(statement, { depth: null });

    if (!from) {
      throw new Error("No table specified");
    }

    const tables = await Promise.all(from.map((f) => this.getTable(f.table)));

    // Key lookup table
    const keyLookupTable: { [key: string]: string } = {};
    for (let i = 0; i < tables.length; i++) {
      for (const key in tables[i].attributes) {
        if (from[i].as)
          keyLookupTable[`${from[i].as}.${key}`] = `${from[i].table}.${key}`;
        keyLookupTable[`${from[i].table}.${key}`] = `${from[i].table}.${key}`;
        keyLookupTable[key] = `${from[i].table}.${key}`;
      }
    }

    // Join tables
    const joinedTable = tables[0];
    for (let i = 1; i < tables.length; i++) {
      const table = tables[i];
      joinedTable.attributes = {
        ...joinedTable.attributes,
        ...table.attributes,
      };

      if (!joinedTable.items || !table || !table.items) {
        continue;
      }

      const chunks = this.split(joinedTable.items);

      const results = await Promise.all(
        chunks.map(async (chunk: any[], index: number) => {
          const data = {
            leftTable: chunk,
            rightTable: table.items,
            leftKey: from[i].on.left,
            rightKey: from[i].on.right,
            keyLookupTable: keyLookupTable,
            type: from[i].join,
          };

          if (index === 0) return join(data);

          switch (WORKER_TYPE) {
            case "socket":
              return await socketJoinHandler(workers[index], data);
            case "lambda":
              return await lambdaJoinHandler(LAMBDA_MEMORY, data);
          }
        })
      );

      joinedTable.items = results.flat();
    }

    if (!joinedTable || !joinedTable.items) {
      throw new Error("No items found");
    }

    // TODO: Check if where or projections is not "*" clause is defined

    const chunks = this.split(joinedTable.items);

    const results = await Promise.all(
      chunks.map(async (chunk: any[], index: number) => {
        const data = {
          items: chunk,
          keyLookupTable: keyLookupTable,
          where: statement.where,
          columns: statement.columns,
        };

        if (index === 0) return filterAndProject(data);

        switch (WORKER_TYPE) {
          case "socket":
            return await socketfilterHandler(workers[index], data);
          case "lambda":
            return await lambdaFilterHandler(LAMBDA_MEMORY, data);
        }
      })
    );

    joinedTable.items = results.flat();

    return joinedTable.items;
  }

  private async runUpdateStatement(statement: Update) {
    if (statement.table && statement.table.length > 1) {
      throw new Error("Multiple tables are not supported");
    }

    const tableName = statement.table && (statement.table[0] as From).table;

    if (!tableName) {
      throw new Error(`No table specified`);
    }

    const table = await this.getTable(tableName);
    let items = table.items;

    if (!items) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    let keyLookupTable: { [key: string]: string } = {};
    let primaryKey: string | undefined;
    for (const key in table.attributes) {
      if (table.attributes[key].primaryKey) {
        primaryKey = key;
      }
      keyLookupTable[key] = `${tableName}.${key}`;
    }

    if (!primaryKey) {
      throw new Error("Primary key is not defined");
    }

    if (statement.where) {
      items = items.filter((item) =>
        filterItem(keyLookupTable, item, statement.where)
      );
    }

    for (const item of items) {
      for (const set of statement.set) {
        if (set.column && set.value) {
          item[keyLookupTable[set.column]] = set.value.value;
        }
      }
    }

    const buffer = Buffer.alloc(this.database.getTableLength(tableName));
    let offset = 0;
    for (const item of items) {
      let primaryKey: string | undefined;
      for (const key in table.attributes) {
        if (table.attributes[key].primaryKey) {
          primaryKey = item[keyLookupTable[key]];
        }
        const attribute = table.attributes[key];
        switch (attribute.type) {
          case DatabaseType.VARCHAR:
            if (!attribute.length)
              throw new Error(`Length of ${key} is not defined`);
            buffer.write(item[keyLookupTable[key]], offset, attribute.length);
            offset += attribute.length;
            break;
          case DatabaseType.INT:
            buffer.writeInt32BE(item[keyLookupTable[key]], offset);
            offset += 4;
            break;
          default:
            break;
        }
      }

      if (!primaryKey) {
        throw new Error("Primary key is not defined");
      }

      const start = this.offsetLookupTable[primaryKey];

      await this.storageService.writeBytes(
        `${this.database.name}/${tableName}`,
        start,
        start + buffer.length,
        buffer
      );
    }
  }

  private async runDeleteStatement(statement: Delete) {
    if (statement.table && statement.table.length > 1) {
      throw new Error("Multiple tables are not supported");
    }

    const tableName = statement.table && (statement.table[0] as From).table;

    if (!tableName) {
      throw new Error(`No table specified`);
    }

    const table = await this.getTable(tableName);
    let items = table.items;

    if (!items) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    let keyLookupTable: { [key: string]: string } = {};
    let primaryKey: string | undefined;
    for (const key in table.attributes) {
      if (table.attributes[key].primaryKey) {
        primaryKey = key;
      }
      keyLookupTable[key] = `${tableName}.${key}`;
    }

    if (!primaryKey) {
      throw new Error("Primary key is not defined");
    }

    if (statement.where) {
      items = items.filter((item) =>
        filterItem(keyLookupTable, item, statement.where)
      );
    }

    for (const item of items) {
      const pk = item[keyLookupTable[primaryKey]];
      const start = this.offsetLookupTable[pk];

      await this.storageService.deleteBytes(
        `${this.database.name}/${tableName}`,
        start,
        start + this.database.getTableLength(tableName)
      );
    }
  }

  private async runCreateStatement(statement: Create) {
    if (statement.table && statement.table.length > 1) {
      throw new Error("Multiple tables are not supported");
    }

    const tableName = statement.table && (statement.table[0] as From).table;

    if (!tableName) {
      throw new Error(`No table specified`);
    }

    const create_definitions = statement.create_definitions;

    if (!create_definitions) {
      throw new Error(`No columns specified`);
    }

    const table: Table = {
      name: tableName,
      attributes: create_definitions
        .filter((d) => d.resource === "column")
        .reduce((acc, cur) => {
          acc[cur.column.column] = {
            type: cur.definition.dataType,
            primaryKey: false,
            length: cur.definition.length || 4,
          };
          return acc;
        }, {}),
    };

    const primary_key = create_definitions.find(
      (d) => d.resource === "constraint" && d.constraint_type === "primary key"
    );

    if (!primary_key) {
      throw new Error(`Primary key is not defined`);
    }

    table.attributes[primary_key.definition[0].column].primaryKey = true;

    await this.database.addTable(table);
  }

  // Split workload on array accross maxWorkers threads with MIN_CHUNK_SIZE
  private split(items: any[]): any[][] {
    const chunkSize = Math.max(
      Math.ceil(items.length / WORKER_COUNT),
      MIN_CHUNK_SIZE
    );

    const chunks: any[][] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }

    return chunks;
  }
}
