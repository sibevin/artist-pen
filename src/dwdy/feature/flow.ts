import { DiaryFeature, DiaryFeatureFlow } from "~/dwdy/feature/def";
import { FEATURE_FLOW as TEXT_FEATURE_FLOW } from "~/dwdy/feature/text/flow";
import { FEATURE_FLOW as IMAGE_FEATURE_FLOW } from "~/dwdy/feature/image/flow";
import { FEATURE_FLOW as SOUND_FEATURE_FLOW } from "~/dwdy/feature/sound/flow";

const DEFAULT_FLOW: DiaryFeatureFlow = {
  creation: {},
  deletion: {},
};

const CUSTOMIZED_CREATION_FLOW: DiaryFeatureFlow = {
  creation: {
    customized: true,
  },
  deletion: {},
};

const FEATURE_FLOW_MAP: Record<DiaryFeature, DiaryFeatureFlow> = {
  [DiaryFeature.Text]: TEXT_FEATURE_FLOW,
  [DiaryFeature.Image]: IMAGE_FEATURE_FLOW,
  [DiaryFeature.Illustration]: DEFAULT_FLOW,
  [DiaryFeature.Sound]: SOUND_FEATURE_FLOW,
  [DiaryFeature.Video]: DEFAULT_FLOW,
  [DiaryFeature.Sticker]: CUSTOMIZED_CREATION_FLOW,
  [DiaryFeature.Tag]: CUSTOMIZED_CREATION_FLOW,
  [DiaryFeature.Location]: DEFAULT_FLOW,
  [DiaryFeature.TodoList]: DEFAULT_FLOW,
  [DiaryFeature.DataList]: DEFAULT_FLOW,
  [DiaryFeature.File]: DEFAULT_FLOW,
};

export function featureFlow(feature: DiaryFeature): DiaryFeatureFlow {
  return FEATURE_FLOW_MAP[feature] || DEFAULT_FLOW;
}
