import { DiaryFeature, DiaryFeatureComponent } from "~/dwdy/feature/def";
import { FEATURE_COMPONENT as TEXT_FEATURE_COMPONENT } from "~/dwdy/feature/text/component";
import { FEATURE_COMPONENT as IMAGE_FEATURE_COMPONENT } from "~/dwdy/feature/image/component";
import { FEATURE_COMPONENT as SOUND_FEATURE_COMPONENT } from "~/dwdy/feature/sound/component";
import { FEATURE_COMPONENT as STICKER_FEATURE_COMPONENT } from "~/dwdy/feature/sticker/component";
import { FEATURE_COMPONENT as TAG_FEATURE_COMPONENT } from "~/dwdy/feature/tag/component";

const DEFAULT_COMPONENT: DiaryFeatureComponent = {};

const FEATURE_COMPONENT_MAP: Record<DiaryFeature, DiaryFeatureComponent> = {
  [DiaryFeature.Text]: TEXT_FEATURE_COMPONENT,
  [DiaryFeature.Image]: IMAGE_FEATURE_COMPONENT,
  [DiaryFeature.Illustration]: DEFAULT_COMPONENT,
  [DiaryFeature.Sound]: SOUND_FEATURE_COMPONENT,
  [DiaryFeature.Video]: DEFAULT_COMPONENT,
  [DiaryFeature.Sticker]: STICKER_FEATURE_COMPONENT,
  [DiaryFeature.Tag]: TAG_FEATURE_COMPONENT,
  [DiaryFeature.Location]: DEFAULT_COMPONENT,
  [DiaryFeature.TodoList]: DEFAULT_COMPONENT,
  [DiaryFeature.DataList]: DEFAULT_COMPONENT,
  [DiaryFeature.File]: DEFAULT_COMPONENT,
};

export function featureComponent(
  feature: DiaryFeature,
  componentType: keyof DiaryFeatureComponent = "gallery"
) {
  const featureComponent = FEATURE_COMPONENT_MAP[feature] || DEFAULT_COMPONENT;
  return featureComponent[componentType];
}
