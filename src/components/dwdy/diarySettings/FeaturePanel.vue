<script setup lang="ts">
import { ref, watch } from "vue";
import {
  mdiMinus,
  mdiPlus,
  mdiArrowLeft,
  mdiArrowRight,
  mdiArrowUp,
  mdiArrowDown,
  mdiArrowUpRight,
  mdiArrowUpLeft,
  mdiCalendar,
  mdiTimeline,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryTemplateAction } from "~/models/dwdy/diary";
import { DiaryLayout } from "~/models/dwdy/layout";
import {
  DiaryFeature,
  featureIconMap,
  AVAILABLE_FEATURES,
} from "~/models/dwdy/feature";
import { featureIcon, featureText } from "~/models/dwdy/featureDef";

import SvgIcon from "~/components/SvgIcon.vue";
import {
  PageNavigator,
  NavCellSpec,
  NavCellID,
} from "~/services/pageNavigator";

const emit = defineEmits<{
  (e: "triggerAction", action: string): void;
  (e: "moveAction", action: string | undefined): void;
  (e: "toggleHotkeyMark", value: boolean): void;
}>();

const la = new LocaleActor("pages.dwdy.DiaryPage.settingsModal");
const appState = useAppState();
const dwdyState = useDwdyState();

const hkScope = "diary-settings-feature-panel";

const pn = ref<PageNavigator>(new PageNavigator([]));
function updateNavCellSpec(resetCellId?: NavCellID): void {
  const navCellSpecs: NavCellSpec[] = [];
  const enabledFeatueMaxLength = Math.max(
    dwdyState.diary.value.doc.template.desktop.left.length,
    dwdyState.diary.value.doc.template.desktop.right.length
  );
  const disabledFeatureLength = dwdyState.diary.value.disabledFeatures.length;
  if (dwdyState.diary.value.doc.template) {
    dwdyState.diary.value.doc.template.desktop.left.forEach(
      (feature, index) => {
        navCellSpecs.push({
          cell: {
            name: `feature-${feature}-up`,
            start: [0, index],
            skip: () => {
              return index <= 0;
            },
          },
          callback: {
            trigger: () => {
              onDiaryTemplateMoved(feature, "up", true);
            },
          },
        });
        navCellSpecs.push({
          cell: {
            name: `feature-${feature}-down`,
            start: [1, index],
            skip: () => {
              return (
                index >=
                dwdyState.diary.value.doc.template.desktop.left.length - 1
              );
            },
          },
          callback: {
            trigger: () => {
              onDiaryTemplateMoved(feature, "down", true);
            },
          },
        });
        navCellSpecs.push({
          cell: {
            name: `feature-${feature}-right`,
            start: [2, index],
          },
          callback: {
            trigger: () => {
              onDiaryTemplateMoved(feature, "right", true);
            },
          },
        });
        navCellSpecs.push({
          cell: {
            name: `feature-${feature}-disable`,
            start: [3, index],
          },
          callback: {
            trigger: () => {
              onDiaryTemplateMoved(feature, "disable", true);
            },
          },
        });
      }
    );
    dwdyState.diary.value.doc.template.desktop.right.forEach(
      (feature, index) => {
        navCellSpecs.push({
          cell: {
            name: `feature-${feature}-up`,
            start: [4, index],
            skip: () => {
              return index <= 0;
            },
          },
          callback: {
            trigger: () => {
              onDiaryTemplateMoved(feature, "up", true);
            },
          },
        });
        navCellSpecs.push({
          cell: {
            name: `feature-${feature}-down`,
            start: [5, index],
            skip: () => {
              return (
                index >=
                dwdyState.diary.value.doc.template.desktop.right.length - 1
              );
            },
          },
          callback: {
            trigger: () => {
              onDiaryTemplateMoved(feature, "down", true);
            },
          },
        });
        navCellSpecs.push({
          cell: {
            name: `feature-${feature}-left`,
            start: [6, index],
          },
          callback: {
            trigger: () => {
              onDiaryTemplateMoved(feature, "left", true);
            },
          },
        });
        navCellSpecs.push({
          cell: {
            name: `feature-${feature}-disable`,
            start: [7, index],
          },
          callback: {
            trigger: () => {
              onDiaryTemplateMoved(feature, "disable", true);
            },
          },
        });
      }
    );
    dwdyState.diary.value.disabledFeatures.forEach((feature, index) => {
      navCellSpecs.push({
        cell: {
          name: `feature-${feature}-enable-left`,
          start: [0, index + enabledFeatueMaxLength],
          end: [4, index + enabledFeatueMaxLength + 1],
        },
        callback: {
          trigger: () => {
            onDiaryTemplateMoved(feature, "enable-left", true);
          },
        },
      });
      navCellSpecs.push({
        cell: {
          name: `feature-${feature}-enable`,
          start: [4, index + enabledFeatueMaxLength],
          end: [9, index + enabledFeatueMaxLength + 1],
        },
        callback: {
          trigger: () => {
            onDiaryTemplateMoved(feature, "enable", true);
          },
        },
      });
    });
  }
  navCellSpecs.push({
    cell: {
      name: `tab-general`,
      start: [0, enabledFeatueMaxLength + disabledFeatureLength],
      end: [6, enabledFeatueMaxLength + disabledFeatureLength + 1],
    },
    callback: {
      enter: () => {
        emit("moveAction", "tab-general");
      },
      trigger: () => {
        emit("triggerAction", "tab-general");
      },
      leave: () => {
        emit("moveAction", undefined);
      },
    },
  });
  navCellSpecs.push({
    cell: {
      name: `tab-feature`,
      start: [6, enabledFeatueMaxLength + disabledFeatureLength],
    },
    callback: {
      enter: () => {
        emit("moveAction", "tab-feature");
      },
      trigger: () => {
        emit("triggerAction", "tab-feature");
      },
      leave: () => {
        emit("moveAction", undefined);
      },
    },
  });
  navCellSpecs.push({
    cell: {
      name: `tab-data`,
      start: [7, enabledFeatueMaxLength + disabledFeatureLength],
    },
    callback: {
      enter: () => {
        emit("moveAction", "tab-data");
      },
      trigger: () => {
        emit("triggerAction", "tab-data");
      },
      leave: () => {
        emit("moveAction", undefined);
      },
    },
  });
  navCellSpecs.push({
    cell: {
      name: `tab-close`,
      start: [0, enabledFeatueMaxLength + disabledFeatureLength + 1],
      end: [8, enabledFeatueMaxLength + disabledFeatureLength + 2],
    },
    callback: {
      enter: () => {
        emit("moveAction", "close");
      },
      trigger: () => {
        emit("triggerAction", "close");
      },
      leave: () => {
        emit("moveAction", undefined);
      },
    },
  });
  pn.value.resetCellSpec(navCellSpecs, resetCellId);
}
updateNavCellSpec();

