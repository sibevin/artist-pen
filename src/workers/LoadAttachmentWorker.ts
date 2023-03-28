import { DiaryAttachment } from "~/models/dwdy/diaryAttachment";

onmessage = async function (e) {
  const { dUid, dIndex, daUid } = e.data;
  const da = await DiaryAttachment.fetch({ dUid, dIndex, daUid });
  postMessage({ da: da });
};
