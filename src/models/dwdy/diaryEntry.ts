import { mdiCheckboxMultipleBlank } from "@mdi/js";
import { DUid, DIndex } from "~/models/dwdy/diary";
import { InvalidParamsError } from "~/models/app/error";
import { dbDwdy } from "~/services/db/dwdy";
import { Icon } from "~/models/app/types";
import { BaseModel } from "~/models/baseModel";
import { DiaryFeature } from "~/models/dwdy/feature";
import { DiaryAttachment } from "~/models/dwdy/diaryAttachment";
import {
  DiaryFeatureContentMap,
  DiaryFeatureMetaMap,
  featureIcon,
} from "~/models/dwdy/featureDef";
import {
  dIndexToDt,
  getNeighborDt,
  isDateDIndex,
  isToday,
} from "~/models/dwdy/dateUtils";

export type NavInfo = {
  available: boolean;
  nextDayDt?: Date;
  prevDayDt?: Date;
  nextMonthDt?: Date;
  prevMonthDt?: Date;
  nextEntry?: DiaryEntry;
  prevEntry?: DiaryEntry;
  isToday?: boolean;
};

export interface DiaryEntryAttrs {
  prevDIndex?: DIndex;
  nextDIndex?: DIndex;
  content: Partial<DiaryFeatureContentMap>;
  title?: string;
}

export type DiaryEntryParams = Partial<DiaryEntryAttrs>;

export interface DiaryEntryIdentity {
  dUid: DUid;
  dIndex: DIndex;
  isSaved?: boolean;
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
  public isSaved: boolean;

  static async fetch(entryIdy: DiaryEntryIdentity): Promise<DiaryEntry> {
    const deDoc = await dbDwdy.diaryEntries.where(entryIdy).first();
    if (deDoc) {
      return new DiaryEntry(Object.assign(deDoc, { isSaved: true }));
    } else {
      return new DiaryEntry(entryIdy);
    }
  }

  public constructor(
    entryIdy: DiaryEntryIdentityParams = {},
    doc?: DiaryEntryDocParams
  ) {
    const givenDoc = doc || entryIdy;
    this.doc = Object.assign({}, entryIdy, { content: {} }, givenDoc);
    delete this.doc.isSaved;
    this.isSaved = entryIdy.isSaved || false;
  }

  get uid(): string | undefined {
    if (this.isReadyToSave) {
      return `${this.doc.dUid}_${this.doc.dIndex}`;
    } else {
      return undefined;
    }
  }

  get isStored(): boolean {
    return (
      this.doc.dUid !== undefined &&
      this.doc.dIndex !== undefined &&
      this.isSaved
    );
  }

  get dIndexDate(): Date | null {
    if (this.doc.dIndex && isDateDIndex(this.doc.dIndex)) {
      return dIndexToDt(this.doc.dIndex);
    } else {
      return null;
    }
  }

  get nextEntry(): Promise<DiaryEntry> {
    return (async () => {
      if (this.doc.dUid && this.doc.nextDIndex) {
        return await DiaryEntry.fetch({
          dUid: this.doc.dUid,
          dIndex: this.doc.nextDIndex,
        });
      } else {
        return new DiaryEntry({
          dUid: this.doc.dUid,
          dIndex: this.doc.nextDIndex,
        });
      }
    })();
  }

  get prevEntry(): Promise<DiaryEntry> {
    return (async () => {
      if (this.doc.dUid && this.doc.prevDIndex) {
        return DiaryEntry.fetch({
          dUid: this.doc.dUid,
          dIndex: this.doc.prevDIndex,
        });
      } else {
        return new DiaryEntry({
          dUid: this.doc.dUid,
          dIndex: this.doc.prevDIndex,
        });
      }
    })();
  }

  get presence(): DiaryEntry | undefined {
    if (this.isStored) {
      return this;
    } else {
      return undefined;
    }
  }