appState.hk.value.setupHotKeys(hkScope, () => {
  appState.hk.value.registerPageNavigatorKeys(
    pn.value as PageNavigator,
    hkScope
  );
  AVAILABLE_FEATURES.forEach((feature, index) => {
    appState.hk.value.registerKey({
      keys: [String(index)],
      scope: hkScope,
      callback: () => {
        if (dwdyState.diary.value.disabledFeatures.includes(feature)) {
          pn.value.resetCurrent(`feature-${feature}-enable`);
        } else {
          pn.value.resetCurrent(`feature-${feature}-disable`);
        }
      },
    });
  });
  appState.hk.value.registerKey({
    keys: ["7"],
    scope: hkScope,
    callback: () => {
      emit("triggerAction", "tab-general");
    },
  });
  appState.hk.value.registerKey({
    keys: ["8"],
    scope: hkScope,
    callback: () => {
      emit("triggerAction", "tab-feature");
    },
  });
  appState.hk.value.registerKey({
    keys: ["9"],
    scope: hkScope,
    callback: () => {
      emit("triggerAction", "tab-data");
    },
  });
  appState.hk.value.registerKey({
    keys: ["x"],
    scope: hkScope,
    callback: () => {
      emit("triggerAction", "close");
    },
  });
});

function buildActionAfterCell(
  feature: DiaryFeature,
  action: DiaryTemplateAction,
  isPnShown?: boolean
): NavCellID | undefined {
  if (!isPnShown) {
    return undefined;
  }
  switch (action) {
    case "left":
      return `feature-${feature}-right`;
    case "right":
      return `feature-${feature}-left`;
    case "enable":
    case "enable-left":
    case "enable-right":
      return `feature-${feature}-disable`;
    case "disable":
      return `feature-${feature}-enable`;
    default:
      return `feature-${feature}-${action}`;
  }
}

