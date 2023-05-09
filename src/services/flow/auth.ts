import { useRouter } from "vue-router";
import { useEscortState } from "~/states/useEscortState";
import { useAppState } from "~/states/useAppState";
import { AppError } from "~/models/app/error";

export async function initEsState(): Promise<void> {
  const router = useRouter();
  const esState = useEscortState();
  const appState = useAppState();
  try {
    await esState.init(appState.config.value);
  } catch (err) {
    router.push({ name: "error", query: { err: "unknown", data: err.stack } });
  }
}

export async function dispatchEntry(): Promise<void> {
  const router = useRouter();
  const esState = useEscortState();
  console.log("start dispatch");

  try {
    if ((await esState.authenticate()).gain) {
      router.push({ name: "diaries" });
    }
  } catch (err) {
    if (err instanceof AppError) {
      console.log("es init", err);
    } else {
      router.push({
        name: "error",
        query: { err: "unknown", data: err.stack },
      });
    }
  }
}

export async function dispatchAuth(): Promise<void> {
  const router = useRouter();
  const esState = useEscortState();

  try {
    if (!(await esState.authenticate()).gain) {
      router.push({ name: "entry", query: { reason: "login" } });
    }
  } catch (err) {
    router.push({ name: "error", query: { err: "unknown" } });
  }
}
