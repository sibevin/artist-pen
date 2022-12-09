import { genUid } from "~/services/db";
import { dbDwdy } from "~/services/db/dwdy";
import { BaseModel } from "~/models/baseModel";
import { DiarySortedBy } from "~/models/dwdy/diarySortedBy";
import { DiaryFeature } from "~/models/dwdy/feature";
import { DiaryLayout } from "~/models/dwdy/layout";
import { DiaryEntry } from "~/models/dwdy/diaryEntry";
import { dtToDIndex, getNeighborDIndex } from "~/models/dwdy/dateUtils";
import {
  DEFAULT_DIARY_CONFIG_ATTRS,
  DiaryConfigAttrs,
} from "~/models/dwdy/config";

export type DUid = string;
export type DIndex = string;

export interface DiaryAttrs extends DiaryConfigAttrs {
  title: string;
  lastDIndex?: DIndex;
  entryCount: number;
  enabledFeatures: DiaryFeature[];
  layout: DiaryLayout;
}
export type DiaryParams = Partial<DiaryAttrs>;

export const DEFAULT_ATTRS: DiaryAttrs = Object.assign(
  {},
  DEFAULT_DIARY_CONFIG_ATTRS,
  {
    title: "",
    entryCount: 0,
    enabledFeatures: Object.values(DiaryFeature) as DiaryFeature[],
    layout: DiaryLayout.Calendar,
  }
);

export interface DiaryDoc extends DiaryAttrs {
  dUid?: string;
}
export type DiaryDocParams = Partial<DiaryDoc>;

export interface DiaryExistingDoc extends DiaryAttrs {
  dUid: string;
}

export interface DiaryEntryBunch {
  dIndexes: DIndex[];
  entryMap: Record<DIndex, DiaryEntry>;
}

export type DiaryEntryQueryRange = "d" | "m" | "3m";

export class Diary implements BaseModel<Diary, DiaryDoc, DiaryParams> {
  doc: DiaryDoc;

  static async fetch(uid: string): Promise<Diary | null> {
    const dDoc = await dbDwdy.diaries.where({ dUid: uid }).first();
    if (!dDoc) {
      return null;
    }
    return new Diary(dDoc);
  }

  static async list({
    sortedBy = DiarySortedBy.UpdateDesc,
    keyword,
  }: {
    sortedBy: DiarySortedBy;
    keyword?: string;
  }): Promise<Diary[]> {
    let diaryDocs: DiaryExistingDoc[];
    if (sortedBy === DiarySortedBy.TitleAsc) {
      diaryDocs = await dbDwdy.diaries.orderBy("title").toArray();
    } else {
      diaryDocs = await dbDwdy.diaries.reverse().sortBy("lastDIndex");
    }
    if (keyword && keyword !== "") {
      const keywordRegex = new RegExp(keyword, "i");
      diaryDocs = diaryDocs.filter((doc) => keywordRegex.test(doc.title));
    }
    return diaryDocs.map((dDoc) => new Diary(dDoc));
  }

  public constructor(doc: DiaryDocParams = {}) {
    this.doc = Object.assign({}, DEFAULT_ATTRS, doc);
  }

  get uid(): string | undefined {
    return this.doc.dUid;
  }

  get isReadyToSave(): boolean {
    return this.uid !== undefined;
  }

  public assign(params: DiaryParams): Diary {
    this.doc = Object.assign(this.doc, params);
    return this;
  }

  public async save(): Promise<{ target: Diary; action: string }> {
    let docToSave = Object.assign({}, this.doc);
    let action = "update";
    if (!this.isReadyToSave) {
      docToSave = Object.assign(docToSave, { dUid: genUid() });
      action = "create";
    }
    await dbDwdy.diaries.put(
      JSON.parse(JSON.stringify(docToSave)) as DiaryExistingDoc
    );
    this.doc = docToSave;
    return { target: this, action };
  }

  private getDIndexRange(
    baseDt: Date,
    range: DiaryEntryQueryRange
  ): { fromDIndex: DIndex; toDIndex: DIndex } {
    let fromDIndex: DIndex;
    let toDIndex: DIndex;
    const baseDIndex = dtToDIndex(baseDt);
    if (range === "m") {
      fromDIndex = getNeighborDIndex(baseDIndex, "prev", "month", 0);
      toDIndex = getNeighborDIndex(baseDIndex, "next", "month", 0);
    } else if (range === "3m") {
      fromDIndex = getNeighborDIndex(baseDIndex, "prev", "month", 1);
      toDIndex = getNeighborDIndex(baseDIndex, "next", "month", 1);
    } else {
      fromDIndex = baseDIndex;
      toDIndex = baseDIndex;
    }
    return { fromDIndex, toDIndex };
  }

  public async fetchEntries(
    baseDt: Date,
    range: DiaryEntryQueryRange
  ): Promise<DiaryEntryBunch> {
    const { fromDIndex, toDIndex } = this.getDIndexRange(baseDt, range);
    const dIndexes: DIndex[] = [];
    const entryMap: Record<DIndex, DiaryEntry> = {};
    await dbDwdy.diaryEntries
      .where("[dUid+lastName]")
      .between([this.uid, fromDIndex], [this.uid, toDIndex], true, true)
      .each((entryDoc) => {
        const dEntry = new DiaryEntry(entryDoc, entryDoc);
        dIndexes.push(entryDoc.dIndex);
        entryMap[entryDoc.dIndex] = dEntry;
      });
    return { dIndexes, entryMap };
  }
}
