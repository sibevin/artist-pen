import Dexie, { Table } from "dexie";
import { DwdyConfigExistingDoc } from "~/models/dwdy/config";
import { DiaryExistingDoc } from "~/models/dwdy/diary";
import { DiaryEntryExistingDoc } from "~/models/dwdy/diaryEntry";

export class DbDwdy extends Dexie {
  configs!: Table<DwdyConfigExistingDoc, string>;
  diaries!: Table<DiaryExistingDoc, string>;
  diaryEntries!: Table<DiaryEntryExistingDoc, string>;

  constructor() {
    super("dbDwdy");
    this.version(1).stores({
      configs: "dcUid",
      diaries: "dUid, title, lastDIndex",
      diaryEntries: "dUid, [dUid+dIndex]",
    });
  }
}

export const dbDwdy = new DbDwdy();
