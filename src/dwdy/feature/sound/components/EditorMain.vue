<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from "vue";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureIcon } from "~/dwdy/feature/map";
import { FeatureMeta, FeatureConfig } from "~/dwdy/feature/sound/def";
import { addSound } from "~/dwdy/feature/sound/action";
import { AudioRecord } from "~/dwdy/feature/sound/services/AudioRecorderProcessor";
import { useAudioState } from "~/dwdy/feature/sound/state/useAudioState";
import { FileSizeDisplay, displayFileSize } from "~/services/file";
import { buildDtString } from "~/dwdy/services/dateUtils";
import SvgIcon from "~/components/SvgIcon.vue";
import PaginationPanel from "~/components/PaginationPanel.vue";
import AudioRecorderUi from "~/dwdy/feature/sound/components/AudioRecorderUi.vue";
import AudioPlayerUi from "~/dwdy/feature/sound/components/AudioPlayerUi.vue";
import RichTextEditor from "~/components/input/RichTextEditor.vue";
// import testMp3 from "~/assets/audio/test.mp3";

const props = defineProps({
  contentCount: {
    type: Number,
    required: true,
  },
  contentIndex: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "creationDone", moveToIndex: "last" | undefined): void;
  (e: "toggleJump"): void;
  (e: "selectIndex", index: number): void;
  (e: "changeMenuEntries", entries: string[]): void;
}>();

const la = new LocaleActor("dwdy.feature.image.components.EditorMain");
const dwdyState = useDwdyState();
const soundDataUrl = ref<string>();
const soundMeta = ref<FeatureMeta>();
const fileSize = ref<FileSizeDisplay>({ unit: "kb", amount: "" });
const soundComment = ref<string>();
const soundCommentEditor = ref();
const isRecorderShown = ref(false);
const audioRecorderUi = ref();
const audioPlayerUi = ref();
const audioState = useAudioState();
const storedRecords = ref<
  Record<
    string,
    { record: AudioRecord; status: "init" | "processing" | "done" }
  >
>({});

const currentPage = computed<number>(() => {
  if (isRecorderShown.value) {
    return 0;
  } else {
    return props.contentIndex + 1;
  }
});

const soundConfig = computed<FeatureConfig>(() => {
  return dwdyState.diary.value.fetchFeatureConfig(DiaryFeature.Sound);
});

const soundDownloadFileName = computed<string>(() => {
  if (!soundMeta.value) {
    return "";
  }
  const entryDt = dwdyState.entry.value.tsDate;
  const fileSuffix = soundMeta.value.fileExt
    ? `.${soundMeta.value.fileExt}`
    : "";
  const pageStr = String(currentPage.value).padStart(3, "0");
  if (entryDt) {
    return `${buildDtString(entryDt)}_${pageStr}${fileSuffix}`;
  }
  return `${dwdyState.entry.value.doc.dUid}_${pageStr}${fileSuffix}`;
});

watch(
  () => [props.contentIndex],
  async () => {
    audioState.stopAllAudioDevices();
    await initSoundEditor();
  }
);

watch(
  () => dwdyState.entry.value,
  async (oldEntry, newEntry) => {
    if (oldEntry.uid !== newEntry.uid) {
      audioState.stopAllAudioDevices();
      await initSoundEditor();
    }
  }
);

watch(
  () => [isRecorderShown.value],
  async () => {
    if (!isRecorderShown.value) {
      audioState.stopAllAudioDevices();
      emit("changeMenuEntries", ["change-order", "delete"]);
    } else {
      emit("changeMenuEntries", []);
    }
  }
);

onMounted(() => {
  initSoundEditor();
  emit("changeMenuEntries", ["change-order", "delete"]);
});

async function fetchSound(): Promise<void> {
  soundDataUrl.value = undefined;
  soundMeta.value = undefined;
  if (props.contentIndex < 0) {
    return;
  }
  soundMeta.value = dwdyState.entry.value.fetchContent<DiaryFeature.Sound>(
    DiaryFeature.Sound,
    props.contentIndex
  );
  if (!soundMeta.value || !soundMeta.value.daUid) {
    return;
  }
  const da = await dwdyState.entry.value.fetchAttachment(soundMeta.value.daUid);
  if (!da) {
    return;
  }
  if (da.doc.blob) {
    soundDataUrl.value = URL.createObjectURL(da.doc.blob);
  }
  fileSize.value = displayFileSize(soundMeta.value.fileSize);
  soundComment.value = soundMeta.value.comment;
}

