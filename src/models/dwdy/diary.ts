import { genUid } from "~/services/db";
import { dbDwdy } from "~/services/db/dwdy";
import { BaseModel } from "~/models/baseModel";
import { DIndex } from "~/dwdy/types/core";
import { DiarySortedBy } from "~/dwdy/services/configOption";
import { DiaryFeature } from "~/dwdy/feature/def";
import {
  AVAILABLE_FEATURES,
  DiaryFeatureStatMap,
  DiaryFeatureConfigMap,
  defaultFeatureConfig,
  defaultFeatureStat,
} from "~/dwdy/feature/map";
import { DiaryLayout, DiaryLayoutComponent } from "~/dwdy/layout/def";
import { defaultLayoutConfig, DiaryLayoutConfigMap } from "~/dwdy/layout/map";
import {
  DiaryEntry,
  DiaryEntryParams,
  DiaryEntryExistingDoc,
} from "~/models/dwdy/diaryEntry";
import {
  DEFAULT_DIARY_CONFIG_ATTRS,
  DiaryConfigAttrs,
  DiaryConfigParams,
} from "~/models/dwdy/config";
import { AppError } from "~/models/app/error";
import { layoutComponent } from "~/dwdy/layout/component";

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

export interface DiaryAttrs {
  title: string;
  lastDIndex?: DIndex;
  entryCount: number;
  layout: DiaryLayout;
  template: DiaryTemplate;
  stat: Partial<DiaryFeatureStatMap>;
  config: {
    diary: Partial<DiaryConfigAttrs>;
    content: Partial<DiaryFeatureConfigMap>;
    layout: Partial<DiaryLayoutConfigMap>;
  };
}
export type DiaryParams = Partial<DiaryAttrs>;

export type DiaryEntryFetchParams = {
  dIndex?: DIndex;
  timestamp?: number;
  longitude?: number;
  latitude?: number;
};

const EMPTY_TEMPLATE = {
  mobile: [],
  desktop: { left: [], right: [] },
};
export const DEFAULT_TEMPLATE = {
  mobile: [
    DiaryFeature.Sticker,
    DiaryFeature.Tag,
    DiaryFeature.Image,
    DiaryFeature.Text,
    DiaryFeature.Sound,
  ],
  desktop: {
    left: [DiaryFeature.Sticker, DiaryFeature.Tag],
    right: [DiaryFeature.Image, DiaryFeature.Text, DiaryFeature.Sound],
  },
};

export const DEFAULT_ATTRS: DiaryAttrs = Object.assign(
  {},
  DEFAULT_DIARY_CONFIG_ATTRS,
  {
    title: "",
    entryCount: 0,
    layout: DiaryLayout.Calendar,
    template: Object.assign({}, EMPTY_TEMPLATE),
    stat: {},
    config: {
      diary: {},
      content: {},
      layout: {},
    },
  }
);

export interface DiaryDoc extends DiaryAttrs {
  dUid?: string;
}
export interface DiaryDocParams extends Partial<DiaryDoc> {
  enabledFeatures?: DiaryFeature[];
}

