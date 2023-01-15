import { genUid } from "~/services/db";
import { dbDwdy } from "~/services/db/dwdy";
import { BaseModel } from "~/models/baseModel";
import { DiarySortedBy } from "~/models/dwdy/configOption";
import { DiaryFeature, AVAILABLE_FEATURES } from "~/models/dwdy/feature";
import { DiaryFeatureStatMap } from "~/models/dwdy/featureDef";
import { DiaryLayout, TIME_BASED_LAYOUTS } from "~/models/dwdy/layout";
import {
  DiaryEntry,
  DiaryEntryParams,
  DiaryEntryExistingDoc,
} from "~/models/dwdy/diaryEntry";
import { dtToDIndex, getNeighborDIndex } from "~/models/dwdy/dateUtils";
import {
  DEFAULT_DIARY_CONFIG_ATTRS,
  DiaryConfigAttrs,
} from "~/models/dwdy/config";
import { AppError } from "~/models/app/error";

export type DUid = string;
export type DIndex = string;

export interface DiaryTemplate {
  mobile: DiaryFeature[];
  desktop: {
    left: DiaryFeature[];
    right: DiaryFeature[];
  };
}
export type DiaryTemplateAction =
  | "up"
  | "down"
  | "right"
  | "left"
  | "enable"
  | "enable-left"
  | "enable-right"
  | "disable";

export interface DiaryAttrs extends DiaryConfigAttrs {
  title: string;
  lastDIndex?: DIndex;
  entryCount: number;
  layout: DiaryLayout;
  template: DiaryTemplate;
  isCalendarShown?: boolean;
  isNotebookIndexShown?: boolean;
  contentStat: Partial<DiaryFeatureStatMap>;
}
export type DiaryParams = Partial<DiaryAttrs>;

const EMPTY_TEMPLATE = {
  mobile: [],
  desktop: { left: [], right: [] },
};
export const DEFAULT_TEMPLATE = {
  mobile: [
    DiaryFeature.Image,
    DiaryFeature.Illustration,
    DiaryFeature.Video,
    DiaryFeature.Sticker,
    DiaryFeature.Tag,
    DiaryFeature.Text,
    DiaryFeature.Location,
    DiaryFeature.TodoList,
    DiaryFeature.DataList,
  ],
  desktop: {
    left: [DiaryFeature.Image, DiaryFeature.Illustration, DiaryFeature.Video],
    right: [
      DiaryFeature.Sticker,
      DiaryFeature.Tag,
      DiaryFeature.Text,
      DiaryFeature.Location,
      DiaryFeature.TodoList,
      DiaryFeature.DataList,
    ],
  },
};

export const DEFAULT_ATTRS: DiaryAttrs = Object.assign(
  {},
  DEFAULT_DIARY_CONFIG_ATTRS,
  {
    title: "",
    entryCount: 0,
    enabledFeatures: AVAILABLE_FEATURES,
    layout: DiaryLayout.Calendar,
    template: Object.assign({}, EMPTY_TEMPLATE),
    isCalendarShown: true,
    isNotebookIndexShown: true,
    contentStat: {},
  }
);

const EMPTY_BUNCH: DiaryEntryBunch = {
  dIndexes: [],
  entryMap: {},
};

