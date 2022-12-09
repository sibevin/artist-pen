import Dexie, { Table } from "dexie";
import { AppConfigExistingDoc } from "~/models/app/config";

export class DbApp extends Dexie {
  configs!: Table<AppConfigExistingDoc, string>;

  constructor() {
    super("dbApp");
    this.version(1).stores({
      configs: "acUid",
    });
  }
}

export const dbApp = new DbApp();
