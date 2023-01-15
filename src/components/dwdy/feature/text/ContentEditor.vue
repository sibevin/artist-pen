<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/models/dwdy/feature";
import RichTextEditor from "~/components/input/RichTextEditor.vue";
import { FeatureMeta, updateText } from "~/models/dwdy/feature/text/index";

const props = defineProps({
  contentIndex: {
    type: Number,
    required: true,
  },
});

const la = new LocaleActor("components.dwdy.feature.text.ContentEditor");
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
  await updateText(text);
  if (textEditor.value) {
    textEditor.value.updateStatus("saved");
  }
}
</script>
<template>
  <RichTextEditor
    v-if="currentText !== undefined"
    ref="textEditor"
    class="w-full h-full p-2"
    :placeholder="(la.t('.writeSomethingHint') as string)"
    @change="onTextChanged"
  >
  </RichTextEditor>
</template>
