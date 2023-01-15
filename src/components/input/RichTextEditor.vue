<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { mdiDotsCircle, mdiCheck, mdiUndo, mdiRedo } from "@mdi/js";
import { useDebounceFn } from "@vueuse/core";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "quill-paste-smart";
import SvgIcon from "~/components/SvgIcon.vue";
import { LocaleActor } from "~/services/locale";

type RichTextEditorStatus = "init" | "ready" | "saving" | "saved";

const props = defineProps({
  content: {
    type: String,
    default: undefined,
  },
  placeholder: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "change", value: { raw: string; html: string }): void;
}>();

const la = new LocaleActor("app");

const options = {
  modules: {
    toolbar: "#quill_toolbar",
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: true,
    },
  },
};
const quillEditor = ref();
const isQuillReady = ref(false);
const currentContent = ref<string>(props.content || "");
const currentStatus = ref<RichTextEditorStatus>("init");

const isReady = computed<boolean>(() => {
  return isQuillReady.value && quillEditor.value;
});

watch(
  () => isReady.value,
  (newValue) => {
    if (newValue) {
      initEditor();
    }
  }
);

function initEditor(content?: string, applyFocus = false) {
  currentStatus.value = "init";
  if (props.content === undefined && content === undefined) {
    return;
  }
  currentContent.value = content || props.content || "";
  quillEditor.value.setHTML(currentContent.value);
  nextTick(() => {
    if (applyFocus) {
      quillEditor.value.getQuill().focus();
    }
    quillEditor.value.getQuill().history.clear();
    currentStatus.value = "ready";
  });
}

function onQuillReady() {
  isQuillReady.value = true;
}

const triggerChangeEvent = useDebounceFn(async () => {
  if (quillEditor.value.getQuill().getLength() > 1) {
    currentContent.value = quillEditor.value.getHTML();
  } else {
    currentContent.value = "";
  }
  emit("change", {
    raw: quillEditor.value.getQuill().getText(),
    html: currentContent.value,
  });
}, 500);

function onContentChanged() {
  if (currentStatus.value !== "init") {
    currentStatus.value = "saving";
    triggerChangeEvent();
  }
}

function onUndoBtnClick() {
  quillEditor.value.getQuill().history.undo();
}

function onRedoBtnClick() {
  quillEditor.value.getQuill().history.redo();
}

function updateStatus(status: RichTextEditorStatus) {
  currentStatus.value = status;
}
defineExpose({ updateStatus, initEditor });
</script>
<template>
  <div class="flex flex-col justify-between items-stretch">
    <div
      class="min-h-0 grow overflow-y-auto border-2 border-base-200 border-dashed rounded"
    >
      <QuillEditor
        ref="quillEditor"
        class="grow"
        theme="snow"
        :options="options"
        :placeholder="props.placeholder"
        @ready="onQuillReady"
        @update:content="onContentChanged"
      />
    </div>
    <div class="flex-none flex items-center">
      <div id="quill_toolbar" class="flex">
        <button class="ql-bold"></button>
        <button class="ql-italic"></button>
        <button class="ql-underline"></button>
        <button class="ql-strike"></button>
        <button @click="onUndoBtnClick">
          <SvgIcon
            class="text-[#4b5563]"
            icon-set="mdi"
            :path="mdiUndo"
            :size="20"
          ></SvgIcon>
        </button>
        <button @click="onRedoBtnClick">
          <SvgIcon
            class="text-[#4b5563]"
            icon-set="mdi"
            :path="mdiRedo"
            :size="20"
          ></SvgIcon>
        </button>
      </div>
      <div class="mx-2 flex items-center">
        <div
          v-if="currentStatus === 'saving' || currentStatus === 'init'"
          class="flex items-center text-base-300 text-sm"
        >
          <SvgIcon
            class="animate-spin-slow mr-2"
            icon-set="mdi"
            :path="mdiDotsCircle"
            :size="20"
          ></SvgIcon>
          <span v-if="currentStatus === 'saving'">
            {{ la.t(".state.saving") }}
          </span>
          <span v-if="currentStatus === 'init'">
            {{ la.t(".state.loading") }}
          </span>
        </div>
        <div
          v-if="currentStatus === 'saved'"
          class="flex items-center text-success text-sm"
        >
          <SvgIcon
            class="mr-2"
            icon-set="mdi"
            :path="mdiCheck"
            :size="20"
          ></SvgIcon>
          {{ la.t(".state.saved") }}
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.ql-container {
  font-size: 1rem;
}
.ql-container.ql-snow {
  border: none;
}
.ql-toolbar.ql-snow {
  border: none;
}
.ql-editor {
  padding: 12px;
  padding-right: 26px;
}
.bem {
  margin: 5px;
}
</style>
