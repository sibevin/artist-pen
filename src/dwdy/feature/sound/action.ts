import { dbDwdy } from "~/services/db/dwdy";
import { genUid } from "~/services/db";
import { DiaryAttachment } from "~/models/dwdy/diaryAttachment";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { FeatureMeta, FeatureStat } from "~/dwdy/feature/sound/def";

const DEFAULT_META: FeatureMeta = {
  fileSize: 0,
  duration: 0,
};

const DEFAULT_STAT: FeatureStat = {
  count: 0,
  fileSize: 0,
  duration: 0,
};

async function updateDiarySoundStat(
  statDelta: Partial<FeatureStat>
): Promise<void> {
  const dwdyState = useDwdyState();
  let stat = dwdyState.diary.value.fetchStat<DiaryFeature.Sound>(
    DiaryFeature.Sound
  );
  if (!stat) {
    if (statDelta.count && statDelta.count > 0) {
      stat = Object.assign({}, DEFAULT_STAT);
    } else {
      return;
    }
  }
  stat["count"] += statDelta.count || 0;
  stat["fileSize"] += statDelta.fileSize || 0;
  stat["duration"] += statDelta.fileSize || 0;
  dwdyState.diary.value.assignStat<DiaryFeature.Sound>(
    DiaryFeature.Sound,
    stat
  );
  await dwdyState.diary.value.save();
}

export async function addEmptySound(): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    async () => {
      const dwdyState = useDwdyState();
      dwdyState.entry.value.appendContent<DiaryFeature.Sound>(
        DiaryFeature.Sound,
        Object.assign({}, DEFAULT_META)
      );
      await dwdyState.entry.value.save();
      await updateDiarySoundStat({
        count: 1,
      });
      dwdyState.updateEntry(dwdyState.entry.value.doc);
    }
  );
}

export async function addSound(blob: Blob, duration: number): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaryAttachments,
    dbDwdy.diaries,
    async () => {
      const dwdyState = useDwdyState();
      if (dwdyState.entry.value.doc.dUid && dwdyState.entry.value.doc.dIndex) {
        const da = await DiaryAttachment.upload(
          {
            dUid: dwdyState.entry.value.doc.dUid,
            dIndex: dwdyState.entry.value.doc.dIndex,
          },
          {
            fileName: `${genUid()}.webm`,
            fileType: "audio/webm",
            size: blob.size,
            data: "test",
            blob: blob,
          }
        );
        const soundContent = {
          daUid: da.doc.daUid,
          fileSize: blob.size,
          duration,
        };
        dwdyState.entry.value.appendContent<DiaryFeature.Sound>(
          DiaryFeature.Sound,
          soundContent
        );
        await dwdyState.entry.value.save();
        await updateDiarySoundStat({ count: 1, fileSize: blob.size, duration });
        dwdyState.updateEntry(dwdyState.entry.value.doc);
      }
      return Promise<void>;
    }
  );
}

export async function deleteSound(index: number): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaryAttachments,
    dbDwdy.diaries,
    async () => {
      const dwdyState = useDwdyState();
      const selectedContent =
        dwdyState.entry.value.fetchContent<DiaryFeature.Sound>(
          DiaryFeature.Sound,
          index
        );
      if (!selectedContent || !selectedContent.daUid) {
        return Promise<void>;
      }
      const da = await dwdyState.entry.value.fetchAttachment(
        selectedContent.daUid
      );
      if (!da) {
        return Promise<void>;
      }
      await da.delete();
      dwdyState.entry.value.deleteContent(DiaryFeature.Sound, index);
      await updateDiarySoundStat({
        count: -1,
        fileSize: -selectedContent.fileSize,
        duration: -selectedContent.duration,
      });
      await dwdyState.entry.value.save();
      dwdyState.updateEntry(dwdyState.entry.value.doc);
      return Promise<void>;
    }
  );
}