async function onDiaryTemplateMoved(
  feature: DiaryFeature,
  action: DiaryTemplateAction,
  isPnShown?: boolean
): Promise<void> {
  dwdyState.diary.value.moveTemplateFeature(feature, action);
  await dwdyState.diary.value.save();
  updateNavCellSpec(buildActionAfterCell(feature, action, isPnShown));
}

watch(
  () => appState.hk.value.isMarkShown(hkScope),
  () => {
    emit("toggleHotkeyMark", appState.hk.value.isMarkShown(hkScope));
  }
);

function showFeatureHotkey(feature: DiaryFeature): number {
  return AVAILABLE_FEATURES.indexOf(feature);
}
</script>

<template>
  <div>
    <div class="cell-block mt-6 mb-2">
      <div class="cell-title">
        {{ la.t(".featurePanel.enabledFeatures") }}
      </div>
      <div class="flex md:hidden p-4 flex-col justify-between">
        <div
          v-for="(feature, index) in dwdyState.diary.value.doc.template.mobile"
          :key="feature"
          class="flex items-center m-1 p-3 border border-base-200 rounded"
        >
          <span
            v-if="appState.hk.value.isMarkShown(hkScope)"
            class="hotkey-mark mr-2"
            >{{ showFeatureHotkey(feature) }}</span
          >
          <SvgIcon
            class="mr-2 text-primary"
            :icon-set="featureIcon(feature).set"
            :path="featureIcon(feature).path"
            :size="24"
          ></SvgIcon>
          <div class="grow mr-4 text-primary">
            {{ featureText(feature, la) }}
          </div>
          <button
            v-if="index === 0"
            class="mr-2 btn btn-circle btn-sm"
            disabled
          >
            <SvgIcon icon-set="mdi" :path="mdiArrowUp" :size="20"></SvgIcon>
          </button>
          <button
            v-else
            class="mr-2 btn btn-circle btn-sm"
            @click="onDiaryTemplateMoved(feature, 'up')"
          >
            <SvgIcon icon-set="mdi" :path="mdiArrowUp" :size="20"></SvgIcon>
          </button>
          <button
            v-if="
              index === dwdyState.diary.value.doc.template.mobile.length - 1
            "
            class="mr-2 btn btn-circle btn-sm"
            disabled
          >
            <SvgIcon icon-set="mdi" :path="mdiArrowDown" :size="20"></SvgIcon>
          </button>
          <button
            v-else
            class="mr-2 btn btn-circle btn-sm"
            @click="onDiaryTemplateMoved(feature, 'down')"
          >
            <SvgIcon icon-set="mdi" :path="mdiArrowDown" :size="20"></SvgIcon>
          </button>
          <button
            class="btn btn-circle btn-error btn-sm"
            @click="onDiaryTemplateMoved(feature, 'disable')"
          >
            <SvgIcon icon-set="mdi" :path="mdiMinus" :size="20"></SvgIcon>
          </button>
        </div>
      </div>
      <div class="hidden md:flex p-4 justify-between">
        <div class="flex-1 m-1 flex flex-col justify-stretch">
          <div
            v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Calendar"
            class="w-full mb-2 flex justify-center items-center p-8 border border-base-200 border-dashed"
          >
            <SvgIcon
              class="mr-2 text-primary"
              icon-set="mdi"
              :path="mdiCalendar"
              :size="24"
            ></SvgIcon>
            <div class="text-primary">
              {{ la.t(".featurePanel.calendar") }}
            </div>
          </div>
          <div
            v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Timeline"
            class="w-full mb-2 flex items-center p-3 border border-base-200 border-dashed"
          >
            <SvgIcon
              class="mr-2 text-primary"
              icon-set="mdi"
              :path="mdiTimeline"
              :size="24"
            ></SvgIcon>
            <div class="text-primary">
              {{ la.t(".featurePanel.date") }}
            </div>
          </div>
          <div
            class="grow flex flex-col justify-stretch p-1 border border-base-200 border-dashed"
          >
            <div
              v-for="(feature, index) in dwdyState.diary.value.doc.template
                .desktop.left"
              :key="feature"
              class="flex items-center m-1 p-3 border border-base-200 rounded"
            >
              <span
                v-if="appState.hk.value.isMarkShown(hkScope)"
                class="hotkey-mark mr-2"
                >{{ showFeatureHotkey(feature) }}</span
              >
              <SvgIcon
                class="mr-2 text-primary"
                :icon-set="featureIcon(feature).set"
                :path="featureIcon(feature).path"
                :size="24"
              ></SvgIcon>
              <div class="grow mr-4 text-primary">
                {{ featureText(feature, la) }}
              </div>
              <button
                v-if="index === 0"
                class="mr-2 btn btn-circle btn-sm"
                disabled
              >
                <SvgIcon icon-set="mdi" :path="mdiArrowUp" :size="20"></SvgIcon>
              </button>
              <button
                v-else
                class="mr-2 btn btn-circle btn-sm"
                :class="{
                  'border-8 border-base-200 btn-md': pn.isCurrent(
                    `feature-${feature}-up`
                  ),
                }"
                @click="onDiaryTemplateMoved(feature, 'up')"
              >
                <SvgIcon icon-set="mdi" :path="mdiArrowUp" :size="20"></SvgIcon>
              </button>
              <button
                v-if="
                  index ===
                  dwdyState.diary.value.doc.template.desktop.left.length - 1
                "
                class="mr-2 btn btn-circle btn-sm"
                disabled
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="mdiArrowDown"
                  :size="20"
                ></SvgIcon>
              </button>
              <button
                v-else
                class="mr-2 btn btn-circle btn-sm"
                :class="{
                  'border-8 border-base-200 btn-md': pn.isCurrent(
                    `feature-${feature}-down`
                  ),
                }"
                @click="onDiaryTemplateMoved(feature, 'down')"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="mdiArrowDown"
                  :size="20"
                ></SvgIcon>
              </button>
              <button
                class="mr-2 btn btn-circle btn-info btn-sm"
                :class="{
                  'border-8 border-base-200 btn-md': pn.isCurrent(
                    `feature-${feature}-right`
                  ),
                }"
                @click="onDiaryTemplateMoved(feature, 'right')"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="mdiArrowRight"
                  :size="20"
                ></SvgIcon>
              </button>
              <button
                class="btn btn-circle btn-error btn-sm"
                :class="{
                  'border-8 border-base-200 btn-md': pn.isCurrent(
                    `feature-${feature}-disable`
                  ),
                }"
                @click="onDiaryTemplateMoved(feature, 'disable')"
              >
                <SvgIcon icon-set="mdi" :path="mdiMinus" :size="20"></SvgIcon>
              </button>
            </div>
          </div>
        </div>
        <div
          class="flex-1 flex flex-col justify-stretch m-1 p-1 border border-base-200 border-dashed"
        >
          <div
            v-for="(feature, index) in dwdyState.diary.value.doc.template
              .desktop.right"
            :key="feature"
            class="flex items-center m-1 p-3 border border-base-200 rounded"
          >
            <span
              v-if="appState.hk.value.isMarkShown(hkScope)"
              class="hotkey-mark mr-2"
              >{{ showFeatureHotkey(feature) }}</span
            >
            <SvgIcon
              class="mr-2 text-primary"
              :icon-set="featureIcon(feature).set"
              :path="featureIcon(feature).path"
              :size="24"
            ></SvgIcon>
            <div class="grow mr-4 text-primary">
              {{ featureText(feature, la) }}
            </div>
            <button
              v-if="index === 0"
              class="mr-2 btn btn-circle btn-sm"
              disabled
            >
              <SvgIcon icon-set="mdi" :path="mdiArrowUp" :size="20"></SvgIcon>
            </button>
            <button
              v-else
              class="mr-2 btn btn-circle btn-sm"
              :class="{
                'border-8 border-base-200 btn-md': pn.isCurrent(
                  `feature-${feature}-up`
                ),
              }"
              @click="onDiaryTemplateMoved(feature, 'up')"
            >
              <SvgIcon icon-set="mdi" :path="mdiArrowUp" :size="20"></SvgIcon>
            </button>
            <button
              v-if="
                index ===
                dwdyState.diary.value.doc.template.desktop.right.length - 1
              "
              class="mr-2 btn btn-circle btn-sm"
              disabled
            >
              <SvgIcon icon-set="mdi" :path="mdiArrowDown" :size="20"></SvgIcon>
            </button>
            <button
              v-else
              class="mr-2 btn btn-circle btn-sm"
              :class="{
                'border-8 border-base-200 btn-md': pn.isCurrent(
                  `feature-${feature}-down`
                ),
              }"
              @click="onDiaryTemplateMoved(feature, 'down')"
            >
              <SvgIcon icon-set="mdi" :path="mdiArrowDown" :size="20"></SvgIcon>
            </button>
            <button
              class="mr-2 btn btn-circle btn-info btn-sm"
              :class="{
                'border-8 border-base-200 btn-md': pn.isCurrent(
                  `feature-${feature}-left`
                ),
              }"
              @click="onDiaryTemplateMoved(feature, 'left')"
            >
              <SvgIcon icon-set="mdi" :path="mdiArrowLeft" :size="20"></SvgIcon>
            </button>
            <button
              class="btn btn-circle btn-error btn-sm"
              :class="{
                'border-8 border-base-200 btn-md': pn.isCurrent(
                  `feature-${feature}-disable`
                ),
              }"
              @click="onDiaryTemplateMoved(feature, 'disable')"
            >
              <SvgIcon icon-set="mdi" :path="mdiMinus" :size="20"></SvgIcon>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="cell-block mt-6 mb-2">
      <div class="cell-title">
        {{ la.t(".featurePanel.disabledFeatures") }}
      </div>
      <div class="flex md:hidden p-5 flex-col justify-stretch">
        <div
          v-for="feature in dwdyState.diary.value.disabledFeatures"
          :key="feature"
          class="flex items-center p-3 border border-base-200 rounded my-1"
        >
          <span
            v-if="appState.hk.value.isMarkShown(hkScope)"
            class="hotkey-mark mr-2"
            >{{ showFeatureHotkey(feature) }}</span
          >
          <SvgIcon
            class="mr-2 text-primary"
            :icon-set="featureIcon(feature).set"
            :path="featureIcon(feature).path"
            :size="24"
          ></SvgIcon>
          <div class="grow mr-4 text-primary">
            {{ featureText(feature, la) }}
          </div>
          <button
            class="btn btn-circle btn-success btn-sm"
            :class="{
              'border-8 border-base-200 btn-md': pn.isCurrent(
                `feature-${feature}-enable`
              ),
            }"
            @click="onDiaryTemplateMoved(feature, 'enable')"
          >
            <SvgIcon icon-set="mdi" :path="mdiPlus" :size="20"></SvgIcon>
          </button>
        </div>
      </div>
      <div class="hidden md:flex p-5 flex-col justify-stretch">
        <div
          v-for="feature in dwdyState.diary.value.disabledFeatures"
          :key="feature"
          class="flex items-center p-3 border border-base-200 rounded my-1"
        >
          <button
            class="btn btn-circle btn-success btn-sm"
            :class="{
              'border-8 border-base-200 btn-md': pn.isCurrent(
                `feature-${feature}-enable-left`
              ),
            }"
            @click="onDiaryTemplateMoved(feature, 'enable-left')"
          >
            <SvgIcon icon-set="mdi" :path="mdiArrowUpLeft" :size="20"></SvgIcon>
          </button>
          <div class="grow flex justify-center items-center">
            <span
              v-if="appState.hk.value.isMarkShown(hkScope)"
              class="hotkey-mark mr-2"
              >{{ showFeatureHotkey(feature) }}</span
            >
            <SvgIcon
              class="mr-2 text-primary"
              :icon-set="featureIcon(feature).set"
              :path="featureIcon(feature).path"
              :size="24"
            ></SvgIcon>
            <div class="mr-4 text-primary">
              {{ featureText(feature, la) }}
            </div>
          </div>
          <button
            class="btn btn-circle btn-success btn-sm"
            :class="{
              'border-8 border-base-200 btn-md': pn.isCurrent(
                `feature-${feature}-enable`
              ),
            }"
            @click="onDiaryTemplateMoved(feature, 'enable')"
          >
            <SvgIcon
              icon-set="mdi"
              :path="mdiArrowUpRight"
              :size="20"
            ></SvgIcon>
          </button>
        </div>
      </div>
    </div>
    <div class="mt-3 mb-2 input-hint-block">
      {{ la.t(".featurePanel.hint") }}
    </div>
  </div>
</template>
