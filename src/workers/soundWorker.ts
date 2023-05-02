import * as Comlink from "comlink";
import fixWebmDuration from "fix-webm-duration";
import { DIndex, DUid } from "~/types/dwdy/core";
import { dbDwdy } from "~/services/db/dwdy";
import { genUid } from "~/services/db";
import { AudioRecord, DEFAULT_FEATURE_STAT } from "~/dwdy/feature/sound/def";
import { DiaryFeature } from "~/dwdy/feature/def";
import { Diary } from "~/models/dwdy/diary";
import { DiaryAttachment } from "~/models/dwdy/diaryAttachment";
import { SoundFrom } from "~/dwdy/feature/sound/def";

export async function addSound(
  dUid: DUid,
  dIndex: DIndex,
  blob: Blob,
  duration: number
): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaryAttachments,
    dbDwdy.diaries,
    async () => {
      if (!dUid || !dIndex) {
        return Promise<void>;
      }
      const diary = await Diary.fetch(dUid);
      if (!diary) {
        return Promise<void>;
      }
      const entry = await diary.fetchEntry({ dIndex });
      if (!entry) {
        return Promise<void>;
      }
      const da = await DiaryAttachment.upload(
        {
          dUid: dUid,
          dIndex: dIndex,
        },
        {
          fileName: `${genUid()}.webm`,
          fileType: "audio/webm",
          size: blob.size,
          blob: blob,
        }
      );
      const soundContent = {
        from: "record" as SoundFrom,
        daUid: da.doc.daUid,
        fileSize: blob.size,
        fileType: "audio/webm",
        fileExt: "webm",
        duration,
      };
      entry.appendContent<DiaryFeature.Sound>(DiaryFeature.Sound, soundContent);
      entry.save();
      let stat = diary.fetchStat<DiaryFeature.Sound>(DiaryFeature.Sound);
      if (!stat) {
        stat = Object.assign({}, DEFAULT_FEATURE_STAT);
      }
      stat["count"] += 1;
      stat["fileSize"] += blob.size;
      stat["duration"] += duration;
      diary.assignStat<DiaryFeature.Sound>(DiaryFeature.Sound, stat);
      await diary.save();
    }
  );
}

async function buildBlobFromRecord(record: AudioRecord): Promise<Blob> {
  const rawBlob = new Blob(record.chunks, {
    type: "audio/webm;codecs=opus",
  });
  return await fixWebmDuration(rawBlob, record.duration);
}

async function createSound(params: {
  dUid: DUid;
  dIndex: DIndex;
  record: AudioRecord;
}) {
  const blob = await buildBlobFromRecord(params.record);
  await addSound(params.dUid, params.dIndex, blob, params.record.duration);
}

const worker = {
  createSound,
};
export type WorkerType = typeof worker;

Comlink.expose(worker);
