import { DUid, DIndex } from "~/types/dwdy/core";
import { DiaryEntryFetchParams } from "~/models/dwdy/diary";
import { InvalidParamsError } from "~/models/app/error";
import { dbDwdy } from "~/services/db/dwdy";
import { BaseModel } from "~/models/baseModel";
import { DiaryFeature } from "~/dwdy/feature/def";
import { DiaryAttachment } from "~/models/dwdy/diaryAttachment";
import {
  DiaryFeatureContentMap,
  DiaryFeatureMetaMap,
} from "~/dwdy/feature/map";
import { getNeighborDt, isToday, entryTsToDt } from "~/services/dwdy/dateUtils";
import { genUid } from "~/services/db";
import {
  DiaryEntryIdentity,
  DiaryEntryIdentityParams,
  GeoRange,
} from "~/types/dwdy/core";
import {
  SearchQuery,
  SearchKeywordOption,
  SearchKeywordMatch,
} from "~/types/dwdy/search";
import { findKeywordMatch } from "~/services/dwdy/search";

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

  get identity(): DiaryEntryIdentityParams {
    return { dUid: this.doc.dUid, dIndex: this.doc.dIndex };
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

  public async reload(): Promise<boolean> {
    if (this.doc.dUid) {
      const fetchedEntry = await DiaryEntry.fetch({
        dUid: this.doc.dUid,
        dIndex: this.doc.dIndex,
      });
      if (fetchedEntry) {
        this.doc = fetchedEntry.doc;
        return true;
      }
    }
    return false;
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

  private checkContentIndex<T = unknown>(contents: T[], index: number): void {
    if ((!index && index !== 0) || index < 0 || index >= contents.length) {
      throw new InvalidParamsError({ params: ["index"], reason: "invalid" });
    }
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

  public isKeywordsFound(query: SearchQuery): boolean {
    for (let i = 0; i < query.keywords.length; i++) {
      const keyword = query.keywords[i];
      if (
        this.doc.title &&
        findKeywordMatch(keyword, this.doc.title, query.keywordOption, false)
          .index >= 0
      ) {
        return true;
      }
      const textContents = this.fetchContents<DiaryFeature.Text>(
        DiaryFeature.Text
      );
      if (textContents.length > 0) {
        for (let j = 0; j < textContents.length; j++) {
          if (
            findKeywordMatch(
              keyword,
              textContents[j].raw,
              query.keywordOption,
              false
            ).index >= 0
          ) {
            return true;
          }
        }
      }
      const imageContents = this.fetchContents<DiaryFeature.Image>(
        DiaryFeature.Image
      );
      if (imageContents.length > 0) {
        for (let j = 0; j < imageContents.length; j++) {
          const comment = imageContents[j].comment;
          if (
            comment &&
            findKeywordMatch(keyword, comment, query.keywordOption, false)
              .index >= 0
          ) {
            return true;
          }
        }
      }
      const soundContents = this.fetchContents<DiaryFeature.Sound>(
        DiaryFeature.Sound
      );
      if (soundContents.length > 0) {
        for (let j = 0; j < soundContents.length; j++) {
          const comment = soundContents[j].comment;
          if (
            comment &&
            findKeywordMatch(keyword, comment, query.keywordOption, false)
              .index >= 0
          ) {
            return true;
          }
        }
      }
      const tagContents = this.fetchContents<DiaryFeature.Tag>(
        DiaryFeature.Tag
      );
      if (tagContents.length > 0) {
        for (let j = 0; j < tagContents.length; j++) {
          if (
            findKeywordMatch(
              keyword,
              tagContents[j],
              query.keywordOption,
              false
            ).index >= 0
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public getKeywordMatches(
    keywords: string[],
    option: SearchKeywordOption
  ): Record<string, SearchKeywordMatch[]> {
    if (keywords.length === 0) {
      return {};
    }
    const matches: Record<string, SearchKeywordMatch[]> = {};
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      matches[keyword] = [];
      if (this.doc.title) {
        const km = findKeywordMatch(keyword, this.doc.title, option);
        if (km.index >= 0) {
          matches[keyword].push(
            Object.assign({ source: "title" }, km) as SearchKeywordMatch
          );
        }
      }
      const textContents = this.fetchContents<DiaryFeature.Text>(
        DiaryFeature.Text
      );
      if (textContents.length > 0) {
        for (let j = 0; j < textContents.length; j++) {
          const km = findKeywordMatch(keyword, textContents[j].raw, option);
          if (km.index >= 0) {
            matches[keyword].push(
              Object.assign(
                { source: "feature", feature: DiaryFeature.Text },
                km
              ) as SearchKeywordMatch
            );
          }
        }
      }
    }
    return matches;
  }
}
