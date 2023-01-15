import { AppConfig } from "~/models/app/config";

onmessage = async function (e) {
  console.log("worker: onmessage", e);
  const appConfig = await AppConfig.fetchCurrentConfig();
  postMessage({ config: appConfig });
};
