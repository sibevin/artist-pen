import { dbDwdy } from "~/services/db/dwdy";
import { mdiTextBox, mdiTextBoxPlus, mdiTextBoxEdit } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/models/dwdy/feature";
import { DiaryFeatureDef } from "~/models/dwdy/featureDef";
import ContentEditor from "~/components/dwdy/feature/text/ContentEditor.vue";
import ContentGallery from "~/components/dwdy/feature/text/ContentGallery.vue";
import ContentSlate from "~/components/dwdy/feature/text/ContentSlate.vue";
import ContentFullViewer from "~/components/dwdy/feature/text/ContentFullViewer.vue";
import ContentListEntry from "~/components/dwdy/feature/text/ContentListEntry.vue";
import { getStringBytes } from "~/services/file";

export type FeatureMeta = {
  raw: string;
  html: string;
};
export type FeatureStat = {
  count: number;
  fileSize: number;
  words: number;
  letters: number;
};

export const FEATURE_DEF: DiaryFeatureDef = {
  flow: {
    creation: {
      creator: {
        create: async () => {
          await addText({ raw: "", html: "" });
        },
      },
    },
    deletion: {
      delete: deleteText,
    },
  },
  icon: {
    main: { set: "mdi", path: mdiTextBox },
    create: { set: "mdi", path: mdiTextBoxPlus },
    edit: { set: "mdi", path: mdiTextBoxEdit },
  },
  component: {
    editor: ContentEditor,
    gallery: ContentGallery,
    slate: ContentSlate,
    fullViewer: ContentFullViewer,
    listEntry: ContentListEntry,
  },
};

const DEFAULT_STAT = {
  count: 0,
  fileSize: 0,
  words: 0,
  letters: 0,
};

async function updateDiaryTextStat(
  statDelta: Partial<FeatureStat>
): Promise<void> {
  const dwdyState = useDwdyState();
  let stat = dwdyState.diary.value.fetchStat<DiaryFeature.Text>(
    DiaryFeature.Text
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
  stat["words"] += statDelta.words || 0;
  stat["letters"] += statDelta.letters || 0;
  dwdyState.diary.value.assignStat<DiaryFeature.Text>(DiaryFeature.Text, stat);
  await dwdyState.diary.value.save();
}

function getTextBytes(text: FeatureMeta): number {
  return getStringBytes(text.raw) + getStringBytes(text.html);
}

function getTextWords(text: FeatureMeta): number {
  return text.raw.match(/(\w+)/g)?.length || 0;
}

function getTextLetters(text: FeatureMeta): number {
  return text.raw.replace(/\s/g, "").length;
}

export async function addText(text: FeatureMeta): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    async () => {
      const dwdyState = useDwdyState();
      dwdyState.entry.value.appendContent<DiaryFeature.Text>(
        dwdyState.editingContent.value.feature,
        text
      );
      await dwdyState.entry.value.save();
      await updateDiaryTextStat({
        count: 1,
        fileSize: getTextBytes(text),
        words: getTextWords(text),
        letters: getTextLetters(text),
      });
      dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
    }
  );
}

export async function deleteText(index: number): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    async () => {
      const dwdyState = useDwdyState();
      const oriText = dwdyState.entry.value.fetchContent<DiaryFeature.Text>(
        DiaryFeature.Text,
        index
      );
      if (!oriText) {
        return;
      }
      dwdyState.entry.value.deleteContent(
        dwdyState.editingContent.value.feature,
        index
      );
      await dwdyState.entry.value.save();
      await updateDiaryTextStat({
        count: -1,
        fileSize: -getTextBytes(oriText),
        words: -getTextWords(oriText),
        letters: -getTextLetters(oriText),
      });
      dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
    }
  );
}

export async function updateText(text: FeatureMeta): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    async () => {
      const dwdyState = useDwdyState();
      let oriText = dwdyState.entry.value.fetchContent<DiaryFeature.Text>(
        DiaryFeature.Text,
        dwdyState.editingContent.value.index
      );
      if (!oriText) {
        oriText = { raw: "", html: "" };
      }
      dwdyState.entry.value.assignContent(
        dwdyState.editingContent.value.feature,
        dwdyState.editingContent.value.index,
        text
      );
      await dwdyState.entry.value.save();
      await updateDiaryTextStat({
        fileSize: getTextBytes(text) - getTextBytes(oriText),
        words: getTextWords(text) - getTextWords(oriText),
        letters: getTextLetters(text) - getTextLetters(oriText),
      });
      dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
    }
  );
}
