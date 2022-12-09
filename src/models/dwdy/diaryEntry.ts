import { DUid, DIndex } from "~/models/dwdy/diary";
import { InvalidParamsError } from "~/models/app/error";
import { dbDwdy } from "~/services/db/dwdy";
import { BaseModel } from "~/models/baseModel";
import { DiaryFeature } from "~/models/dwdy/feature";

const CONTENT_KEY_MAP: Record<DiaryFeature, string> = {
  [DiaryFeature.Essay]: "essays",
  [DiaryFeature.Image]: "images",
  [DiaryFeature.Sticker]: "stickers",
  [DiaryFeature.Illustration]: "illustrations",
};

export type DiaryContentValueType = string | Blob;

export interface DiaryEntryAttrs {
  essays: string[];
  images: Blob[];
  stickers: string[];
  illustrations: Blob[];
}

export const DEFAULT_ATTRS: DiaryEntryAttrs = {
  essays: [],
  images: [],
  stickers: [],
  illustrations: [],
};
export type DiaryEntryParams = Partial<DiaryEntryAttrs>;

export interface DiaryEntryIdentity {
  dUid: DUid;
  dIndex: DIndex;
}
export type DiaryEntryIdentityParams = Partial<DiaryEntryIdentity>;

export interface DiaryEntryDoc
  extends DiaryEntryAttrs,
    DiaryEntryIdentityParams {}
export type DiaryEntryDocParams = Partial<DiaryEntryDoc>;

export interface DiaryEntryExistingDoc
  extends DiaryEntryAttrs,
    DiaryEntryIdentity {}

export class DiaryEntry
  implements BaseModel<DiaryEntry, DiaryEntryDoc, DiaryEntryParams>
{
  doc: DiaryEntryDoc;

  static async fetch(entryIdy: DiaryEntryIdentity): Promise<DiaryEntry | null> {
    const deDoc = await dbDwdy.diaryEntries.where(entryIdy).first();
    if (!deDoc) {
      return null;
    }
    return new DiaryEntry(entryIdy, deDoc);
  }

  public constructor(
    entryIdy: DiaryEntryIdentityParams = {},
    doc: DiaryEntryDocParams = {}
  ) {
    this.doc = Object.assign(entryIdy, DEFAULT_ATTRS, doc);
  }

  get uid(): string | undefined {
    if (this.isReadyToSave) {
      return `${this.doc.dUid}_${this.doc.dIndex}`;
    } else {
      return undefined;
    }
  }

  get isReadyToSave(): boolean {
    return this.doc.dUid !== undefined && this.doc.dIndex !== undefined;
  }

  public assign(params: DiaryEntryParams): DiaryEntry {
    this.doc = Object.assign(this.doc, params);
    return this;
  }

  public async save(): Promise<{ target: DiaryEntry; action: string }> {
    if (!this.isReadyToSave) {
      throw new InvalidParamsError({
        params: ["dUid", "dIndex"],
        reason: "required",
      });
    }
    await dbDwdy.diaryEntries.put(
      JSON.parse(JSON.stringify(this.doc)) as DiaryEntryExistingDoc
    );
    return { target: this, action: "update" };
  }

  public fetchContents<T extends DiaryContentValueType>(
    feature: DiaryFeature
  ): T[] {
    const contents =
      this.doc[CONTENT_KEY_MAP[feature] as keyof DiaryEntryAttrs];
    if (!contents) {
      throw new InvalidParamsError({ params: ["feature"] });
    }
    return contents as T[];
  }

  public fetchContent(
    feature: DiaryFeature,
    index: number
  ): DiaryContentValueType {
    const contents = this.fetchContents(feature);
    return contents[index];
  }

  public appendContent(
    feature: DiaryFeature,
    value: DiaryContentValueType
  ): DiaryEntry {
    const contents = this.fetchContents(feature);
    contents.push(value);
    return this;
  }

  public assignContent(
    feature: DiaryFeature,
    index: number,
    value: DiaryContentValueType
  ): DiaryEntry {
    const contents = this.fetchContents(feature);
    this.checkContentIndex(contents, index);
    contents[index] = value;
    return this;
  }

  public deleteContent(feature: DiaryFeature, index: number): DiaryEntry {
    const contents = this.fetchContents(feature);
    this.checkContentIndex(contents, index);
    contents.splice(index, 1);
    return this;
  }

  public moveContent(
    feature: DiaryFeature,
    fromIndex: number,
    toIndex: number
  ): DiaryEntry {
    const contents = this.fetchContents(feature);
    this.checkContentIndex(contents, toIndex);
    this.checkContentIndex(contents, fromIndex);
    contents.splice(toIndex, 0, contents.splice(fromIndex, 1)[0]);
    return this;
  }

  private checkContentIndex<T = unknown>(contents: T[], index: number): void {
    if ((!index && index !== 0) || index < 0 || index >= contents.length) {
      throw new InvalidParamsError({ params: ["index"], reason: "invalid" });
    }
  }
}
