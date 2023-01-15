import { dbDwdy } from "~/services/db/dwdy";
import { useDwdyState } from "~/states/useDwdyState";
import { mdiRdImage, mdiRdImagePlus } from "~/services/iconSetPath";
import { DiaryFeatureDef } from "~/models/dwdy/featureDef";
import { DiaryFeature } from "~/models/dwdy/feature";
import { DiaryAttachment } from "~/models/dwdy/diaryAttachment";
import { DUid } from "~/models/dwdy/diary";
import { displayFileName } from "~/services/file";
import ContentEditor from "~/components/dwdy/feature/image/ContentEditor.vue";
import ContentGallery from "~/components/dwdy/feature/image/ContentGallery.vue";
import ContentSlate from "~/components/dwdy/feature/image/ContentSlate.vue";
import ContentFullViewer from "~/components/dwdy/feature/image/ContentFullViewer.vue";
import ContentListEntry from "~/components/dwdy/feature/image/ContentListEntry.vue";

const ACCEPT_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/apng",
  "image/avif",
  "image/x-icon",
] as const;

const THUMBNAIL_W = 120;

const DEFAULT_STAT = {
  count: 0,
  fileSize: 0,
};

export type FeatureMeta = {
  daUid: DUid;
  fileName: string;
  fileType: string;
  fileSize: number;
  width: number;
  height: number;
  comment?: string;
  thumbnail?: string;
};
export type FeatureStat = {
  count: number;
  fileSize: number;
};

export const FEATURE_DEF: DiaryFeatureDef = {
  flow: {
    creation: {
      uploader: {
        multiple: true,
        accept: ACCEPT_FORMATS.join(","),
        upload: uploadImage,
      },
    },
    deletion: {
      delete: deleteImage,
    },
  },
  icon: {
    main: { set: "mdi", path: mdiRdImage },
    create: { set: "mdi", path: mdiRdImagePlus },
    edit: { set: "mdi", path: mdiRdImagePlus },
  },
  component: {
    editor: ContentEditor,
    gallery: ContentGallery,
    slate: ContentSlate,
    fullViewer: ContentFullViewer,
    listEntry: ContentListEntry,
  },
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

export async function uploadImage(file: File, data: string): Promise<void> {
  const imageInfo = await buildImageInfo(data, file.type);
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
            fileName: file.name,
            fileType: file.type,
            size: file.size,
            data,
          }
        );
        const imageContent = {
          daUid: da.doc.daUid,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          width: imageInfo.width,
          height: imageInfo.height,
          thumbnail: imageInfo.thumbnail,
        };
        dwdyState.entry.value.appendContent<DiaryFeature.Image>(
          dwdyState.editingContent.value.feature,
          imageContent
        );
        await dwdyState.entry.value.save();
        await updateDiaryImageStat({ count: 1, fileSize: file.size });
        dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
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
      if (!selectedContent) {
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
      dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
      return Promise<void>;
    }
  );
}

export async function renameImage(fileBase: string): Promise<void> {
  const dwdyState = useDwdyState();
  const imageMeta = dwdyState.entry.value.fetchContent<DiaryFeature.Image>(
    DiaryFeature.Image,
    dwdyState.editingContent.value.index
  );
  if (!imageMeta) {
    return;
  }
  const da = await dwdyState.entry.value.fetchAttachment(imageMeta.daUid);
  if (!da) {
    return;
  }
  const fileNameData = displayFileName(imageMeta.fileName);
  const fileName = `${fileBase}${
    fileNameData.ext ? `.${fileNameData.ext}` : ""
  }`;
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaryAttachments,
    async () => {
      da.assign({ fileName });
      await da.save();
      dwdyState.entry.value.assignContent(
        dwdyState.editingContent.value.feature,
        dwdyState.editingContent.value.index,
        Object.assign(imageMeta, { fileName })
      );
      await dwdyState.entry.value.save();
      dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
    }
  );
}

export async function replaceImage(file: File, data: string): Promise<void> {
  const imageInfo = await buildImageInfo(data, file.type);
  const dwdyState = useDwdyState();
  const imageMeta = dwdyState.entry.value.fetchContent<DiaryFeature.Image>(
    DiaryFeature.Image,
    dwdyState.editingContent.value.index
  );
  if (!imageMeta) {
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
      if (
        dwdyState.entry.value.isSaved &&
        dwdyState.entry.value.doc.dUid &&
        dwdyState.entry.value.doc.dIndex
      ) {
        await oriDa.delete();
        const da = await DiaryAttachment.upload(
          {
            dUid: dwdyState.entry.value.doc.dUid,
            dIndex: dwdyState.entry.value.doc.dIndex,
          },
          {
            fileName: file.name,
            fileType: file.type,
            size: file.size,
            data,
          }
        );
        dwdyState.entry.value.assignContent<DiaryFeature.Image>(
          dwdyState.editingContent.value.feature,
          dwdyState.editingContent.value.index,
          {
            daUid: da.doc.daUid,
            fileName: file.name,
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
        dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
      }
      return Promise<void>;
    }
  );
}
