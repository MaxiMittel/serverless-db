import { StorageService } from "./storage";

export type Table = {
  name: string;
  attributes: {
    [key: string]: {
      primaryKey: boolean;
      type: DatabaseType;
      name: string;
      length?: number;
    };
  };
  items?: any[];
};

export class Database {
  name: string;
  tables: Table[];
  storageService: StorageService;

  constructor(name: string) {
    this.name = name;
    this.tables = [];
    this.storageService = new StorageService();
  }

  public async init() {
    if (await this.storageService.objectExists(`${this.name}/tables.json`)) {
      const rawData = await this.storageService.readObject(
        `${this.name}/tables.json`
      );
      const data = JSON.parse(
        await this.storageService.streamToString(rawData)
      );
      this.tables = data.tables;
      this.name = data.name;
    } else {
      await this.storageService.writeObject(
        `${this.name}/tables.json`,
        Buffer.from(
          JSON.stringify({
            name: this.name,
            tables: this.tables,
          })
        )
      );
    }
  }

  public async addTable(table: Table) {
    this.tables.push(table);

    await this.storageService.writeObject(
      `${this.name}/tables.json`,
      Buffer.from(
        JSON.stringify({
          name: this.name,
          tables: this.tables,
        })
      )
    );

    await this.storageService.writeObject(
      `${this.name}/${table.name}`,
      Buffer.from("")
    );
  }

  public getTable(name: string) {
    const table = this.tables.find((table) => table.name === name);
    if (!table) throw new Error(`Table ${name} does not exist`);
    return table;
  }

  public getTableLength(name: string) {
    const table = this.getTable(name);

    if (!table) {
      return 0;
    }

    const entries = Object.entries(table.attributes);
    return entries.reduce((acc, [key, value]) => {
      switch (value.type) {
        case DatabaseType.VARCHAR:
          if (!value.length) throw new Error(`Length of ${key} is not defined`);
          return acc + value.length;
        case DatabaseType.INT:
          return acc + 4;
        default:
          return acc;
      }
    }, 0);
  }
}

export enum DatabaseType {
  VARCHAR = "VARCHAR",
  INT = "INT",
  FLOAT = "FLOAT",
}
