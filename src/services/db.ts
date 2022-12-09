import { RandomToken } from "@sibevin/random-token";

export const UID_RANDOM_SIZE = 16;

export function genUid(): string {
  const nowDt = new Date();
  const ts = nowDt.toISOString().replace(/[^\d]/g, "");
  return `${ts}${RandomToken.gen({ length: UID_RANDOM_SIZE })}`;
}
