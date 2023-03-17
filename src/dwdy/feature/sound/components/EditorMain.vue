<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureIcon } from "~/dwdy/feature/map";
import { FeatureMeta } from "~/dwdy/feature/sound/def";
import { addSound } from "~/dwdy/feature/sound/action";
import { FileSizeDisplay, displayFileSize } from "~/services/file";
import SvgIcon from "~/components/SvgIcon.vue";
import PaginationPanel from "~/components/PaginationPanel.vue";
import AudioRecorder from "~/dwdy/feature/sound/components/AudioRecorder.vue";
import AudioPlayer from "~/dwdy/feature/sound/components/AudioPlayer.vue";
import RichTextEditor from "~/components/input/RichTextEditor.vue";
import testMp3 from "~/assets/audio/test.mp3";

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
  (e: "creationDone"): void;
  (e: "toggleJump"): void;
  (e: "selectIndex", index: number): void;
}>();

const la = new LocaleActor("dwdy.feature.image.components.EditorMain");
const dwdyState = useDwdyState();
const soundDataUrl = ref<string>();
const soundMeta = ref<FeatureMeta>();
const fileSize = ref<FileSizeDisplay>({ unit: "kb", amount: "" });
const soundComment = ref<string>();
const soundCommentEditor = ref();
const isRecorderShown = ref(false);
const audioRecorder = ref();
const audioPlayer = ref();

const currentPage = computed<number>(() => {
  if (isRecorderShown.value) {
    return 0;
  } else {
    return props.contentIndex + 1;
  }
});

function stopEditor(): void {
  if (audioRecorder.value) {
    audioRecorder.value.stopRecording();
  }
  if (audioPlayer.value) {
    audioPlayer.value.stopPlaying();
  }
}
defineExpose({ stopEditor });

watch(
  () => [dwdyState.entry.value, props.contentIndex, isRecorderShown.value],
  async () => {
    stopEditor();
    if (!isRecorderShown.value) {
      await fetchSound();
      initCommentEditor();
    }
  }
);

onMounted(() => {
  initCommentEditor();
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
    console.log("sound blob", da.doc.blob);
    // soundDataUrl.value = URL.createObjectURL(da.doc.blob);
    soundDataUrl.value = testMp3;
  }
  fileSize.value = displayFileSize(soundMeta.value.fileSize);
  soundComment.value = soundMeta.value.comment;
}

await fetchSound();

function initCommentEditor(): void {
  if (soundCommentEditor.value) {
    soundCommentEditor.value.initEditor(soundComment.value || "");
  }
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

async function onRecorderStopped(record: {
  blob: Blob;
  duration: number;
  continue: boolean;
}): Promise<void> {
  console.log("recorder stopped", record);
  await addSound(record.blob, record.duration);
  isRecorderShown.value = record.continue;
  emit("creationDone");
}

function onRecorderSelected(): void {
  stopEditor();
  isRecorderShown.value = !isRecorderShown.value;
}

function onPageSelected(page: number): void {
  stopEditor();
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
      <AudioRecorder
        ref="audioRecorder"
        class="h-full"
        @stop="onRecorderStopped"
      ></AudioRecorder>
    </div>
    <div
      class="grow min-h-0 overflow-y-auto flex flex-col"
      :class="{ hidden: contentCount === 0 || isRecorderShown }"
    >
      <AudioPlayer
        ref="audioPlayer"
        :audio-data="soundDataUrl"
        class="grow"
      ></AudioPlayer>
      <RichTextEditor
        ref="soundCommentEditor"
        class="flex-none pt-2 min-h-32 border-base-200 w-full"
        :placeholder="(la.t('.comment') as string)"
        @change="onCommentChanged"
      >
      </RichTextEditor>
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
