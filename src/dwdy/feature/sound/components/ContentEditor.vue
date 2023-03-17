<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useDwdyState } from "~/states/useDwdyState";
import { LocaleActor } from "~/services/locale";
import { DiaryFeature } from "~/dwdy/feature/def";
import { FeatureMeta } from "~/dwdy/feature/sound/def";
import AudioRecorder from "~/dwdy/feature/sound/components/AudioRecorder.vue";
import AudioPlayer from "~/dwdy/feature/sound/components/AudioPlayer.vue";
import RichTextEditor from "~/components/input/RichTextEditor.vue";
import testMp3 from "~/assets/audio/test.mp3";

const props = defineProps({
  contentIndex: {
    type: Number,
    required: true,
  },
});

type PlayerState = "stop" | "play" | "pause";

const dwdyState = useDwdyState();
const la = new LocaleActor("dwdy.feature.sound");
const playerState = ref<PlayerState>("stop");
const playerDuration = ref<number>(0);
const soundMeta = ref<FeatureMeta>();
const soundComment = ref<string>();
const soundCommentEditor = ref();
const soundDataUrl = ref<string>();

await fetchSound();
initSoundPlayer();

watch(
  () => [dwdyState.entry.value],
  async () => {
    await fetchSound();
  }
);

watch(
  () => [props.contentIndex],
  async () => {
    await fetchSound();
    initCommentEditor();
  }
);

onMounted(() => {
  initCommentEditor();
});

async function fetchSound(): Promise<void> {
  // NOTE
  if (props.contentIndex === 0) {
    soundMeta.value = {
      daUid: "daUid01",
      fileSize: 123,
      duration: 1234,
      comment: "test02",
    };
    return;
  }

  if (props.contentIndex < 0) {
    soundComment.value = undefined;
    soundMeta.value = undefined;
    return;
  }
  soundMeta.value = dwdyState.entry.value.fetchContent<DiaryFeature.Sound>(
    DiaryFeature.Sound,
    props.contentIndex
  );
  if (!soundMeta.value) {
    return;
  }
  soundComment.value = soundMeta.value.comment;
  if (soundMeta.value.daUid) {
    const da = await dwdyState.entry.value.fetchAttachment(
      soundMeta.value.daUid
    );
    if (da) {
      soundDataUrl.value = da.doc.data;
    }
  }
}

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

function initSoundPlayer(): void {
  playerDuration.value = 0;
}

function onStopBtnClicked(): void {
  console.log("sound stop clicked");
  if (playerState.value === "stop") {
    return;
  }
  playerState.value = "stop";
}

function onPauseBtnClicked(): void {
  console.log("sound pause clicked");
  if (playerState.value === "pause") {
    return;
  }
  playerState.value = "pause";
}

function onPlayBtnClicked(): void {
  console.log("sound play clicked");
  playSound();
}

type RecorderState = {
  status: "none" | "not_supported" | "error" | "ready";
  errorExcep?: DOMException;
};

const recorderState = ref<RecorderState>({ status: "none" });
const recorder = ref<MediaRecorder>();

async function prepareRecorder(): Promise<void> {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        recorderState.value.status = "ready";
        recorder.value = new MediaRecorder(stream);
      })
      .catch((err) => {
        recorderState.value.status = "error";
        recorderState.value.errorExcep = err;
      });
  } else {
    recorderState.value.status = "not_supported";
  }
}

async function onRecordBtnClicked(): Promise<void> {
  console.log("sound record clicked");
  await prepareRecorder();
  if (recorder.value) {
    recorder.value.start();
  }
}

function playSound(): void {
  // TODO:
  // stop other sounds
  // play the sound with currentPlayerIndex.value
  playerState.value = "play";
}

function updateSoundPlayerRepeat(): void {
  // TODO:
  // upate soundPlayerRepeat with currentPlayerIndex.value
}

const audioRecordBlob = ref<Blob>(new Blob());

const audioRecordDataUrl = computed<string>(() => {
  return URL.createObjectURL(audioRecordBlob.value);
});

function onRecorderStopped(record: { blob: Blob; duration: number }): void {
  console.log("recorder stopped", record);
  audioRecordBlob.value = record.blob;
}
</script>
<template>
  <div class="h-full relative flex flex-col">
    <div class="flex-none">
      <AudioPlayer :audio-data="testMp3"></AudioPlayer>
    </div>
    <div v-if="!soundDataUrl" class="grow"></div>
    <div class="flex-none">
      <AudioRecorder @stop="onRecorderStopped"></AudioRecorder>
    </div>
    <div class="flex-none">
      <AudioPlayer :audio-data="audioRecordDataUrl"></AudioPlayer>
    </div>
  </div>
  <div class="mt-1 p-3 border border-l-4 border-base-200">
    <RichTextEditor
      ref="soundCommentEditor"
      class="flex-none pt-1 min-h-32 border-base-200 w-full"
      :placeholder="(la.t('.comment') as string)"
      @change="onCommentChanged"
    >
    </RichTextEditor>
  </div>
</template>
