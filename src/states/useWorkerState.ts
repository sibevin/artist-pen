import { createGlobalState } from "@vueuse/core";
import * as Comlink from "comlink";
import { WorkerType as AttachmentWorkerType } from "~/workers/attachmentWorker";
import { WorkerType as SoundWorkerType } from "~/workers/soundWorker";

export const useWorkerState = createGlobalState(() => {
  const attachment = Comlink.wrap<AttachmentWorkerType>(
    new Worker(new URL("~/workers/attachmentWorker.ts", import.meta.url), {
      type: "module",
    })
  );

  const sound = Comlink.wrap<SoundWorkerType>(
    new Worker(new URL("~/workers/soundWorker.ts", import.meta.url), {
      type: "module",
    })
  );
  return {
    attachment,
    sound,
  };
});