function initCommentEditor(): void {
  if (soundCommentEditor.value) {
    soundCommentEditor.value.initEditor(soundComment.value || "");
  }
}

async function initSoundEditor(): Promise<void> {
  await fetchSound();
  initCommentEditor();
}

async function onConfigUpdated(
  givenConfig: Partial<FeatureConfig>
): Promise<void> {
  dwdyState.diary.value.patchFeatureConfig(DiaryFeature.Sound, givenConfig);
  await dwdyState.diary.value.save();
}

async function onCommentChanged(text: {
  raw: string;
  html: string;
}): Promise<void> {
  if (soundMeta.value) {
    soundComment.value = text.html;
    dwdyState.entry.value.assignContent(
      DiaryFeature.Sound,
      props.contentIndex,
      Object.assign(soundMeta.value, { comment: text.html })
    );
    await dwdyState.entry.value.save();
    dwdyState.updateEntry(dwdyState.entry.value.doc);
    if (soundCommentEditor.value) {
      soundCommentEditor.value.updateStatus("saved");
    }
  }
}

async function onRecorderStored(): Promise<void> {
  const stateStoredRecords = audioState.recorder.value.storedRecords;
  Object.keys(stateStoredRecords).forEach((key) => {
    const stateStoredRecord = stateStoredRecords[key];
    const storedRecord = storedRecords.value[key];
    if (stateStoredRecord && !storedRecord) {
      storedRecords.value[key] = {
        record: Object.assign(
          {},
          audioState.recorder.value.pullStoredAudio(key)
        ),
        status: "init",
      };
    }
  });
  Object.keys(storedRecords.value).forEach(async (key) => {
    const storedRecord = storedRecords.value[key];
    if (storedRecord) {
      if (storedRecord.status === "init") {
        storedRecord.status = "processing";
        await addSound(storedRecord.record.blob, storedRecord.record.duration);
        storedRecord.status = "done";
      }
      if (storedRecord.status === "done") {
        delete storedRecords.value[key];
      }
    }
  });
}

function onRecorderSelected(): void {
  audioState.stopAllAudioDevices();
  isRecorderShown.value = !isRecorderShown.value;
}

function onPageSelected(page: number): void {
  audioState.stopAllAudioDevices();
  isRecorderShown.value = false;
  emit("selectIndex", page - 1);
}

function onCurrentPageSelected(): void {
  emit("toggleJump");
}
</script>
<template>
  <div class="w-full h-full p-3 flex flex-col">
    <div
      class="grow min-h-0 overflow-y-auto"
      :class="{ hidden: contentCount !== 0 && !isRecorderShown }"
    >
      <AudioRecorderUi
        ref="audioRecorderUi"
        class="h-full"
        @store="onRecorderStored"
      ></AudioRecorderUi>
    </div>
    <div
      class="grow min-h-0 overflow-y-auto flex flex-col"
      :class="{ hidden: contentCount === 0 || isRecorderShown }"
    >
      <AudioPlayerUi
        ref="audioPlayerUi"
        class="grow"
        :file-name="soundDownloadFileName"
        :audio-data-url="soundDataUrl"
        :config="soundConfig"
        @update-config="onConfigUpdated"
      ></AudioPlayerUi>
      <div class="border-l-4 border-base-200 mt-2 pl-2">
        <RichTextEditor
          ref="soundCommentEditor"
          class="flex-none min-h-32 max-h-64 border-base-200 w-full"
          :placeholder="(la.t('.comment') as string)"
          @change="onCommentChanged"
        >
        </RichTextEditor>
      </div>
    </div>
    <PaginationPanel
      v-if="contentCount !== 0"
      class="mt-3"
      :total-page="props.contentCount"
      :current-page="currentPage"
      @select="onPageSelected"
      @current-select="onCurrentPageSelected"
    >
      <template #right-panel>
        <button
          class="ml-2 btn btn-circle btn-ghost rounded-full items-center"
          :class="isRecorderShown ? 'bg-base-200' : ''"
          @click="onRecorderSelected()"
        >
          <SvgIcon
            :icon-set="featureIcon(DiaryFeature.Sound, 'create').set"
            :path="featureIcon(DiaryFeature.Sound, 'create').path"
            :size="24"
          ></SvgIcon>
        </button>
      </template>
    </PaginationPanel>
  </div>
</template>
