<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from "vue";
import {
  mdiFileUpload,
  mdiDotsCircle,
  mdiFileEditOutline,
  mdiFileImageOutline,
  mdiOverscan,
  mdiDatabase,
  mdiCheck,
  mdiClose,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import {
  FileSizeDisplay,
  displayFileSize,
  FileNameDisplay,
  displayFileName,
} from "~/services/file";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/models/dwdy/feature";
import {
  FEATURE_DEF,
  FeatureMeta,
  renameImage,
  replaceImage,
} from "~/models/dwdy/feature/image/index";
import SvgIcon from "~/components/SvgIcon.vue";
import RichTextEditor from "~/components/input/RichTextEditor.vue";

const FILE_BASE_REGEX = /^[^~'!*<>:;,?"*|/]+$/;

const props = defineProps({
  contentIndex: {
    type: Number,
    required: true,
  },
});

const la = new LocaleActor("components.dwdy.feature.image.ContentEditor");
const dwdyState = useDwdyState();
const imageDataUrl = ref<string>();
const imageMeta = ref<FeatureMeta>();
const fileSize = ref<FileSizeDisplay>({ unit: "kb", amount: "" });
const fileName = ref<FileNameDisplay>({ base: "" });
const imageData = ref<{ base: string; comment?: string }>({
  base: "",
});
const isFileNameEditing = ref(false);
const imageFileNameInput = ref();
const imageCommentEditor = ref();
const isInLoading = ref(false);
const isInvalidFileNameShown = ref(false);

await fetchImage();

watch(
  () => [dwdyState.entry.value],
  async () => {
    await fetchImage();
  }
);

watch(
  () => [props.contentIndex],
  async () => {
    await fetchImage();
    initCommentEditor();
  }
);

onMounted(() => {
  initCommentEditor();
});

async function fetchImage(): Promise<void> {
  if (props.contentIndex < 0) {
    imageDataUrl.value = undefined;
    imageMeta.value = undefined;
    return;
  }
  imageMeta.value = dwdyState.entry.value.fetchContent<DiaryFeature.Image>(
    DiaryFeature.Image,
    props.contentIndex
  );
  if (!imageMeta.value) {
    return;
  }
  const da = await dwdyState.entry.value.fetchAttachment(imageMeta.value.daUid);
  if (!da) {
    return;
  }
  imageDataUrl.value = da.doc.data;
  fileSize.value = displayFileSize(imageMeta.value.fileSize);
  fileName.value = displayFileName(imageMeta.value.fileName);
  imageData.value.base = fileName.value.base;
  imageData.value.comment = imageMeta.value.comment;
  isFileNameEditing.value = false;
}

function initCommentEditor(): void {
  if (imageCommentEditor.value) {
    imageCommentEditor.value.initEditor(imageData.value.comment || "");
  }
}

function onFileNameEditingStart(): void {
  isFileNameEditing.value = true;
  nextTick(() => {
    if (imageFileNameInput.value) {
      imageFileNameInput.value.focus();
    }
  });
}

async function onFileNameEditingApplied(): Promise<void> {
  if (FILE_BASE_REGEX.exec(imageData.value.base)) {
    await renameImage(imageData.value.base);
    isFileNameEditing.value = false;
  } else {
    isInvalidFileNameShown.value = true;
  }
}

function onFileNameEditingCancelled(): void {
  imageData.value.base = fileName.value.base;
  isFileNameEditing.value = false;
  isInvalidFileNameShown.value = false;
}

function onFileNameInputChanged(): void {
  isInvalidFileNameShown.value = false;
}

async function onCommentChanged(text: {
  raw: string;
  html: string;
}): Promise<void> {
  if (imageMeta.value) {
    imageData.value.comment = text.html;
    dwdyState.entry.value.assignContent(
      dwdyState.editingContent.value.feature,
      dwdyState.editingContent.value.index,
      Object.assign(imageMeta.value, { comment: text.html })
    );
    await dwdyState.entry.value.save();
    dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
    if (imageCommentEditor.value) {
      imageCommentEditor.value.updateStatus("saved");
    }
  }
}

async function onReplaceFileSelected(event: Event): Promise<void> {
  const files = event.target && (event.target as HTMLInputElement).files;
  if (!files) {
    return;
  }
  const file = files[0];
  isInLoading.value = true;
  const fr = new FileReader();
  fr.onload = async () => {
    const result = fr.result as string;
    if (result) {
      await replaceImage(file, result);
      isInLoading.value = false;
    }
  };
  fr.readAsDataURL(file);
}
</script>
<template>
  <div
    v-if="imageMeta"
    class="h-full flex flex-col justify-between items-stretch"
  >
    <div class="min-h-[10rem] grow relative">
      <div
        class="bg-base-200 border border-base-200 absolute inset-0 overflow-y-auto"
      >
        <img
          v-if="imageDataUrl"
          class="max-w-full m-auto"
          :src="imageDataUrl"
        />
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <label
          ref="contentUploadBtn"
          class="btn btn-outline border-none text-base-content bg-base-100"
          :class="{ 'btn-disabled': isInLoading }"
        >
          <SvgIcon
            class="mr-2"
            icon-set="mdi"
            :path="mdiFileUpload"
            :size="24"
          ></SvgIcon>
          {{ la.t(".changeImage") }}
          <div v-if="isInLoading">
            <SvgIcon
              class="animate-spin-slow mx-2"
              icon-set="mdi"
              :path="mdiDotsCircle"
              :size="20"
            ></SvgIcon>
          </div>
          <input
            v-else
            class="hidden"
            type="file"
            :multiple="false"
            :accept="FEATURE_DEF.flow.creation.uploader?.accept"
            @change="onReplaceFileSelected"
          />
        </label>
        <div
          class="w-full mt-3 p-3 pb-0 bg-base-100 rounded flex flex-wrap items-center"
        >
          <div class="lg:grow mr-6 mb-3">
            <div v-if="isFileNameEditing">
              <label class="max-w-full input-group">
                <input
                  ref="imageFileNameInput"
                  v-model="imageData.base"
                  class="input input-bordered border-base-200 w-full"
                  type="text"
                  name="fileName"
                  @change="onFileNameInputChanged"
                />
                <span class="px-2 text-base-300 bg-base-100 border border-l-0">
                  .{{ fileName.ext }}
                </span>
                <button
                  class="px-2 cursor-pointer bg-base-100 text-success border border-l-0"
                  @click="onFileNameEditingApplied"
                >
                  <SvgIcon icon-set="mdi" :path="mdiCheck" :size="24"></SvgIcon>
                </button>
                <button
                  class="px-2 cursor-pointer bg-base-100 text-error border border-l-0"
                  @click="onFileNameEditingCancelled"
                >
                  <SvgIcon icon-set="mdi" :path="mdiClose" :size="24"></SvgIcon>
                </button>
              </label>
              <label v-if="isInvalidFileNameShown" class="label">
                <span class="label-text-alt text-error">
                  {{ la.t(".invalidFileNameHint") }}
                </span>
              </label>
            </div>
            <label v-else class="font-bold cursor-pointer flex items-center">
              <button class="flex items-center" @click="onFileNameEditingStart">
                <SvgIcon
                  class="flex-none mr-2"
                  icon-set="mdi"
                  :path="mdiFileEditOutline"
                  :size="24"
                ></SvgIcon>
                {{ imageMeta.fileName }}
              </button>
            </label>
          </div>
          <div class="mr-6 mb-3 font-bold flex items-center">
            <SvgIcon
              class="text-base-200 mr-2"
              icon-set="mdi"
              :path="mdiFileImageOutline"
              :size="24"
            ></SvgIcon>
            <span v-if="fileName.ext" class="text-lg">
              .{{ fileName.ext }}
            </span>
            <span class="text-sm ml-1 uppercase">{{ imageMeta.fileType }}</span>
          </div>
          <div class="mr-6 mb-3 font-bold flex items-center">
            <SvgIcon
              class="text-base-200 mr-2"
              icon-set="mdi"
              :path="mdiOverscan"
              :size="24"
            ></SvgIcon>
            <span class="text-lg">
              {{ imageMeta.width }} x {{ imageMeta.height }}
            </span>
          </div>
          <div class="mr-6 mb-3 font-bold flex items-center">
            <SvgIcon
              class="text-base-200 mr-2"
              icon-set="mdi"
              :path="mdiDatabase"
              :size="24"
            ></SvgIcon>
            <span class="text-lg">
              {{ fileSize.amount }}
            </span>
            <span class="text-sm ml-1 uppercase">{{ fileSize.unit }}</span>
          </div>
        </div>
      </div>
    </div>
    <RichTextEditor
      ref="imageCommentEditor"
      class="flex-none pt-1 min-h-32 border-base-200 w-full"
      :placeholder="(la.t('.comment') as string)"
      @change="onCommentChanged"
    >
    </RichTextEditor>
  </div>
</template>
