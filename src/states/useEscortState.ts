import { ref } from "vue";
import { createGlobalState, useLocalStorage } from "@vueuse/core";
import { AppConfig } from "~/models/app/config";
import { AppError } from "~/models/app/error";
import { encrypt, decrypt } from "~/services/encryptor";

interface EsSessionInfo {
  authEnabled: boolean;
  expiredTs?: number;
}

const SESSION_EXPIRATION_MSECS = 10 * 60 * 1000; // 10 minutes
const ES_ENCRYPTION_KEY =
  import.meta.env.ES_ENCRYPTION_KEY ||
  "9eFXxBXhDzoXybj6BE5ALtk98pdEZEQbrxzBNDUv6A4";

export const useEscortState = createGlobalState(() => {
  const appConfig = ref<AppConfig>(new AppConfig());
  const esStorage = useLocalStorage("es_storage", "");

  async function fetchSessionInfo(): Promise<EsSessionInfo> {
    if (esStorage.value === "") {
      throw new AppError({ code: "es_storage_not_init" });
    }
    const siStr = await decryptEs(esStorage.value);
    return JSON.parse(siStr);
  }

  async function storeSessionInfo(sessionInfo: EsSessionInfo) {
    const siStr = JSON.stringify(sessionInfo);
    esStorage.value = await encryptEs(siStr);
  }

  async function encryptEs(rawData: string): Promise<string> {
    return await encrypt(ES_ENCRYPTION_KEY, rawData);
  }

  async function decryptEs(encryptedData: string): Promise<string> {
    return await decrypt(ES_ENCRYPTION_KEY, encryptedData);
  }

  async function refreshSession(): Promise<void> {
    await storeSessionInfo({
      authEnabled: true,
      expiredTs: new Date().getTime() + SESSION_EXPIRATION_MSECS,
    });
  }

  async function init(config: AppConfig): Promise<void> {
    appConfig.value = config;
    try {
      await fetchSessionInfo();
      await logout();
    } catch (err) {
      if (err instanceof AppError && err.code === "es_storage_not_init") {
        await storeSessionInfo({
          authEnabled: appConfig.value.doc.encryptedPassword !== undefined,
          expiredTs: undefined,
        });
      }
    }
  }

  async function isAuthEnabled(): Promise<boolean> {
    const sessionInfo = await fetchSessionInfo();
    return sessionInfo.authEnabled;
  }

  async function enableAuth(password: string): Promise<void> {
    if (!appConfig.value) {
      throw new AppError({ code: "es_config_not_init" });
    }
    const encryptedPassword = await encryptEs(password);
    appConfig.value.assign({ encryptedPassword });
    await appConfig.value.save();
    await logout();
  }

  async function disableAuth(password: string): Promise<void> {
    await login(password);
    appConfig.value.assign({ encryptedPassword: undefined });
    await appConfig.value.save();
    await storeSessionInfo({
      authEnabled: false,
      expiredTs: undefined,
    });
  }

  async function authenticate(): Promise<{ gain: boolean; reason: string }> {
    const sessionInfo = await fetchSessionInfo();
    if (!sessionInfo.authEnabled) {
      return { gain: true, reason: "auth_disabled" };
    }
    if (!sessionInfo.expiredTs) {
      return { gain: false, reason: "login_required" };
    }
    if (new Date(sessionInfo.expiredTs) < new Date()) {
      return { gain: false, reason: "session_expired" };
    }
    await refreshSession();
    return { gain: true, reason: "ok" };
  }

  async function login(password: string): Promise<void> {
    if (!appConfig.value) {
      throw new AppError({ code: "es_config_not_init" });
    }
    if ((await encryptEs(password)) !== appConfig.value.doc.encryptedPassword) {
      throw new AppError({ code: "es_invalid_password" });
    }
    refreshSession();
  }

  async function logout(): Promise<void> {
    const sessionInfo = await fetchSessionInfo();
    await storeSessionInfo({
      authEnabled: sessionInfo.authEnabled,
      expiredTs: undefined,
    });
  }

  return {
    init,
    enableAuth,
    disableAuth,
    isAuthEnabled,
    authenticate,
    login,
    logout,
  };
});