export interface DiaryDoc extends DiaryAttrs {
  dUid?: string;
}
export interface DiaryDocParams extends Partial<DiaryDoc> {
  enabledFeatures?: DiaryFeature[];
}

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

  private isTemplateEmpty(template?: DiaryTemplate): boolean {
    if (template) {
      return (
        template.mobile.length === 0 &&
        template.desktop.left.length === 0 &&
        template.desktop.right.length === 0
      );
    } else {
      return true;
    }
  }

  private buildTemplate({
    template = DEFAULT_TEMPLATE,
    enabledFeatures = undefined,
  }: {
    template?: DiaryTemplate;
    enabledFeatures?: DiaryFeature[];
  }): DiaryTemplate {
    const builtTemplate = Object.assign(
      {},
      this.isTemplateEmpty(template) ? DEFAULT_TEMPLATE : template
    );
    const filterFeatures = enabledFeatures || AVAILABLE_FEATURES;
    if (filterFeatures) {
      builtTemplate.mobile = builtTemplate.mobile.filter((feature) =>
        filterFeatures.includes(feature)
      );
      builtTemplate.desktop.left = builtTemplate.desktop.left.filter(
        (feature) => filterFeatures.includes(feature)
      );
      builtTemplate.desktop.right = builtTemplate.desktop.right.filter(
        (feature) => filterFeatures.includes(feature)
      );
    }
    return builtTemplate;
  }

  public constructor(doc: DiaryDocParams = {}) {
    const template = this.buildTemplate({
      template: doc.template,
      enabledFeatures: doc.enabledFeatures,
    });
    delete doc.enabledFeatures;
    this.doc = Object.assign({}, DEFAULT_ATTRS, { contentStat: {} }, doc, {
      template,
    });
  }

  get uid(): string | undefined {
    return this.doc.dUid;
  }

  get isStored(): boolean {
    return this.uid !== undefined;
  }

  private get isReadyToSave(): boolean {
    return this.isStored;
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

  get enabledFeatures(): DiaryFeature[] {
    const features: DiaryFeature[] = ([] as DiaryFeature[]).concat(
      this.doc.template.desktop.left,
      this.doc.template.desktop.right
    );
    return features.filter((feature) =>
      this.doc.template.mobile.includes(feature)
    );
  }

  get disabledFeatures(): DiaryFeature[] {
    const features = AVAILABLE_FEATURES.filter(
      (feature) => !this.enabledFeatures.includes(feature as DiaryFeature)
    ) as DiaryFeature[];
    return features;
  }

  get isTimeBasedLayout(): boolean {
    return TIME_BASED_LAYOUTS.includes(this.doc.layout as DiaryLayout);
  }

  get firstEntry(): Promise<DiaryEntry> {
    return (async () => {
      const entryDoc = await dbDwdy.diaryEntries
        .where({ dUid: this.doc.dUid })
        .filter((doc) => {
          return doc.prevDIndex === undefined;
        })
        .first();
      if (entryDoc) {
        return new DiaryEntry(Object.assign(entryDoc, { isSaved: true }));
      } else {
        return new DiaryEntry({ dUid: this.doc.dUid });
      }
    })();
  }

  get lastEntry(): Promise<DiaryEntry> {
    return (async () => {
      const entryDoc = await dbDwdy.diaryEntries
        .where({ dUid: this.doc.dUid })
        .filter((doc) => {
          return doc.nextDIndex === undefined;
        })
        .first();
      if (entryDoc) {
        return new DiaryEntry(Object.assign(entryDoc, { isSaved: true }));
      } else {
        return new DiaryEntry({ dUid: this.doc.dUid });
      }
    })();
  }

  public async fetchMonthEntries(baseDt: Date): Promise<DiaryEntryBunch> {
    const baseDIndex = dtToDIndex(baseDt);
    const fromDIndex = getNeighborDIndex(baseDIndex, "prev", "month", 0);
    const toDIndex = getNeighborDIndex(baseDIndex, "next", "month", 0);
    const dIndexes: DIndex[] = [];
    const entryMap: Record<DIndex, DiaryEntry> = {};
    const entries = await dbDwdy.diaryEntries
      .where("[dUid+dIndex]")
      .between(
        [this.doc.dUid, fromDIndex],
        [this.doc.dUid, toDIndex],
        true,
        true
      )
      .sortBy("[dUid+dIndex]");
    entries.forEach((entryDoc) => {
      const dEntry = new DiaryEntry(
        Object.assign(entryDoc, { isSaved: true }),
        entryDoc
      );
      dIndexes.push(entryDoc.dIndex);
      entryMap[entryDoc.dIndex] = dEntry;
    });
    return { dIndexes, entryMap };
  }

  private async fetchDIndexNextEntry(dIndex: DIndex): Promise<DiaryEntry> {
    if (this.doc.dUid) {
      const entryDoc = await dbDwdy.diaryEntries
        .where("[dUid+dIndex]")
        .above([this.doc.dUid, dIndex])
        .first();
      if (entryDoc) {
        return new DiaryEntry(Object.assign(entryDoc, { isSaved: true }));
      } else {
        return new DiaryEntry({ dUid: this.doc.dUid });
      }
    } else {
      throw new AppError({ code: "diary_not_stored" });
    }
  }

  public async insertNewEntryWithDIndexOrder(
    dIndex: DIndex,
    entryParams: DiaryEntryParams = {}
  ): Promise<DiaryEntry> {
    return await dbDwdy.transaction("rw", dbDwdy.diaryEntries, async () => {
      const entry = await this.appendNewEntry(dIndex, entryParams);
      const nextEntry = await this.fetchDIndexNextEntry(dIndex);
      if (nextEntry && nextEntry.isStored) {
        return await this.moveEntry(dIndex, nextEntry.doc.dIndex);
      } else {
        return entry;
      }
    });
  }

  public async allEntries(): Promise<void> {
    // const entries: DiaryEntry[] = [];
    const docs: DiaryEntryExistingDoc[] = [];
    await dbDwdy.diaryEntries
      .where({ dUid: this.doc.dUid })
      .each((entryDoc) => {
        // const dEntry = new DiaryEntry(entryDoc, entryDoc);
        // entries.push(dEntry);
        docs.push(entryDoc);
      });
    console.log("all docs", docs);
    // console.log("all docs", await dbDwdy.diaryEntries.toArray());
  }

  public async fetchEntry(dIndex: DIndex): Promise<DiaryEntry> {
    if (this.doc.dUid) {
      return DiaryEntry.fetch({ dUid: this.doc.dUid, dIndex });
    } else {
      throw new AppError({ code: "diary_not_stored" });
    }
  }

  public async appendNewEntry(
    dIndex: DIndex,
    entryParams: DiaryEntryParams = {}
  ): Promise<DiaryEntry> {
    const foundEntry = await this.fetchEntry(dIndex);
    if (foundEntry.isStored) {
      throw new AppError({ code: "existing_diary_entry" });
    }
    const lastEntry = await this.lastEntry;
    const entry = new DiaryEntry(
      { dUid: this.doc.dUid, dIndex },
      Object.assign(entryParams, { prevDIndex: lastEntry.doc.dIndex })
    );
    await dbDwdy.transaction("rw", dbDwdy.diaryEntries, async () => {
      if (lastEntry.isStored) {
        lastEntry.assign({ nextDIndex: entry.doc.dIndex });
        await lastEntry.save();
      }
      await entry.save();
    });
    return entry;
  }

  private async moveEntryBeforeTargetEntry(
    currentEntry: DiaryEntry,
    targetDIndex: DIndex
  ): Promise<DiaryEntry> {
    if (currentEntry.doc.dIndex === targetDIndex) {
      return currentEntry;
    }
    await dbDwdy.transaction("rw", dbDwdy.diaryEntries, async () => {
      if (currentEntry.prevEntry || currentEntry.nextEntry) {
        const cpEntry = await currentEntry.prevEntry;
        const cnEntry = await currentEntry.nextEntry;
        cpEntry.assign({ nextDIndex: cnEntry.doc.dIndex });
        cnEntry.assign({ prevDIndex: cpEntry.doc.dIndex });
        if (cpEntry.isStored) {
          await cpEntry.save();
        }
        if (cnEntry.isStored) {
          await cnEntry.save();
        }
      }
      const targetEntry = await this.fetchEntry(targetDIndex);
      if (!targetEntry.isStored) {
        throw new AppError({ code: "target_entry_not_found" });
      }
      const tpEntry = await targetEntry.prevEntry;
      tpEntry.assign({ nextDIndex: currentEntry.doc.dIndex });
      if (tpEntry.isStored) {
        await tpEntry.save();
      }
      targetEntry.assign({ prevDIndex: currentEntry.doc.dIndex });
      currentEntry.assign({
        prevDIndex: tpEntry.doc.dIndex,
        nextDIndex: targetEntry.doc.dIndex,
      });
      await currentEntry.save();
      await targetEntry.save();
    });
    return currentEntry;
  }

  private async moveEntryToLast(currentEntry: DiaryEntry): Promise<DiaryEntry> {
    const lastEntry = await this.lastEntry;
    if (lastEntry.isStored && currentEntry.doc.dIndex) {
      return await this.moveEntryBeforeTargetEntry(
        lastEntry,
        currentEntry.doc.dIndex
      );
    }
    return currentEntry;
  }

  public async moveEntry(
    dIndex: DIndex,
    targetDIndex?: DIndex
  ): Promise<DiaryEntry> {
    const currentEntry = await this.fetchEntry(dIndex);
    if (!currentEntry.isStored) {
      throw new AppError({ code: "current_entry_not_found" });
    }
    if (targetDIndex) {
      return await this.moveEntryBeforeTargetEntry(currentEntry, targetDIndex);
    } else {
      return await this.moveEntryToLast(currentEntry);
    }
  }

  public async traverseEntries(
    order: "asc" | "desc" = "asc"
  ): Promise<DiaryEntry[]> {
    const entries: DiaryEntry[] = [];
    if (order === "asc") {
      let entry = await this.firstEntry;
      entries.push(entry);
      while (entry.doc.nextDIndex) {
        entry = await entry.nextEntry;
        entries.push(entry);
      }
    } else {
      let entry = await this.lastEntry;
      entries.push(entry);
      while (entry.doc.prevDIndex) {
        entry = await entry.prevEntry;
        entries.push(entry);
      }
    }
    return entries;
  }

  private get getTemplateList(): DiaryFeature[][] {
    return [
      this.doc.template.desktop.left,
      this.doc.template.desktop.right,
      this.doc.template.mobile,
    ];
  }

  private templateMoveFeatureOrder(
    feature: DiaryFeature,
    direction: "up" | "down"
  ): void {
    this.getTemplateList.forEach((tList) => {
      const foundIndex = tList.indexOf(feature);
      if (direction === "up") {
        if (foundIndex > 0) {
          tList.splice(foundIndex - 1, 0, tList.splice(foundIndex, 1)[0]);
        }
      } else {
        if (foundIndex >= 0 && foundIndex < tList.length - 1) {
          tList.splice(foundIndex + 1, 0, tList.splice(foundIndex, 1)[0]);
        }
      }
    });
  }

  private templateEnableFeature(
    templateList: DiaryFeature[],
    feature: DiaryFeature
  ): void {
    const foundIndex = templateList.indexOf(feature);
    if (foundIndex < 0) {
      templateList.push(feature);
    }
  }

  private templateDisableFeature(feature: DiaryFeature): void {
    this.getTemplateList.forEach((tList) => {
      const foundIndex = tList.indexOf(feature);
      if (foundIndex >= 0) {
        tList.splice(foundIndex, 1);
      }
    });
  }

  private templateMoveEnableFeature(
    feature: DiaryFeature,
    direction: "right" | "left"
  ): void {
    this.templateEnableFeature(this.doc.template.mobile, feature);
    this.templateEnableFeature(this.doc.template.desktop[direction], feature);
  }

  public moveTemplateFeature(
    feature: DiaryFeature,
    action: DiaryTemplateAction
  ): void {
    switch (action) {
      case "up":
        this.templateMoveFeatureOrder(feature, "up");
        break;
      case "down":
        this.templateMoveFeatureOrder(feature, "down");
        break;
      case "right":
        this.templateDisableFeature(feature);
        this.templateMoveEnableFeature(feature, "right");
        break;
      case "left":
        this.templateDisableFeature(feature);
        this.templateMoveEnableFeature(feature, "left");
        break;
      case "enable":
      case "enable-right":
        this.templateMoveEnableFeature(feature, "right");
        break;
      case "enable-left":
        this.templateMoveEnableFeature(feature, "left");
        break;
      case "disable":
        this.templateDisableFeature(feature);
        break;
    }
  }

  public fetchStat<T extends DiaryFeature>(
    feature: DiaryFeature
  ): DiaryFeatureStatMap[T] | undefined {
    return this.doc.contentStat[feature] as DiaryFeatureStatMap[T];
  }

  public assignStat<T extends DiaryFeature>(
    feature: DiaryFeature,
    stat: DiaryFeatureStatMap[T]
  ): Diary {
    (this.doc.contentStat[feature] as DiaryFeatureStatMap[T]) = JSON.parse(
      JSON.stringify(stat)
    );
    return this;
  }
}

export function buildEmptyBunch(): DiaryEntryBunch {
  return Object.assign({}, EMPTY_BUNCH);
}