export interface DiaryExistingDoc extends DiaryAttrs {
  dUid: string;
}

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

  layoutComponent(componentType: keyof DiaryLayoutComponent) {
    return layoutComponent(this.doc.layout, componentType);
  }

  get firstEntry(): Promise<DiaryEntry | null> {
    return (async () => {
      const entryDoc = await dbDwdy.diaryEntries
        .where({ dUid: this.doc.dUid })
        .filter((doc) => {
          return doc.prevDIndex === undefined;
        })
        .first();
      if (entryDoc) {
        return new DiaryEntry(entryDoc);
      } else {
        return null;
      }
    })();
  }

  get lastEntry(): Promise<DiaryEntry | null> {
    return (async () => {
      const entryDoc = await dbDwdy.diaryEntries
        .where({ dUid: this.doc.dUid })
        .filter((doc) => {
          return doc.nextDIndex === undefined;
        })
        .first();
      if (entryDoc) {
        return new DiaryEntry(entryDoc);
      } else {
        return null;
      }
    })();
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

  public async fetchEntry(
    params: DiaryEntryFetchParams
  ): Promise<DiaryEntry | null> {
    if (this.doc.dUid) {
      const fetchParams = Object.assign({ dUid: this.doc.dUid }, params, {
        dUid: this.doc.dUid,
      });
      return DiaryEntry.fetch(fetchParams);
    } else {
      throw new AppError({ code: "diary_not_stored" });
    }
  }

  public buildEntry(entryParams: DiaryEntryParams = {}): DiaryEntry {
    return new DiaryEntry({ dUid: this.doc.dUid }, entryParams);
  }

  public async appendEntry(
    entryParams: DiaryEntryParams = {},
    dIndex?: DIndex
  ): Promise<DiaryEntry> {
    if (dIndex) {
      const foundEntry = await this.fetchEntry({ dIndex });
      if (foundEntry) {
        throw new AppError({ code: "existing_diary_entry" });
      }
    }
    const entry = new DiaryEntry(
      { dUid: this.doc.dUid, dIndex: dIndex || genUid() },
      entryParams
    );
    const lastEntry = await this.lastEntry;
    await dbDwdy.transaction("rw", dbDwdy.diaryEntries, async () => {
      if (lastEntry) {
        entry.doc.prevDIndex = lastEntry.doc.dIndex;
        lastEntry.assign({ nextDIndex: entry.doc.dIndex });
        await lastEntry.save();
      }
      return await entry.save();
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
    await dbDwdy.transaction(
      "rw",
      dbDwdy.diaryEntries,
      dbDwdy.diaries,
      async () => {
        if ((await currentEntry.prevEntry) || (await currentEntry.nextEntry)) {
          const cpEntry =
            (await currentEntry.prevEntry) ||
            new DiaryEntry(
              {},
              {
                dUid: currentEntry.doc.dUid,
                prevDIndex: currentEntry.doc.prevDIndex,
              }
            );
          const cnEntry =
            (await currentEntry.nextEntry) ||
            new DiaryEntry(
              {},
              {
                dUid: currentEntry.doc.dUid,
                nextDIndex: currentEntry.doc.nextDIndex,
              }
            );

          cpEntry.assign({ nextDIndex: cnEntry.doc.dIndex });
          cnEntry.assign({ prevDIndex: cpEntry.doc.dIndex });
          if (cpEntry.isStored) {
            await cpEntry.save();
          }
          if (cnEntry.isStored) {
            await cnEntry.save();
          }
        }
        const targetEntry = await this.fetchEntry({ dIndex: targetDIndex });
        if (!targetEntry) {
          throw new AppError({ code: "target_entry_not_found" });
        }
        const tpEntry =
          (await targetEntry.prevEntry) ||
          new DiaryEntry(
            {},
            {
              dUid: targetEntry.doc.dUid,
              prevDIndex: targetEntry.doc.prevDIndex,
            }
          );
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
        if (currentEntry.doc.nextDIndex === undefined) {
          this.doc.lastDIndex = currentEntry.doc.dIndex;
          this.save();
        }
        if (targetEntry.doc.nextDIndex === undefined) {
          this.doc.lastDIndex = targetEntry.doc.dIndex;
          this.save();
        }
      }
    );
    return currentEntry;
  }

  private async moveEntryToLast(currentEntry: DiaryEntry): Promise<DiaryEntry> {
    const lastEntry = await this.lastEntry;
    if (lastEntry && currentEntry.doc.dIndex) {
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
    const currentEntry = await this.fetchEntry({ dIndex });
    if (!currentEntry) {
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
      if (!entry) {
        return [];
      }
      entries.push(entry);
      while (entry.doc.nextDIndex) {
        const nextEntry: DiaryEntry | null = await entry.nextEntry;
        if (nextEntry) {
          entry = nextEntry;
          entries.push(entry);
        }
      }
    } else {
      let entry = await this.lastEntry;
      if (!entry) {
        return [];
      }
      entries.push(entry);
      while (entry.doc.prevDIndex) {
        const prevEntry: DiaryEntry | null = await entry.prevEntry;
        if (prevEntry) {
          entry = prevEntry;
          entries.push(entry);
        }
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
    feature: T
  ): DiaryFeatureStatMap[T] | undefined {
    const storedStat = this.doc.stat[feature] as DiaryFeatureStatMap[T];
    const defaultStat = defaultFeatureStat(feature);
    return Object.assign({}, defaultStat, storedStat);
  }

  public assignStat<T extends DiaryFeature>(
    feature: T,
    stat: DiaryFeatureStatMap[T]
  ): Diary {
    (this.doc.stat[feature] as DiaryFeatureStatMap[T]) = JSON.parse(
      JSON.stringify(stat)
    );
    return this;
  }

  public fetchDiaryConfig(): DiaryConfigAttrs {
    const storedConfig = this.doc.config.diary;
    return Object.assign({}, DEFAULT_DIARY_CONFIG_ATTRS, storedConfig);
  }

  public patchDiaryConfig(config: DiaryConfigParams): Diary {
    const fetchedConfig = this.fetchDiaryConfig();
    const givenConfig = JSON.parse(JSON.stringify(config));
    this.doc.config.diary = Object.assign(fetchedConfig, givenConfig);
    return this;
  }

  public fetchFeatureConfig<T extends DiaryFeature>(
    feature: T
  ): DiaryFeatureConfigMap[T] {
    const storedConfig = this.doc.config.content[
      feature
    ] as DiaryFeatureConfigMap[T];
    const defaultConfig = defaultFeatureConfig(feature);
    return Object.assign({}, defaultConfig, storedConfig);
  }

  public patchFeatureConfig<T extends DiaryFeature>(
    feature: T,
    config: Partial<DiaryFeatureConfigMap[T]>
  ): Diary {
    const fetchedConfig = this.fetchFeatureConfig(feature);
    const givenConfig = JSON.parse(JSON.stringify(config));
    (this.doc.config.content[feature] as DiaryFeatureConfigMap[T]) =
      Object.assign(fetchedConfig, givenConfig);
    return this;
  }

  public fetchLayoutConfig<T extends DiaryLayout>(
    layout: T
  ): DiaryLayoutConfigMap[T] {
    const storedConfig = this.doc.config.layout[
      layout
    ] as DiaryLayoutConfigMap[T];
    const defaultConfig = defaultLayoutConfig(layout);
    return Object.assign({}, defaultConfig, storedConfig);
  }

  public patchLayoutConfig<T extends DiaryLayout>(
    layout: T,
    config: Partial<DiaryLayoutConfigMap[T]>
  ): Diary {
    const fetchedConfig = this.fetchLayoutConfig(layout);
    const givenConfig = JSON.parse(JSON.stringify(config));
    (this.doc.config.layout[layout] as DiaryLayoutConfigMap[T]) = Object.assign(
      fetchedConfig,
      givenConfig
    );
    return this;
  }
}