  get navInfo(): Promise<NavInfo> {
    return (async () => {
      if (this.dIndexDate) {
        return {
          available: true,
          nextDayDt: getNeighborDt(this.dIndexDate, "next", "day"),
          prevDayDt: getNeighborDt(this.dIndexDate, "prev", "day"),
          nextMonthDt: getNeighborDt(this.dIndexDate, "next", "month"),
          prevMonthDt: getNeighborDt(this.dIndexDate, "prev", "month"),
          nextEntry: (await this.nextEntry).presence,
          prevEntry: (await this.prevEntry).presence,
          isToday: isToday(this.dIndexDate),
        };
      } else {
        return {
          available: false,
        };
      }
    })();
  }

  private get isReadyToSave(): boolean {
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
    if (this.isSaved) {
      return { target: this, action: "update" };
    } else {
      this.isSaved = true;
      return { target: this, action: "create" };
    }
  }

  public get hasContents(): boolean {
    let totalCount = 0;
    Object.values(this.doc.content).forEach((contents) => {
      if (contents) {
        totalCount += contents.length;
      }
    });
    return totalCount > 0;
  }

  public get contentIcon(): Icon | null {
    if (!this.hasContents) {
      return null;
    }
    let contentCount = 0;
    let feature: DiaryFeature | null = null;
    Object.keys(this.doc.content).forEach((key) => {
      const contentValues =
        this.doc.content[key as keyof DiaryFeatureContentMap];
      if (contentValues && contentValues.length > 0) {
        contentCount++;
        feature = key as keyof DiaryFeatureContentMap as DiaryFeature;
      }
    });
    if (contentCount > 1) {
      return {
        set: "mdi",
        path: mdiCheckboxMultipleBlank,
      };
    }
    if (feature) {
      return featureIcon(feature);
    } else {
      return null;
    }
  }

  public fetchContents<T extends DiaryFeature>(
    feature: DiaryFeature
  ): DiaryFeatureMetaMap[T][] {
    if (this.doc.content[feature] === undefined) {
      this.doc.content[feature] = [];
    }
    return this.doc.content[feature] as DiaryFeatureMetaMap[T][];
  }

  public contentSize(feature: DiaryFeature): number {
    return this.fetchContents(feature).length;
  }

  public hasContent(feature: DiaryFeature): boolean {
    return this.contentSize(feature) > 0;
  }

  public fetchContent<T extends DiaryFeature>(
    feature: DiaryFeature,
    index: number
  ): DiaryFeatureMetaMap[T] {
    const contents = this.fetchContents<T>(feature);
    return contents[index];
  }

  public appendContent<T extends DiaryFeature>(
    feature: DiaryFeature,
    value: DiaryFeatureMetaMap[T]
  ): DiaryEntry {
    const contents = this.fetchContents<T>(feature);
    contents.push(value);
    return this;
  }

  public assignContent<T extends DiaryFeature>(
    feature: DiaryFeature,
    index: number,
    value: DiaryFeatureMetaMap[T]
  ): DiaryEntry {
    const contents = this.fetchContents<T>(feature);
    if (index === contents.length) {
      contents.push(value);
    } else {
      this.checkContentIndex(contents, index);
      contents[index] = value;
    }
    return this;
  }

  public assignContents<T extends DiaryFeature>(
    feature: DiaryFeature,
    values: DiaryFeatureMetaMap[T][]
  ): DiaryEntry {
    (this.doc.content[feature] as DiaryFeatureMetaMap[T][]) = JSON.parse(
      JSON.stringify(values)
    );
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

  public async fetchAttachment(daUid: DUid): Promise<DiaryAttachment | null> {
    if (this.doc.dUid && this.doc.dIndex) {
      return await DiaryAttachment.fetch({
        dUid: this.doc.dUid,
        dIndex: this.doc.dIndex,
        daUid,
      });
    } else {
      return null;
    }
  }

  private checkContentIndex<T = unknown>(contents: T[], index: number): void {
    if ((!index && index !== 0) || index < 0 || index >= contents.length) {
      throw new InvalidParamsError({ params: ["index"], reason: "invalid" });
    }
  }
}
