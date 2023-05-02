import * as Comlink from "comlink";
import { DIndex, DUid } from "~/types/dwdy/core";
import {
  DiaryAttachment,
  DiaryAttachmentDoc,
} from "~/models/dwdy/diaryAttachment";

async function loadAttachmentMap(params: {
  dUid: DUid;
  dIndex: DIndex;
  daUids: DUid[];
}) {
  const daMap: Record<DUid, DiaryAttachmentDoc> = {};
  for (let i = 0; i < params.daUids.length; i++) {
    const daUid = params.daUids[i];
    const da = await DiaryAttachment.fetch({
      dUid: params.dUid,
      dIndex: params.dIndex,
      daUid,
    });
    if (da) {
      daMap[daUid] = da.doc;
    }
  }
  return daMap;
}

async function loadAttachment(params: {
  dUid: DUid;
  dIndex: DIndex;
  daUid: DUid;
}) {
  const da = await DiaryAttachment.fetch(params);
  return da ? da.doc : undefined;
}

const worker = {
  loadAttachmentMap,
  loadAttachment,
};
export type WorkerType = typeof worker;

Comlink.expose(worker);
