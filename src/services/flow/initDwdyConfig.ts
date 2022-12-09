import { useRouter } from "vue-router";
import { DwdyConfig } from "~/models/dwdy/config";
import { useDwdyState } from "~/states/useDwdyState";

export async function initDwdyConfig(): Promise<void> {
  const router = useRouter();
  const dwdyState = useDwdyState();
  let dwdyConfig;
  try {
    dwdyConfig = await DwdyConfig.fetchCurrentConfig();
    if (!dwdyConfig) {
      const createdCc = new DwdyConfig();
      dwdyConfig = (await createdCc.save()).target;
    }
    dwdyState.config.value = dwdyConfig;
  } catch (err) {
    router.push({ name: "error", query: { err: "init_dwdy_config_failed" } });
  }
}
