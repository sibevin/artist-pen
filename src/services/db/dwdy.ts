import Dexie, { Table } from "dexie";
import { DwdyConfigExistingDoc } from "~/models/dwdy/config";
import { DiaryExistingDoc } from "~/models/dwdy/diary";
import { DiaryEntryExistingDoc } from "~/models/dwdy/diaryEntry";
import { DiaryAttachmentExistingDoc } from "~/models/dwdy/diaryAttachment";

export class DbDwdy extends Dexie {
  configs!: Table<DwdyConfigExistingDoc, string>;
  diaries!: Table<DiaryExistingDoc, string>;
  diaryEntries!: Table<DiaryEntryExistingDoc, string>;
  diaryAttachments!: Table<DiaryAttachmentExistingDoc, string>;

  constructor() {
    super("dbDwdy");
    this.version(1).stores({
      configs: "dcUid",
      diaries: "dUid,title,lastDIndex",
      diaryEntries: "[dUid+dIndex],[dUid+timestamp],[dUid+longitude+latitude]",
      diaryAttachments: "[dUid+dIndex+daUid]",
    });
  }
}

export const dbDwdy = new DbDwdy();
