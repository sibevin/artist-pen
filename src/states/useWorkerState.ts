import { createGlobalState } from "@vueuse/core";
import * as Comlink from "comlink";
import { WorkerType } from "~/workers/attachmentWorker";

export const useWorkerState = createGlobalState(() => {
  const attachment = Comlink.wrap<WorkerType>(
    new Worker(new URL("~/workers/attachmentWorker.ts", import.meta.url), {
      type: "module",
    })
  );

  return {
    attachment,
  };
});
