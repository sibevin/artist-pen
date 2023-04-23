<script setup lang="ts">
import { ref, watch } from "vue";
import {
  mdiTrayFull,
  mdiTrayArrowUp,
  mdiDeleteForever,
  mdiFileMultipleOutline,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryDocParams } from "~/models/dwdy/diary";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureIcon, featureText } from "~/dwdy/feature/map";

import SvgIcon from "~/components/SvgIcon.vue";
import PercentageCircle from "~/components/PercentageCircle.vue";

const la = new LocaleActor("pages.dwdy.DiaryPage.settingsModal");
const appState = useAppState();
const dwdyState = useDwdyState();
const updatedDiaryAttrs = ref<DiaryDocParams>(
  Object.assign({}, dwdyState.diary.value.doc)
);

function resetPnCurrent(): void {
  // pn.value.resetCurrent();
}
defineExpose({ resetPnCurrent });
</script>

<template>
  <div>
    <div class="cell-block mt-6 mb-2">
      <div class="cell-title">
        {{ la.t(".dataPanel.statistics") }}
      </div>
      <div class="flex flex-col p-5">
        <div class="flex items-center">
          <div class="shrink-0 stats stats-vertical shadow">
            <div class="flex items-center p-3">
              <div class="flex items-center text-primary">
                <SvgIcon
                  class="mr-2"
                  icon-set="mdi"
                  :path="mdiTrayFull"
                  :size="24"
                ></SvgIcon>
                {{ la.t(".dataPanel.totalSize") }}
              </div>
            </div>
            <div class="stat">
              <div class="stat-desc">大小</div>
              <div class="stat-value">
                1234<span class="text-sm ml-1">MB</span>
              </div>
            </div>
          </div>
          <div class="grow"></div>
          <PercentageCircle
            class="mx-3"
            :percent-colors="[
              { percent: 5, cssClass: 'text-primary opacity-100' },
              { percent: 10, cssClass: 'text-primary opacity-80' },
              { percent: 15, cssClass: 'text-primary opacity-60' },
              { percent: 20, cssClass: 'text-primary opacity-40' },
              { percent: 100, cssClass: 'text-primary opacity-20' },
            ]"
            :size="120"
            :width="6"
            :bar-gap="0.5"
            bar-linecap="butt"
          ></PercentageCircle>
          <div class="shrink-0 grid grid-cols-2 gap-1">
            <SvgIcon
              :icon-set="featureIcon(DiaryFeature.Text).set"
              :path="featureIcon(DiaryFeature.Text).path"
              :size="24"
            ></SvgIcon>
            <div>12%</div>
            <SvgIcon
              :icon-set="featureIcon(DiaryFeature.Image).set"
              :path="featureIcon(DiaryFeature.Image).path"
              :size="24"
            ></SvgIcon>
            <div>24%</div>
            <SvgIcon
              :icon-set="featureIcon(DiaryFeature.Sound).set"
              :path="featureIcon(DiaryFeature.Sound).path"
              :size="24"
            ></SvgIcon>
            <div>24%</div>
            <SvgIcon
              :icon-set="featureIcon(DiaryFeature.Video).set"
              :path="featureIcon(DiaryFeature.Video).path"
              :size="24"
            ></SvgIcon>
            <div>24%</div>
            <SvgIcon
              icon-set="mdi"
              :path="mdiFileMultipleOutline"
              :size="20"
            ></SvgIcon>
            <div>24%</div>
          </div>
        </div>
        <div class="form-sep mt-6 mb-3"></div>
        <div class="flex flex-col justify-start gap-3">
          <div class="flex">
            <div class="stats shadow">
              <div class="flex flex-col justify-center items-center p-3">
                <SvgIcon
                  class="mb-2"
                  :icon-set="featureIcon(DiaryFeature.Text).set"
                  :path="featureIcon(DiaryFeature.Text).path"
                  :size="24"
                ></SvgIcon>
                <div class="text-primary">
                  {{ featureText(DiaryFeature.Text, la) }}
                </div>
              </div>
              <div class="stat">
                <div class="stat-desc">檔案個數</div>
                <div class="stat-value">100</div>
              </div>
              <div class="stat">
                <div class="stat-desc">文字數</div>
                <div class="stat-value">23450</div>
              </div>
            </div>
            <div class="grow"></div>
          </div>
          <div class="flex">
            <div class="stats shadow">
              <div class="flex flex-col justify-center items-center p-3">
                <SvgIcon
                  class="mb-2"
                  :icon-set="featureIcon(DiaryFeature.Image).set"
                  :path="featureIcon(DiaryFeature.Image).path"
                  :size="24"
                ></SvgIcon>
                <div class="text-primary">
                  {{ featureText(DiaryFeature.Image, la) }}
                </div>
              </div>
              <div class="stat">
                <div class="stat-desc">檔案個數</div>
                <div class="stat-value">1234</div>
              </div>
              <div class="stat">
                <div class="stat-desc">大小</div>
                <div class="stat-value">
                  123<span class="text-sm ml-1">MB</span>
                </div>
              </div>
            </div>
            <div class="grow"></div>
          </div>
          <div class="flex">
            <div class="stats shadow">
              <div class="flex flex-col justify-center items-center p-3">
                <SvgIcon
                  class="mb-2"
                  :icon-set="featureIcon(DiaryFeature.Sound).set"
                  :path="featureIcon(DiaryFeature.Sound).path"
                  :size="24"
                ></SvgIcon>
                <div class="text-primary">
                  {{ featureText(DiaryFeature.Sound, la) }}
                </div>
              </div>
              <div class="stat">
                <div class="stat-desc">檔案個數</div>
                <div class="stat-value">8</div>
              </div>
              <div class="stat">
                <div class="stat-desc">長度</div>
                <div class="stat-value">
                  1<span class="text-sm mx-1">M</span>23<span
                    class="text-sm mx-1"
                    >S</span
                  >
                </div>
              </div>
              <div class="stat">
                <div class="stat-desc">大小</div>
                <div class="stat-value">
                  12<span class="text-sm ml-1">MB</span>
                </div>
              </div>
            </div>
            <div class="grow"></div>
          </div>
          <div class="flex">
            <div class="stats shadow">
              <div class="flex flex-col justify-center items-center p-3">
                <SvgIcon
                  class="mb-2"
                  :icon-set="featureIcon(DiaryFeature.Video).set"
                  :path="featureIcon(DiaryFeature.Video).path"
                  :size="24"
                ></SvgIcon>
                <div class="text-primary">
                  {{ featureText(DiaryFeature.Video, la) }}
                </div>
              </div>
              <div class="stat">
                <div class="stat-desc">檔案個數</div>
                <div class="stat-value">32</div>
              </div>
              <div class="stat">
                <div class="stat-desc">長度</div>
                <div class="stat-value">
                  1<span class="text-sm mx-1">H</span>23<span
                    class="text-sm mx-1"
                    >M</span
                  >45<span class="text-sm mx-1">S</span>
                </div>
              </div>
              <div class="stat">
                <div class="stat-desc">大小</div>
                <div class="stat-value">
                  1234<span class="text-sm ml-1">MB</span>
                </div>
              </div>
            </div>
            <div class="grow"></div>
          </div>
          <div class="flex">
            <div class="stats shadow">
              <div class="flex flex-col justify-center items-center p-3">
                <SvgIcon
                  class="mb-2"
                  icon-set="mdi"
                  :path="mdiFileMultipleOutline"
                  :size="20"
                ></SvgIcon>
                <div class="text-primary">
                  {{ la.t(".dataPanel.others") }}
                </div>
              </div>
              <div class="stat">
                <div class="stat-desc">大小</div>
                <div class="stat-value">
                  1234<span class="text-sm ml-1">MB</span>
                </div>
              </div>
            </div>
            <div class="grow"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="cell-block mt-6 mb-2">
      <div class="cell-title">
        {{ la.t(".dataPanel.operation") }}
      </div>
      <div class="flex justify-center items-center p-5">
        <button class="mr-2 btn btn-primary btn-outline">
          <SvgIcon
            class="mr-2"
            icon-set="mdi"
            :path="mdiTrayArrowUp"
            :size="16"
          ></SvgIcon>
          {{ la.t("app.action.export") }}
          <span class="ml-3 hotkey-mark">3</span>
        </button>
        <button class="btn btn-error btn-outline">
          <SvgIcon
            class="mr-2"
            icon-set="mdi"
            :path="mdiDeleteForever"
            :size="16"
          ></SvgIcon>
          {{ la.t("app.action.delete") }}
          <span class="ml-3 hotkey-mark">4</span>
        </button>
      </div>
    </div>
  </div>
</template>
