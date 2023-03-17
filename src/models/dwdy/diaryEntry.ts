import { mdiCheckboxMultipleBlank } from "@mdi/js";
import { DUid, DIndex } from "~/dwdy/types/core";
import { DiaryEntryFetchParams } from "~/models/dwdy/diary";
import { InvalidParamsError } from "~/models/app/error";
import { dbDwdy } from "~/services/db/dwdy";
import { Icon } from "~/models/app/types";
import { BaseModel } from "~/models/baseModel";
import { DiaryFeature } from "~/dwdy/feature/def";
import { DiaryAttachment } from "~/models/dwdy/diaryAttachment";
import {
  DiaryFeatureContentMap,
  DiaryFeatureMetaMap,
  featureIcon,
} from "~/dwdy/feature/map";
import { getNeighborDt, isToday, entryTsToDt } from "~/dwdy/services/dateUtils";
import { genUid } from "~/services/db";
import { GeoRange } from "~/dwdy/types/core";

type NavInfo = {
  nextDayDt?: Date;
  prevDayDt?: Date;
  nextMonthDt?: Date;
  prevMonthDt?: Date;
  nextEntry?: DiaryEntry | null;
  prevEntry?: DiaryEntry | null;
  isToday?: boolean;
};

export interface DiaryEntryAttrs {
  timestamp?: number;
  longitude?: number;
  latitude?: number;
  prevDIndex?: DIndex;
  nextDIndex?: DIndex;
  content: Partial<DiaryFeatureContentMap>;
  title?: string;
}

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

const ENTRY_EXTRA_GEO_DEG = 0.01;

export class DiaryEntry
  implements BaseModel<DiaryEntry, DiaryEntryDoc, DiaryEntryParams>
{
  doc: DiaryEntryDoc;

  static async fetch(
    params: DiaryEntryFetchParams & { dUid: DUid }
  ): Promise<DiaryEntry | null> {
    const deDoc = await dbDwdy.diaryEntries.get(params);
    if (deDoc) {
      return new DiaryEntry(deDoc);
    } else {
      return null;
    }
  }

  public constructor(
    entryIdy: DiaryEntryIdentityParams = {},
    doc?: DiaryEntryDocParams
  ) {
    const givenDoc = doc || entryIdy;
    this.doc = Object.assign({}, entryIdy, { content: {} }, givenDoc);
  }

  get uid(): string | undefined {
    if (this.isStored) {
      return `${this.doc.dUid}_${this.doc.dIndex}`;
    } else {
      return undefined;
    }
  }

  get isStored(): boolean {
    return this.doc.dUid !== undefined && this.doc.dIndex !== undefined;
  }

  get tsDate(): Date | null {
    if (this.doc.timestamp) {
      return entryTsToDt(this.doc.timestamp);
    } else {
      return null;
    }
  }

  get geoRange(): GeoRange | null {
    if (this.doc.longitude && this.doc.latitude) {
      return {
        lngBegin: this.doc.longitude - ENTRY_EXTRA_GEO_DEG,
        lngEnd: this.doc.longitude + ENTRY_EXTRA_GEO_DEG,
        latBegin: this.doc.latitude - ENTRY_EXTRA_GEO_DEG,
        latEnd: this.doc.latitude + ENTRY_EXTRA_GEO_DEG,
      };
    } else {
      return null;
    }
  }

  get nextEntry(): Promise<DiaryEntry | null> {
    return (async () => {
      if (this.doc.dUid && this.doc.nextDIndex) {
        return await DiaryEntry.fetch({
          dUid: this.doc.dUid,
          dIndex: this.doc.nextDIndex,
        });
      } else {
        return null;
      }
    })();
  }

  get prevEntry(): Promise<DiaryEntry | null> {
    return (async () => {
      if (this.doc.dUid && this.doc.prevDIndex) {
        return DiaryEntry.fetch({
          dUid: this.doc.dUid,
          dIndex: this.doc.prevDIndex,
        });
      } else {
        return null;
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
      const ni = {
        nextEntry: await this.nextEntry,
        prevEntry: await this.prevEntry,
      };
      if (this.tsDate) {
        return Object.assign(ni, {
          nextDayDt: getNeighborDt(this.tsDate, {
            direction: "next",
            unit: "day",
          }),
          prevDayDt: getNeighborDt(this.tsDate, {
            direction: "prev",
            unit: "day",
          }),
          nextMonthDt: getNeighborDt(this.tsDate, {
            direction: "next",
            unit: "month",
          }),
          prevMonthDt: getNeighborDt(this.tsDate, {
            direction: "prev",
            unit: "month",
          }),
          isToday: isToday(this.tsDate),
        });
      } else {
        return ni;
      }
    })();
  }

  public assign(params: DiaryEntryParams): DiaryEntry {
    this.doc = Object.assign(this.doc, params);
    return this;
  }

  public async save(): Promise<{ target: DiaryEntry; action: string }> {
    if (this.doc.dUid === undefined) {
      throw new InvalidParamsError({
        params: ["dUid"],
        reason: "required",
      });
    }
    let docToSave = this.doc;
    let action = "update";
    if (!this.doc.dIndex) {
      docToSave = Object.assign({}, docToSave, { dIndex: genUid() });
      action = "create";
    }
    await dbDwdy.diaryEntries.put(
      JSON.parse(JSON.stringify(docToSave)) as DiaryEntryExistingDoc
    );
    return { target: this, action };
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

  public get hasContentFeatures(): DiaryFeature[] {
    const features: DiaryFeature[] = [];
    Object.keys(this.doc.content).forEach((key) => {
      const contentValues =
        this.doc.content[key as keyof DiaryFeatureContentMap];
      if (contentValues && contentValues.length > 0) {
        features.push(key as keyof DiaryFeatureContentMap as DiaryFeature);
      }
    });
    return features;
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
