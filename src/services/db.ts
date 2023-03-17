import { RandomToken } from "@sibevin/random-token";

export const UID_RANDOM_SIZE = 16;

export function genUid(): string {
  const nowDt = new Date();
  const ts = nowDt.toISOString().replace(/[^\d]/g, "");
  return `${ts}${RandomToken.gen({ length: UID_RANDOM_SIZE })}`;
}

export function normalizeObject(
  target: any,
  options: { except?: string[] } = {}
): any {
  const targetObj: any = Object.assign({}, target);
  const keepObj: any = {};
  if (options.except) {
    options.except.forEach((excepField) => {
      keepObj[excepField] = target[excepField];
      delete targetObj[excepField];
    });
  }
  const normalizedObj = JSON.parse(JSON.stringify(targetObj));
  return Object.assign(normalizedObj, keepObj);
}
