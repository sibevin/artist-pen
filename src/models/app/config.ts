import { genUid } from "~/services/db";
import { dbApp } from "~/services/db/app";
import { BaseModel } from "~/models/baseModel";

export interface AppConfigAttrs {
  locale: string;
  timeZone: string;
  theme: string;
  encryptedPassword?: string;
}
export type AppConfigParams = Partial<AppConfigAttrs>;

export const DEFAULT_ATTRS: AppConfigAttrs = {
  locale: "en",
  timeZone: "UTC",
  theme: "snow",
};

export interface AppConfigDoc extends AppConfigAttrs {
  acUid?: string;
}
export type AppConfigDocParams = Partial<AppConfigDoc>;

export interface AppConfigExistingDoc extends AppConfigAttrs {
  acUid: string;
}

export class AppConfig
  implements BaseModel<AppConfig, AppConfigDoc, AppConfigParams>
{
  doc: AppConfigDoc;

  public constructor(doc: AppConfigDocParams = {}) {
    this.doc = Object.assign({}, DEFAULT_ATTRS, doc);
  }

  get uid(): string | undefined {
    return this.doc.acUid;
  }

  get isReadyToSave(): boolean {
    return this.uid !== undefined;
  }

  static async fetchCurrentConfig(): Promise<AppConfig | null> {
    const ccDocs = await dbApp.configs.limit(1).toArray();
    if (ccDocs.length === 0) {
      return null;
    }
    return new AppConfig(ccDocs[0]);
  }

  static async fetch(uid: string): Promise<AppConfig | null> {
    const ccDoc = await dbApp.configs.where({ acUid: uid }).first();
    if (!ccDoc) {
      return null;
    }
    return new AppConfig(ccDoc);
  }

  public assign(params: AppConfigParams): AppConfig {
    this.doc = Object.assign(this.doc, params);
    return this;
  }

  public async save(): Promise<{ target: AppConfig; action: string }> {
    let docToSave = Object.assign({}, this.doc);
    let action = "update";
    if (!this.isReadyToSave) {
      docToSave = Object.assign(docToSave, { acUid: genUid() });
      action = "create";
    }
    await dbApp.configs.put(
      JSON.parse(JSON.stringify(docToSave)) as AppConfigExistingDoc
    );
    this.doc = docToSave;
    return { target: this, action };
  }
}
