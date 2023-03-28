import { DUid, DIndex } from "~/dwdy/types/core";
import { DiaryEntryIdentity } from "~/models/dwdy/diaryEntry";
import { InvalidParamsError } from "~/models/app/error";
import { dbDwdy } from "~/services/db/dwdy";
import { BaseModel } from "~/models/baseModel";
import { genUid, normalizeObject } from "~/services/db";

export type DiaryAttachmentFile = {
  fileName: string;
  fileType: string;
  size: number;
  data?: string;
  blob?: Blob;
  buffer?: ArrayBuffer;
};

export interface DiaryAttachmentAttrs extends DiaryAttachmentFile {
  createdAt: Date;
}

export type DiaryAttachmentParams = Partial<DiaryAttachmentAttrs>;

export interface DiaryAttachmentIdentity {
  dUid: DUid;
  dIndex: DIndex;
  daUid: DUid;
}
export type DiaryAttachmentIdentityParams = Partial<DiaryAttachmentIdentity>;

export interface DiaryAttachmentDoc
  extends DiaryAttachmentAttrs,
    DiaryAttachmentIdentityParams {}
export type DiaryAttachmentDocParams = Partial<DiaryAttachmentDoc>;

export type DiaryAttachmentDocMap = Record<DUid, DiaryAttachmentDoc>;

export interface DiaryAttachmentExistingDoc
  extends DiaryAttachmentAttrs,
    DiaryAttachmentIdentity {}

export class DiaryAttachment
  implements
    BaseModel<DiaryAttachment, DiaryAttachmentDoc, DiaryAttachmentParams>
{
  doc: DiaryAttachmentExistingDoc;
  public isSaved: boolean;

  static async fetch(
    daIdy: DiaryAttachmentIdentity
  ): Promise<DiaryAttachment | null> {
    const daDoc = await dbDwdy.diaryAttachments.where(daIdy).first();
    if (daDoc) {
      return new DiaryAttachment(daDoc, { isSaved: true });
    } else {
      return null;
    }
  }

  static async upload(
    entryIdy: DiaryEntryIdentity,
    file: DiaryAttachmentFile
  ): Promise<DiaryAttachment> {
    const daDoc = Object.assign(
      {
        daUid: genUid(),
        createdAt: new Date(),
      },
      entryIdy,
      file
    );
    const da = new DiaryAttachment(daDoc);
    await da.save();
    return da;
  }

  public constructor(
    doc: DiaryAttachmentExistingDoc,
    option: { isSaved?: boolean } = {}
  ) {
    this.doc = Object.assign({}, doc);
    this.isSaved = option.isSaved || false;
  }

  get uid(): string | undefined {
    if (this.isReadyToSave) {
      return `${this.doc.dUid}_${this.doc.dIndex}_${this.doc.daUid}`;
    } else {
      return undefined;
    }
  }

  get isStored(): boolean {
    return (
      this.doc.dUid !== undefined &&
      this.doc.dIndex !== undefined &&
      this.doc.daUid !== undefined &&
      this.isSaved
    );
  }

  get presence(): DiaryAttachment | undefined {
    if (this.isStored) {
      return this;
    } else {
      return undefined;
    }
  }

  get daIdy(): DiaryAttachmentIdentity {
    return {
      dUid: this.doc.dUid,
      dIndex: this.doc.dIndex,
      daUid: this.doc.daUid,
    };
  }

  private get isReadyToSave(): boolean {
    return (
      this.doc.dUid !== undefined &&
      this.doc.dIndex !== undefined &&
      this.doc.daUid !== undefined
    );
  }

  public assign(params: DiaryAttachmentParams): DiaryAttachment {
    this.doc = Object.assign(this.doc, params);
    return this;
  }

  public async save(): Promise<{ target: DiaryAttachment; action: string }> {
    if (!this.isReadyToSave) {
      throw new InvalidParamsError({
        params: ["dUid", "dIndex", "daUid"],
        reason: "required",
      });
    }
    await dbDwdy.diaryAttachments.put(
      normalizeObject(this.doc, {
        except: ["blob", "buffer"],
      }) as DiaryAttachmentExistingDoc
    );
    if (this.isSaved) {
      return { target: this, action: "update" };
    } else {
      this.isSaved = true;
      return { target: this, action: "create" };
    }
  }

  public async delete(): Promise<DiaryAttachment> {
    if (this.isSaved) {
      await dbDwdy.diaryAttachments.where(this.daIdy).delete();
      this.isSaved = false;
    }
    return this;
  }
}
