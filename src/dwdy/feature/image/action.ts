import { dbDwdy } from "~/services/db/dwdy";
import {
  DiaryAttachment,
  DiaryAttachmentDocMap,
} from "~/models/dwdy/diaryAttachment";
import { displayFileName, genRandomFileName } from "~/services/file";
import { DiaryEntryIdentityParams } from "~/dwdy/types/core";
import { Diary } from "~/models/dwdy/diary";
import { DiaryFeature } from "~/dwdy/feature/def";
import {
  FeatureMeta,
  FeatureStat,
  ImagePack,
  DEFAULT_FEATURE_STAT,
} from "~/dwdy/feature/image/def";

const THUMBNAIL_W = 120;

async function buildImageInfo(
  srcData: string,
  fileType: string
): Promise<{ width: number; height: number; thumbnail: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    let thumbnail;
    img.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = img;
      if (width === 0 || height === 0 || width < THUMBNAIL_W) {
        thumbnail = srcData;
      } else {
        const hwRatio = height / width;
        const canvas = document.createElement("canvas");
        canvas.width = THUMBNAIL_W;
        canvas.height = THUMBNAIL_W * hwRatio;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            img,
            0,
            0,
            width,
            height,
            0,
            0,
            THUMBNAIL_W,
            THUMBNAIL_W * hwRatio
          );
        }
        thumbnail = canvas.toDataURL(fileType);
      }
      resolve({ width, height, thumbnail });
    };
    img.src = srcData;
  });
}

async function updateDiaryImageStat(
  diary: Diary,
  statDelta: Partial<FeatureStat>
): Promise<void> {
  let stat = diary.fetchStat<DiaryFeature.Image>(DiaryFeature.Image);
  if (!stat) {
    if (statDelta.count && statDelta.count > 0) {
      stat = Object.assign({}, DEFAULT_FEATURE_STAT);
    } else {
      return;
    }
  }
  stat["count"] += statDelta.count || 0;
  stat["fileSize"] += statDelta.fileSize || 0;
  diary.assignStat<DiaryFeature.Image>(DiaryFeature.Image, stat);
  await diary.save();
}

export async function importImage(
  dei: DiaryEntryIdentityParams,
  file: File,
  data: string
): Promise<void> {
  const imageInfo = await buildImageInfo(data, file.type);
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
      const da = await DiaryAttachment.upload(dei, {
        fileName: genRandomFileName(fileExt),
        fileType: file.type,
        size: file.size,
        data,
      });
      const imageContent = {
        daUid: da.doc.daUid,
        fileExt: fileExt,
        fileType: file.type,
        fileSize: file.size,
        width: imageInfo.width,
        height: imageInfo.height,
        thumbnail: imageInfo.thumbnail,
      };
      entry.appendContent<DiaryFeature.Image>(DiaryFeature.Image, imageContent);
      await entry.save();
      await updateDiaryImageStat(diary, { count: 1, fileSize: file.size });
      return Promise<void>;
    }
  );
}

export async function deleteImage(
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
      const selectedContent = entry.fetchContent<DiaryFeature.Image>(
        DiaryFeature.Image,
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
      entry.deleteContent(DiaryFeature.Image, index);
      await updateDiaryImageStat(diary, {
        count: -1,
        fileSize: -selectedContent.fileSize,
      });
      await entry.save();
      return Promise<void>;
    }
  );
}

export async function replaceImage(
  dei: DiaryEntryIdentityParams,
  index: number,
  file: File,
  data: string
): Promise<void> {
  const imageInfo = await buildImageInfo(data, file.type);
  const fileExt = displayFileName(file.name).ext;
  const fetchedResult = await Diary.fetchDiaryAndEntry(dei);
  if (!fetchedResult) {
    return;
  }
  const { diary, entry } = fetchedResult;
  const imageMeta = entry.fetchContent<DiaryFeature.Image>(
    DiaryFeature.Image,
    index
  );
  if (!imageMeta || !imageMeta.daUid) {
    return;
  }
  const oriDa = await entry.fetchAttachment(imageMeta.daUid);
  if (!oriDa) {
    return;
  }
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaryAttachments,
    dbDwdy.diaries,
    async () => {
      if (entry.doc.dUid && entry.doc.dIndex) {
        await oriDa.delete();
        const da = await DiaryAttachment.upload(
          {
            dUid: entry.doc.dUid,
            dIndex: entry.doc.dIndex,
          },
          {
            fileName: genRandomFileName(fileExt),
            fileType: file.type,
            size: file.size,
            data,
          }
        );
        entry.assignContent<DiaryFeature.Image>(DiaryFeature.Image, index, {
          daUid: da.doc.daUid,
          fileExt,
          fileType: file.type,
          fileSize: file.size,
          width: imageInfo.width,
          height: imageInfo.height,
          thumbnail: imageInfo.thumbnail,
          comment: imageMeta.comment,
        });
        await entry.save();
        await updateDiaryImageStat(diary, {
          fileSize: file.size - imageMeta.fileSize,
        });
      }
      return Promise<void>;
    }
  );
}

export function buildImagePacks(
  contents: FeatureMeta[],
  daMap: DiaryAttachmentDocMap
): ImagePack[] {
  const imagePacks: ImagePack[] = [];
  for (let i = 0; i < contents.length; i++) {
    const content = contents[i];
    if (!content.daUid) {
      continue;
    }
    const dataUrl = daMap[content.daUid].data;
    if (!dataUrl) {
      continue;
    }
    if (dataUrl) {
      imagePacks.push(Object.assign({}, content, { dataUrl }));
    }
  }
  return imagePacks;
}
