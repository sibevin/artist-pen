import { genUid } from "~/services/db";
import { dbDwdy } from "~/services/db/dwdy";
import { BaseModel } from "~/models/baseModel";
import {
  WeekDay,
  DiarySortedBy,
  DiaryTimelineOrder,
  DiaryFontFamily,
  DiaryFontFormatSize,
} from "~/dwdy/services/configOption";
import { TagValue } from "~/dwdy/feature/tag/def";

export interface DiaryConfigAttrs {
  highlightedWeekDays: WeekDay[];
  firstWeekDay: WeekDay;
  isWeekShown: boolean;
  timelineOrder: DiaryTimelineOrder;
}

export type DiaryConfigParams = Partial<DiaryConfigAttrs>;

export interface DwdyConfigAttrs extends DiaryConfigAttrs {
  encryptedPassword?: string;
  diariesSortedBy: DiarySortedBy;
  isContentMenuShown: boolean;
  recentStickerCodes: string[];
  fontFamily: string;
  fontSize: string;
  fontLineHeight: string;
  fontLetterSpacing: string;
  tagDistribution: Record<TagValue, number>;
}

export type DwdyConfigParams = Partial<DwdyConfigAttrs>;

export const DEFAULT_DIARY_CONFIG_ATTRS: DiaryConfigAttrs = {
  highlightedWeekDays: [0, 6] as WeekDay[],
  firstWeekDay: 0 as WeekDay,
  isWeekShown: true,
  timelineOrder: DiaryTimelineOrder.DIndexAsc,
};

export const DEFAULT_ATTRS: DwdyConfigAttrs = Object.assign(
  {},
  DEFAULT_DIARY_CONFIG_ATTRS,
  {
    diariesSortedBy: DiarySortedBy.UpdateDesc,
    isContentMenuShown: true,
    recentStickerCodes: [],
    fontFamily: DiaryFontFamily.SansSerif,
    fontSize: DiaryFontFormatSize.M,
    fontLineHeight: DiaryFontFormatSize.M,
    fontLetterSpacing: DiaryFontFormatSize.M,
    tagDistribution: {},
  }
);

export interface DwdyConfigDoc extends DwdyConfigAttrs {
  dcUid?: string;
}
export type DwdyConfigDocParams = Partial<DwdyConfigDoc>;

export interface DwdyConfigExistingDoc extends DwdyConfigAttrs {
  dcUid: string;
}

export class DwdyConfig
  implements BaseModel<DwdyConfig, DwdyConfigDoc, DwdyConfigParams>
{
  doc: DwdyConfigDoc;

  public constructor(doc: DwdyConfigDocParams = {}) {
    this.doc = Object.assign({}, DEFAULT_ATTRS, doc);
  }

  get uid(): string | undefined {
    return this.doc.dcUid;
  }

  get isStored(): boolean {
    return this.uid !== undefined;
  }

  private get isReadyToSave(): boolean {
    return this.isStored;
  }

  static async fetchCurrentConfig(): Promise<DwdyConfig | null> {
    const dcDocs = await dbDwdy.configs.limit(1).toArray();
    if (dcDocs.length === 0) {
      return null;
    }
    return new DwdyConfig(dcDocs[0]);
  }

  static async fetch(uid: string): Promise<DwdyConfig | null> {
    const dcDoc = await dbDwdy.configs.where({ dcUid: uid }).first();
    if (!dcDoc) {
      return null;
    }
    return new DwdyConfig(dcDoc);
  }

  public assign(params: DwdyConfigParams): DwdyConfig {
    this.doc = Object.assign(this.doc, params);
    return this;
  }

  public async save(): Promise<{ target: DwdyConfig; action: string }> {
    let docToSave = Object.assign({}, this.doc);
    let action = "update";
    if (!this.isReadyToSave) {
      docToSave = Object.assign(docToSave, { dcUid: genUid() });
      action = "create";
    }
    await dbDwdy.configs.put(
      JSON.parse(JSON.stringify(docToSave)) as DwdyConfigExistingDoc
    );
    this.doc = docToSave;
    return { target: this, action };
  }

  public textFontStyle(): string {
    return `font-fs-${this.doc.fontSize} font-ff-${this.doc.fontFamily} font-lh-${this.doc.fontLineHeight} font-ls-${this.doc.fontLetterSpacing}`;
  }
}
