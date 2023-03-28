import { DUid } from "~/dwdy/types/core";
import {
  DiaryAttachment,
  DiaryAttachmentDoc,
} from "~/models/dwdy/diaryAttachment";

onmessage = async function (e) {
  const { dUid, dIndex, daUids } = e.data;
  const daMap: Record<DUid, DiaryAttachmentDoc> = {};
  for (let i = 0; i < daUids.length; i++) {
    const daUid = daUids[i];
    const da = await DiaryAttachment.fetch({ dUid, dIndex, daUid });
    if (da) {
      daMap[daUid] = da.doc;
    }
  }
  postMessage({ daMap });
};
