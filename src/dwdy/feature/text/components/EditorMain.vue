<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureIcon } from "~/dwdy/feature/map";
import { FeatureMeta } from "~/dwdy/feature/text/def";
import { addText, updateText } from "~/dwdy/feature/text/action";
import SvgIcon from "~/components/SvgIcon.vue";
import RichTextEditor from "~/components/input/RichTextEditor.vue";
import PaginationPanel from "~/components/PaginationPanel.vue";

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

const la = new LocaleActor("dwdy.feature.text.components.EditorMain");
const dwdyState = useDwdyState();
const currentText = ref<FeatureMeta>();
const textEditor = ref();

await fetchText();

watch(
  () => [dwdyState.entry.value],
  async () => {
    await fetchText();
  }
);

watch(
  () => [props.contentIndex],
  async () => {
    await fetchText();
    initTextEditor();
  }
);

onMounted(() => {
  initTextEditor();
});

async function fetchText(): Promise<void> {
  if (props.contentIndex < 0) {
    currentText.value = undefined;
    return;
  }
  currentText.value = dwdyState.entry.value.fetchContent<DiaryFeature.Text>(
    DiaryFeature.Text,
    props.contentIndex
  );
}

function initTextEditor(): void {
  if (textEditor.value) {
    textEditor.value.initEditor(
      (currentText.value && currentText.value.html) || ""
    );
  }
}

async function onTextChanged(text: FeatureMeta): Promise<void> {
  currentText.value = text;
  await updateText(text, props.contentIndex);
  if (textEditor.value) {
    textEditor.value.updateStatus("saved");
  }
}

async function onAddText(): Promise<void> {
  await addText({ raw: "", html: "" });
  emit("creationDone");
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
      <RichTextEditor
        v-if="currentText !== undefined"
        ref="textEditor"
        class="w-full h-full"
        :placeholder="(la.t('.writeSomethingHint') as string)"
        @change="onTextChanged"
      >
      </RichTextEditor>
    </div>
    <button
      v-if="contentCount === 0"
      class="self-center btn btn-ghost rounded-full items-center"
      @click="onAddText()"
    >
      <SvgIcon
        class="mr-2"
        :icon-set="featureIcon(DiaryFeature.Text, 'create').set"
        :path="featureIcon(DiaryFeature.Text, 'create').path"
        :size="24"
      ></SvgIcon>
      {{ la.t("app.action.create") }}
    </button>
    <PaginationPanel
      v-else
      class="mt-2"
      :total-page="props.contentCount"
      :current-page="props.contentIndex + 1"
      @select="onPageSelected"
      @current-select="onCurrentPageSelected"
    >
      <template #right-panel>
        <button
          class="ml-2 btn btn-ghost rounded-full items-center"
          @click="onAddText()"
        >
          <SvgIcon
            :icon-set="featureIcon(DiaryFeature.Text, 'create').set"
            :path="featureIcon(DiaryFeature.Text, 'create').path"
            :size="24"
          ></SvgIcon>
        </button>
      </template>
    </PaginationPanel>
  </div>
</template>
