<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from "vue";
import {
  mdiShuffleVariant,
  mdiDeleteForever,
  mdiDotsCircle,
  mdiViewGallery,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";
import {
  DiaryFeatureDef,
  featureFlow,
  featureText,
  featureIcon,
  featureComponent,
} from "~/models/dwdy/featureDef";
import { SelectionOption } from "~/models/app/types";
import SvgIcon from "~/components/SvgIcon.vue";
import ModalBase from "~/components/ModalBase.vue";
import PaginationPanel from "~/components/PaginationPanel.vue";
import ModalSelector from "~/components/ModalSelector.vue";
import DiaryContentDeletionModal from "~/components/dwdy/diaryContent/DeletionModal.vue";
import DiaryContentJumpModal from "~/components/dwdy/diaryContent/JumpModal.vue";

type EditorModalAction = "create" | "update";

const props = defineProps({
  currentSelectedBtn: {
    type: String,
    default: undefined,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
  fromPageScope: {
    type: String,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: string): void;
  (e: "openFullViewer"): void;
}>();

const la = new LocaleActor("app");
const appState = useAppState();
const dwdyState = useDwdyState();
const isModalOn = ref(false);
const diaryContentEditorModal = ref();
const modalCurrentSelectedBtn = ref<string>();
const isHotkeyMarkShown = ref(false);
const isMovementModalOn = ref(false);
const isDeletionConfirmationModalOn = ref(false);
const isJumpModalOn = ref(false);
const isInLoading = ref(false);
const contentUploadBtn = ref();
const contentCreateBtn = ref();

// const currentFeature = ref<DiaryFeature>(DiaryFeature.Text);
// const currentContentIndex = ref(0);

const currentContentCount = ref(0);

const currentPage = computed<number>(() => {
  return dwdyState.editingContent.value.index + 1;
});

const currentFlow = computed<DiaryFeatureDef["flow"]>(() => {
  return featureFlow(dwdyState.editingContent.value.feature);
});

const positionOptions = computed<SelectionOption[]>(() => {
  if (currentContentCount.value > 1) {
    return [...Array(currentContentCount.value).keys()].map((index) => {
      return { label: String(index + 1), value: String(index) };
    });
  } else {
    return [];
  }
});

updateContentCount();

onMounted(() => {
  isModalOn.value = props.modelValue;
});

watch(
  () => props.modelValue,
  (newValue) => {
    isModalOn.value = newValue;
  }
);

watch(
  () => isModalOn.value,
  () => {
    triggerModelUpdate();
  }
);

watch(
  () => [dwdyState.entry.value, dwdyState.editingContent.value.feature],
  () => {
    updateContentCount();
  }
);

function updateContentCount(): void {
  currentContentCount.value = dwdyState.entry.value.fetchContents(
    dwdyState.editingContent.value.feature
  ).length;
}

function triggerModelUpdate() {
  if (!isModalOn.value) {
    appState.hk.value.switchScope(props.fromPageScope);
    dwdyState.editingContent.value.index = -1;
  }
  if (diaryContentEditorModal.value) {
    emit("update:modelValue", isModalOn.value);
  }
}

function goToLastIndex(): void {
  if (
    dwdyState.editingContent.value.index >= currentContentCount.value &&
    currentContentCount.value > 0
  ) {
    dwdyState.editingContent.value.index = currentContentCount.value - 1;
  }
  if (currentContentCount.value === 0) {
    dwdyState.editingContent.value.index = -1;
  }
}

async function createEntryWhenNotStored(): Promise<void> {
  if (!dwdyState.entry.value.isStored && dwdyState.entry.value.doc.dIndex) {
    const entry = await dwdyState.diary.value.insertNewEntryWithDIndexOrder(
      dwdyState.entry.value.doc.dIndex
    );
    dwdyState.updateEntryBunch(entry.doc);
  }
}

async function onCreationTriggered(index?: number): Promise<void> {
  await createEntryWhenNotStored();
  await currentFlow.value.creation.creator?.create();
  dwdyState.editingContent.value.index = -1;
  nextTick(() => {
    dwdyState.editingContent.value.index =
      index !== undefined ? index : currentContentCount.value - 1;
  });
}

function onDeletionBtnClicked(): void {
  isDeletionConfirmationModalOn.value = true;
}

function onMovementBtnClicked(): void {
  isMovementModalOn.value = true;
}

async function onMovementChanged(newPos: string): Promise<void> {
  const newIndex = parseInt(newPos);
  dwdyState.entry.value.moveContent(
    dwdyState.editingContent.value.feature,
    dwdyState.editingContent.value.index,
    newIndex
  );
  await dwdyState.entry.value.save();
  dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
  dwdyState.editingContent.value.index = newIndex;
}

function onPageSelected(page: number): void {
  dwdyState.editingContent.value.index = page - 1;
}

function onCurrentPageSelected(): void {
  isJumpModalOn.value = true;
}

async function onUploadFileSelected(event: Event): Promise<void> {
  const files = event.target && (event.target as HTMLInputElement).files;
  let storedCount = 0;
  if (!files) {
    return;
  }
  await createEntryWhenNotStored();
  if (currentFlow.value.creation.uploader) {
    isInLoading.value = true;
    const totalCount = files.length;
    const oriLastIndex = currentContentCount.value - 1;
    for (const file of files as FileList) {
      const fr = new FileReader();
      fr.onload = async () => {
        const result = fr.result as string;
        if (result) {
          await currentFlow.value.creation.uploader?.upload(file, result);
          storedCount++;
          if (storedCount === totalCount) {
            isInLoading.value = false;
            onCreationTriggered(oriLastIndex + 1);
          }
        }
      };
      fr.readAsDataURL(file);
    }
  }
}

function onDeletionDone(): void {
  updateContentCount();
  goToLastIndex();
}

function onContentJump(index: number): void {
  dwdyState.editingContent.value.index = index;
}

function onFullViewerOpened(): void {
  const currentIndex = dwdyState.editingContent.value.index;
  isModalOn.value = false;
  nextTick(() => {
    dwdyState.editingContent.value.index = currentIndex;
    emit("openFullViewer");
  });
}

function openModal(action: EditorModalAction = "update") {
  if (dwdyState.editingContent.value.index < 0) {
    dwdyState.editingContent.value.index = 0;
  }
  if (action === "create") {
    nextTick(() => {
      if (currentFlow.value.creation.creator) {
        contentCreateBtn.value.click();
      }
      if (currentFlow.value.creation.uploader) {
        contentUploadBtn.value.click();
      }
    });
  }
  isModalOn.value = true;
}
defineExpose({ openModal });
</script>

<template>
  <div>
    <ModalBase
      ref="diaryContentEditorModal"
      v-model="isModalOn"
      class="fixed z-10 modal-full-m-2"
      modal-base-id="diary-content-editor-modal"
      :current-selected-btn="modalCurrentSelectedBtn"
      :show-hotkey-hint="isHotkeyMarkShown"
    >
      <template #modal-title>
        <div>
          <h2 class="card-title mb-2">
            <SvgIcon
              class="text-base-content mr-1"
              :icon-set="
                featureIcon(dwdyState.editingContent.value.feature).set
              "
              :path="featureIcon(dwdyState.editingContent.value.feature).path"
              :size="24"
            ></SvgIcon>
            {{ featureText(dwdyState.editingContent.value.feature, la) }}
          </h2>
        </div>
      </template>
      <template #modal-fixed-bottom-panel>
        <div
          v-if="!currentFlow.creation.customized"
          class="w-full flex flex-col items-center"
        >
          <PaginationPanel
            class="mt-2"
            :total-page="currentContentCount"
            :current-page="currentPage"
            @select="onPageSelected"
            @current-select="onCurrentPageSelected"
          >
          </PaginationPanel>
          <div class="mt-2 flex items-center">
            <label
              v-if="currentFlow.creation.uploader"
              ref="contentUploadBtn"
              class="btn btn-ghost rounded-full items-center"
              :class="{ 'btn-disabled': isInLoading }"
            >
              <SvgIcon
                :icon-set="
                  featureIcon(dwdyState.editingContent.value.feature, 'create')
                    .set
                "
                :path="
                  featureIcon(dwdyState.editingContent.value.feature, 'create')
                    .path
                "
                :size="24"
              ></SvgIcon>
              <div class="hidden md:block ml-2">
                {{ la.t(".action.create") }}
              </div>
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
                :multiple="currentFlow.creation.uploader?.multiple"
                :accept="currentFlow.creation.uploader?.accept"
                @change="onUploadFileSelected"
              />
            </label>
            <button
              v-if="currentFlow.creation.creator"
              ref="contentCreateBtn"
              class="btn btn-ghost rounded-full items-center"
              @click="onCreationTriggered()"
            >
              <SvgIcon
                :icon-set="
                  featureIcon(dwdyState.editingContent.value.feature, 'create')
                    .set
                "
                :path="
                  featureIcon(dwdyState.editingContent.value.feature, 'create')
                    .path
                "
                :size="24"
              ></SvgIcon>
              <div class="hidden md:block ml-2">
                {{ la.t(".action.create") }}
              </div>
            </button>
            <div
              v-if="currentContentCount > 0"
              class="grow flex justify-center items-center"
            >
              <button
                v-if="currentContentCount > 1"
                class="btn btn-ghost rounded-full items-center"
                @click="onMovementBtnClicked"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="mdiShuffleVariant"
                  :size="24"
                ></SvgIcon>
                <div class="hidden md:block ml-2">
                  {{ la.t(".action.changeOrder") }}
                </div>
              </button>
              <button
                class="btn btn-ghost text-error rounded-full items-center"
                @click="onDeletionBtnClicked"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="mdiDeleteForever"
                  :size="24"
                ></SvgIcon>
                <div class="hidden md:block ml-2">
                  {{ la.t(".action.delete") }}
                </div>
              </button>
              <button
                class="btn btn-ghost rounded-full items-center"
                @click="onFullViewerOpened"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="mdiViewGallery"
                  :size="22"
                ></SvgIcon>
                <div class="hidden md:block ml-2">
                  {{ la.t(".action.list") }}
                </div>
              </button>
            </div>
          </div>
        </div>
      </template>
      <template #modal-content>
        <div class="w-full h-full">
          <component
            :is="
              featureComponent(dwdyState.editingContent.value.feature, 'editor')
            "
            :content-index="dwdyState.editingContent.value.index"
          ></component>
        </div>
      </template>
    </ModalBase>
    <ModalSelector
      v-if="!currentFlow.creation.customized"
      v-model="isMovementModalOn"
      modal-id="content-movement-selector"
      :current-value="String(dwdyState.editingContent.value.index)"
      :options="positionOptions"
      :icon-enabled="true"
      @change="onMovementChanged"
    >
      <template #modal-title>
        <h2 class="card-title mb-4">
          <SvgIcon
            class="mr-1"
            icon-set="mdi"
            :path="mdiShuffleVariant"
            :size="24"
          ></SvgIcon>
          {{ la.t(".action.changeOrder") }}
        </h2>
      </template>
    </ModalSelector>
    <DiaryContentDeletionModal
      v-model="isDeletionConfirmationModalOn"
      @done="onDeletionDone"
    ></DiaryContentDeletionModal>
    <DiaryContentJumpModal
      v-model="isJumpModalOn"
      @jump="onContentJump"
    ></DiaryContentJumpModal>
  </div>
</template>
