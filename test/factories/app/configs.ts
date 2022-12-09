import { random as randomLocale } from "../locale";
import { random as randomTimeZone } from "../timeZone";
import { random as randomTheme } from "../theme";
import { prepareModelFactory } from "../factoryUtils";
import {
  AppConfigAttrs,
  AppConfigParams,
  AppConfig,
} from "~/models/app/config";

export function buildAttrs(givenAttrs: AppConfigParams = {}): AppConfigAttrs {
  return Object.assign(
    {
      locale: randomLocale(),
      timeZone: randomTimeZone(),
      theme: randomTheme(),
    },
    givenAttrs
  );
}

export const { build, create } = prepareModelFactory<
  AppConfig,
  AppConfigParams
>(buildAttrs, (attrs) => {
  return new AppConfig(attrs);
});
