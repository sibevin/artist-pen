import { dbDwdy } from "~/services/db/dwdy";
import { genUid } from "~/services/db";
import {
  DiaryAttachment,
  DiaryAttachmentDoc,
} from "~/models/dwdy/diaryAttachment";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import {
  SoundFrom,
  FeatureConfig,
  FeatureMeta,
  FeatureStat,
  SoundSource,
} from "~/dwdy/feature/sound/def";
import { DUid } from "~/dwdy/types/core";
import { displayFileName, genRandomFileName } from "~/services/file";

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

export function buildSoundSources(
  contents: FeatureMeta[],
  daMap: Record<DUid, DiaryAttachmentDoc>
): SoundSource[] {
  const sources: SoundSource[] = [];
  for (let i = 0; i < contents.length; i++) {
    const content = contents[i];
    if (!content.daUid) {
      continue;
    }
    const daDoc = daMap[content.daUid];
    if (daDoc && daDoc.blob) {
      sources.push({
        meta: content,
        data: daDoc.blob,
      });
    }
  }
  return sources;
}

export function chooseNextTrackIndex(
  config: FeatureConfig,
  currentIndex: number,
  totalTrackCount: number,
  randomPlayedIndexes: number[]
): number | null {
  if (!config.isAutoplayOn) {
    return null;
  }
  if (config.repeat === "single") {
    return currentIndex;
  }
  if (config.repeat === "none") {
    if (currentIndex === totalTrackCount - 1) {
      return null;
    } else {
      return (currentIndex + 1) % totalTrackCount;
    }
  }
  // config.repeat === "all"
  if (!config.isShuffleOn) {
    return (currentIndex + 1) % totalTrackCount;
  }
  // config.isShuffleOn === true
  let candidates = [...Array(totalTrackCount).keys()];
  if (randomPlayedIndexes.length === totalTrackCount) {
    candidates = candidates.filter((index) => index !== currentIndex);
  } else {
    candidates = candidates.filter(
      (index) => !randomPlayedIndexes.includes(index)
    );
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

async function buildAudioInfo(file: File): Promise<{ duration: number }> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve({ duration: audio.duration * 1000 });
    };
    audio.src = URL.createObjectURL(file);
  });
}

export async function importAudio(
  file: File,
  buffer: ArrayBuffer
): Promise<void> {
  const blob = new Blob([buffer], { type: file.type });
  const audioInfo = await buildAudioInfo(file);
  const fileExt = displayFileName(file.name).ext;
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
            fileName: genRandomFileName(fileExt),
            fileType: file.type,
            size: file.size,
            blob,
          }
        );
        const soundContent = {
          from: "file" as SoundFrom,
          daUid: da.doc.daUid,
          fileExt: fileExt,
          fileType: file.type,
          fileSize: file.size,
          duration: audioInfo.duration,
          comment: `<p>${file.name}</p>`,
        };
        dwdyState.entry.value.appendContent<DiaryFeature.Sound>(
          DiaryFeature.Sound,
          soundContent
        );
        await dwdyState.entry.value.save();
        await updateDiarySoundStat({
          count: 1,
          fileSize: file.size,
          duration: audioInfo.duration,
        });
        dwdyState.updateEntry(dwdyState.entry.value.doc);
      }
      return Promise<void>;
    }
  );
}
