import { dbDwdy } from "~/services/db/dwdy";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryAttachment } from "~/models/dwdy/diaryAttachment";
import { displayFileName, genRandomFileName } from "~/services/file";
import { DiaryFeature } from "~/dwdy/feature/def";
import { FeatureStat } from "~/dwdy/feature/image/def";

const THUMBNAIL_W = 120;

const DEFAULT_META = {
  fileSize: 0,
  width: 0,
  height: 0,
};

const DEFAULT_STAT = {
  count: 0,
  fileSize: 0,
};

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
  statDelta: Partial<FeatureStat>
): Promise<void> {
  const dwdyState = useDwdyState();
  let stat = dwdyState.diary.value.fetchStat<DiaryFeature.Image>(
    DiaryFeature.Image
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
  dwdyState.diary.value.assignStat<DiaryFeature.Image>(
    DiaryFeature.Image,
    stat
  );
  await dwdyState.diary.value.save();
}

export async function addEmptyImage(): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    async () => {
      const dwdyState = useDwdyState();
      dwdyState.entry.value.appendContent<DiaryFeature.Image>(
        DiaryFeature.Image,
        Object.assign({}, DEFAULT_META)
      );
      await dwdyState.entry.value.save();
      await updateDiaryImageStat({
        count: 1,
      });
      dwdyState.updateEntry(dwdyState.entry.value.doc);
    }
  );
}

export async function uploadImage(file: File, data: string): Promise<void> {
  const imageInfo = await buildImageInfo(data, file.type);
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
            data,
          }
        );
        const imageContent = {
          daUid: da.doc.daUid,
          fileExt: fileExt,
          fileType: file.type,
          fileSize: file.size,
          width: imageInfo.width,
          height: imageInfo.height,
          thumbnail: imageInfo.thumbnail,
        };
        dwdyState.entry.value.appendContent<DiaryFeature.Image>(
          DiaryFeature.Image,
          imageContent
        );
        await dwdyState.entry.value.save();
        await updateDiaryImageStat({ count: 1, fileSize: file.size });
        dwdyState.updateEntry(dwdyState.entry.value.doc);
      }
      return Promise<void>;
    }
  );
}

export async function deleteImage(index: number): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaryAttachments,
    dbDwdy.diaries,
    async () => {
      const dwdyState = useDwdyState();
      const selectedContent =
        dwdyState.entry.value.fetchContent<DiaryFeature.Image>(
          DiaryFeature.Image,
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
      dwdyState.entry.value.deleteContent(DiaryFeature.Image, index);
      await updateDiaryImageStat({
        count: -1,
        fileSize: -selectedContent.fileSize,
      });
      await dwdyState.entry.value.save();
      dwdyState.updateEntry(dwdyState.entry.value.doc);
      return Promise<void>;
    }
  );
}

export async function replaceImage(
  index: number,
  file: File,
  data: string
): Promise<void> {
  const imageInfo = await buildImageInfo(data, file.type);
  const fileExt = displayFileName(file.name).ext;
  const dwdyState = useDwdyState();
  const imageMeta = dwdyState.entry.value.fetchContent<DiaryFeature.Image>(
    DiaryFeature.Image,
    index
  );
  if (!imageMeta || !imageMeta.daUid) {
    return;
  }
  const oriDa = await dwdyState.entry.value.fetchAttachment(imageMeta.daUid);
  if (!oriDa) {
    return;
  }
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaryAttachments,
    dbDwdy.diaries,
    async () => {
      if (dwdyState.entry.value.doc.dUid && dwdyState.entry.value.doc.dIndex) {
        await oriDa.delete();
        const da = await DiaryAttachment.upload(
          {
            dUid: dwdyState.entry.value.doc.dUid,
            dIndex: dwdyState.entry.value.doc.dIndex,
          },
          {
            fileName: genRandomFileName(fileExt),
            fileType: file.type,
            size: file.size,
            data,
          }
        );
        dwdyState.entry.value.assignContent<DiaryFeature.Image>(
          DiaryFeature.Image,
          index,
          {
            daUid: da.doc.daUid,
            fileExt,
            fileType: file.type,
            fileSize: file.size,
            width: imageInfo.width,
            height: imageInfo.height,
            thumbnail: imageInfo.thumbnail,
            comment: imageMeta.comment,
          }
        );
        await dwdyState.entry.value.save();
        await updateDiaryImageStat({
          fileSize: file.size - imageMeta.fileSize,
        });
        dwdyState.updateEntry(dwdyState.entry.value.doc);
      }
      return Promise<void>;
    }
  );
}
