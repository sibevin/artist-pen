<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import {
  mdiFileUpload,
  mdiDotsCircle,
  mdiFileImageOutline,
  mdiOverscan,
  mdiDatabase,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureIcon } from "~/dwdy/feature/map";
import { FeatureMeta } from "~/dwdy/feature/image/def";
import { replaceImage, uploadImage } from "~/dwdy/feature/image/action";
import { FileSizeDisplay, displayFileSize } from "~/services/file";
import SvgIcon from "~/components/SvgIcon.vue";
import RichTextEditor from "~/components/input/RichTextEditor.vue";
import PaginationPanel from "~/components/PaginationPanel.vue";

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
  (e: "creationDone", index: number): void;
  (e: "toggleJump"): void;
  (e: "selectIndex", index: number): void;
}>();

const la = new LocaleActor("dwdy.feature.image.components.EditorMain");
const dwdyState = useDwdyState();
const imageDataUrl = ref<string>();
const imageMeta = ref<FeatureMeta>();
const fileSize = ref<FileSizeDisplay>({ unit: "kb", amount: "" });
const imageComment = ref<string>();
const imageCommentEditor = ref();
const isInLoading = ref(false);

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
  if (!imageMeta.value.daUid) {
    return;
  }
  const da = await dwdyState.entry.value.fetchAttachment(imageMeta.value.daUid);
  if (!da) {
    return;
  }
  imageDataUrl.value = da.doc.data;
  fileSize.value = displayFileSize(imageMeta.value.fileSize);
  imageComment.value = imageMeta.value.comment;
}

function initCommentEditor(): void {
  if (imageCommentEditor.value) {
    imageCommentEditor.value.initEditor(imageComment.value || "");
  }
}

async function onCommentChanged(text: {
  raw: string;
  html: string;
}): Promise<void> {
  if (imageMeta.value) {
    imageComment.value = text.html;
    dwdyState.entry.value.assignContent(
      DiaryFeature.Image,
      props.contentIndex,
      Object.assign(imageMeta.value, { comment: text.html })
    );
    await dwdyState.entry.value.save();
    dwdyState.updateEntry(dwdyState.entry.value.doc);
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
      await replaceImage(props.contentIndex, file, result);
      isInLoading.value = false;
    }
  };
  fr.readAsDataURL(file);
}

async function onUploadFileSelected(event: Event): Promise<void> {
  const files = event.target && (event.target as HTMLInputElement).files;
  let storedCount = 0;
  if (!files) {
    return;
  }
  isInLoading.value = true;
  const totalCount = files.length;
  const oriLastIndex = props.contentCount - 1;
  for (const file of files as FileList) {
    const fr = new FileReader();
    fr.onload = async () => {
      const result = fr.result as string;
      if (result) {
        await uploadImage(file, result);
        storedCount++;
        if (storedCount === totalCount) {
          isInLoading.value = false;
          emit("creationDone", oriLastIndex + 1);
        }
      }
    };
    fr.readAsDataURL(file);
  }
}

function onPageSelected(page: number): void {
  emit("selectIndex", page - 1);
}

function onCurrentPageSelected(): void {
  emit("toggleJump");
}
</script>
<template>
  <div class="w-full h-full p-3 flex flex-col">
    <div class="min-h-0 grow">
      <div
        v-if="imageMeta && imageMeta.daUid"
        class="h-full w-full flex flex-col justify-between items-stretch"
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
                :accept="ACCEPT_FORMATS.join(',')"
                @change="onReplaceFileSelected"
              />
            </label>
            <div
              class="w-full mt-3 p-3 pb-0 bg-base-100 rounded flex flex-wrap items-center"
            >
              <div class="mr-6 mb-3 font-bold flex items-center">
                <SvgIcon
                  class="text-base-200 mr-2"
                  icon-set="mdi"
                  :path="mdiFileImageOutline"
                  :size="24"
                ></SvgIcon>
                <span class="text-lg"> .{{ imageMeta.fileExt }} </span>
                <span class="text-sm ml-1 uppercase">{{
                  imageMeta.fileType
                }}</span>
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
    </div>
    <label
      v-if="contentCount === 0"
      class="self-center btn btn-ghost rounded-full items-center"
      :class="{ 'btn-disabled': isInLoading }"
    >
      <SvgIcon
        class="mr-2"
        :icon-set="featureIcon(DiaryFeature.Image, 'create').set"
        :path="featureIcon(DiaryFeature.Image, 'create').path"
        :size="24"
      ></SvgIcon>
      {{ la.t(".uploadImage") }}
      <div v-if="isInLoading">
        <SvgIcon
          class="animate-spin-slow mr-2"
          icon-set="mdi"
          :path="mdiDotsCircle"
          :size="20"
        ></SvgIcon>
      </div>
      <input
        v-else
        class="hidden"
        type="file"
        :multiple="true"
        :accept="ACCEPT_FORMATS.join(',')"
        @change="onUploadFileSelected"
      />
    </label>
    <PaginationPanel
      v-else
      class="mt-2"
      :total-page="props.contentCount"
      :current-page="props.contentIndex + 1"
      @select="onPageSelected"
      @current-select="onCurrentPageSelected"
    >
      <template #right-panel>
        <label
          ref="contentUploadBtn"
          class="ml-2 btn btn-ghost rounded-full items-center"
          :class="{ 'btn-disabled': isInLoading }"
        >
          <SvgIcon
            :icon-set="featureIcon(DiaryFeature.Image, 'create').set"
            :path="featureIcon(DiaryFeature.Image, 'create').path"
            :size="24"
          ></SvgIcon>
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
            :multiple="true"
            :accept="ACCEPT_FORMATS.join(',')"
            @change="onUploadFileSelected"
          />
        </label>
      </template>
    </PaginationPanel>
  </div>
</template>
