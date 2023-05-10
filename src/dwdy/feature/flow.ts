import { DiaryFeature, DiaryFeatureFlow } from "~/dwdy/feature/def";
import { FEATURE_FLOW as TEXT_FEATURE_FLOW } from "~/dwdy/feature/text/flow";
import { FEATURE_FLOW as IMAGE_FEATURE_FLOW } from "~/dwdy/feature/image/flow";
import { FEATURE_FLOW as SOUND_FEATURE_FLOW } from "~/dwdy/feature/sound/flow";
import { FEATURE_FLOW as TAG_FEATURE_FLOW } from "~/dwdy/feature/tag/flow";

const DEFAULT_FLOW: DiaryFeatureFlow = {};

const FEATURE_FLOW_MAP: Record<DiaryFeature, DiaryFeatureFlow> = {
  [DiaryFeature.Text]: TEXT_FEATURE_FLOW,
  [DiaryFeature.Image]: IMAGE_FEATURE_FLOW,
  [DiaryFeature.Sound]: SOUND_FEATURE_FLOW,
  [DiaryFeature.Tag]: TAG_FEATURE_FLOW,
  [DiaryFeature.Sticker]: DEFAULT_FLOW,
};

export function featureFlow(feature: DiaryFeature): DiaryFeatureFlow {
  return FEATURE_FLOW_MAP[feature] || DEFAULT_FLOW;
}
