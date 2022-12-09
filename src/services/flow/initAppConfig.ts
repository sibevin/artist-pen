import { useRouter } from "vue-router";
import { AppConfig } from "~/models/app/config";
import { useAppState } from "~/states/useAppState";
import { detectLocalLocale, initLocale } from "~/services/locale";
import { detectLocalTimeZone } from "~/services/timeZone";

export async function initAppConfig(): Promise<void> {
  const router = useRouter();
  const appState = useAppState();
  let appConfig;
  try {
    appConfig = await AppConfig.fetchCurrentConfig();
    if (!appConfig) {
      const createdCc = new AppConfig({
        locale: detectLocalLocale(),
        timeZone: detectLocalTimeZone(),
      });
      appConfig = (await createdCc.save()).target;
    }
    await initLocale(appConfig.doc.locale);
    appState.config.value = appConfig;
  } catch (err) {
    router.push({ name: "error", query: { err: "init_app_config_failed" } });
  }
}
