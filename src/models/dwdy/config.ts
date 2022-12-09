import { genUid } from "~/services/db";
import { dbDwdy } from "~/services/db/dwdy";
import { BaseModel } from "~/models/baseModel";
import { DiarySortedBy } from "~/models/dwdy/diarySortedBy";

export const WEEK_DAYS = [...Array(7).keys()] as const;
export type WeekDay = typeof WEEK_DAYS[number];

export enum DiaryTimelineOrder {
  DIndexAsc = "d_index_asc",
  DIndexDesc = "d_index_desc",
}

export enum FontFamily {
  SansSerif = "sans_serif",
  Serif = "serif",
}

export enum FontFormatSize {
  XS = "xs",
  S = "s",
  M = "m",
  L = "l",
  XL = "xl",
}

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
    fontFamily: FontFamily.SansSerif,
    fontSize: FontFormatSize.M,
    fontLineHeight: FontFormatSize.M,
    fontLetterSpacing: FontFormatSize.M,
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

  get isReadyToSave(): boolean {
    return this.uid !== undefined;
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
}
