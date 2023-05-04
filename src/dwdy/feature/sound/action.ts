import { dbDwdy } from "~/services/db/dwdy";
import { genUid } from "~/services/db";
import {
  DiaryAttachment,
  DiaryAttachmentDoc,
} from "~/models/dwdy/diaryAttachment";
import { DiaryFeature } from "~/dwdy/feature/def";
import {
  SoundFrom,
  FeatureConfig,
  FeatureMeta,
  FeatureStat,
  SoundSource,
  DEFAULT_FEATURE_STAT,
} from "~/dwdy/feature/sound/def";
import {
  DUid,
  DiaryEntryIdentityParams,
  DiaryEntryIdentity,
} from "~/types/dwdy/core";
import { Diary } from "~/models/dwdy/diary";
import { displayFileName, genRandomFileName } from "~/services/file";

async function updateDiarySoundStat(
  diary: Diary,
  statDelta: Partial<FeatureStat>
): Promise<void> {
  let stat = diary.fetchStat<DiaryFeature.Sound>(DiaryFeature.Sound);
  if (!stat) {
    if (statDelta.count && statDelta.count > 0) {
      stat = Object.assign({}, DEFAULT_FEATURE_STAT);
    } else {
      return;
    }
  }
  stat["count"] += statDelta.count || 0;
  stat["fileSize"] += statDelta.fileSize || 0;
  stat["duration"] += statDelta.fileSize || 0;
  diary.assignStat<DiaryFeature.Sound>(DiaryFeature.Sound, stat);
  await diary.save();
}

export async function addSound(
  dei: DiaryEntryIdentityParams,
  blob: Blob,
  duration: number
): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaryAttachments,
    dbDwdy.diaries,
    async () => {
      const fetchedResult = await Diary.fetchDiaryAndEntry(dei);
      if (!fetchedResult) {
        return Promise<void>;
      }
      const { diary, entry } = fetchedResult;
      const da = await DiaryAttachment.upload(dei as DiaryEntryIdentity, {
        fileName: `${genUid()}.webm`,
        fileType: "audio/webm",
        size: blob.size,
        blob: blob,
      });
      const soundContent = {
        from: "record" as SoundFrom,
        daUid: da.doc.daUid,
        fileSize: blob.size,
        fileType: "audio/webm",
        fileExt: "webm",
        duration,
      };
      entry.appendContent<DiaryFeature.Sound>(DiaryFeature.Sound, soundContent);
      await entry.save();
      await updateDiarySoundStat(diary, {
        count: 1,
        fileSize: blob.size,
        duration,
      });
      return Promise<void>;
    }
  );
}

export async function deleteSound(
  dei: DiaryEntryIdentityParams,
  index: number
): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaryAttachments,
    dbDwdy.diaries,
    async () => {
      const fetchedResult = await Diary.fetchDiaryAndEntry(dei);
      if (!fetchedResult) {
        return Promise<void>;
      }
      const { diary, entry } = fetchedResult;
      const selectedContent = entry.fetchContent<DiaryFeature.Sound>(
        DiaryFeature.Sound,
        index
      );
      if (!selectedContent || !selectedContent.daUid) {
        return Promise<void>;
      }
      const da = await entry.fetchAttachment(selectedContent.daUid);
      if (!da) {
        return Promise<void>;
      }
      await da.delete();
      entry.deleteContent(DiaryFeature.Sound, index);
      await updateDiarySoundStat(diary, {
        count: -1,
        fileSize: -selectedContent.fileSize,
        duration: -selectedContent.duration,
      });
      await entry.save();
      return Promise<void>;
    }
  );
}

export async function importAudio(
  dei: DiaryEntryIdentityParams,
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
      const fetchedResult = await Diary.fetchDiaryAndEntry(dei);
      if (!fetchedResult) {
        return Promise<void>;
      }
      const { diary, entry } = fetchedResult;
      const da = await DiaryAttachment.upload(dei as DiaryEntryIdentity, {
        fileName: genRandomFileName(fileExt),
        fileType: file.type,
        size: file.size,
        blob,
      });
      const soundContent = {
        from: "file" as SoundFrom,
        daUid: da.doc.daUid,
        fileExt: fileExt,
        fileType: file.type,
        fileSize: file.size,
        duration: audioInfo.duration,
        comment: `<p>${file.name}</p>`,
      };
      entry.appendContent<DiaryFeature.Sound>(DiaryFeature.Sound, soundContent);
      await entry.save();
      await updateDiarySoundStat(diary, {
        count: 1,
        fileSize: file.size,
        duration: audioInfo.duration,
      });
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
