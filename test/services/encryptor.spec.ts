import { describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import { genKey, encrypt, decrypt } from "~/services/encryptor";

describe("encryptor", () => {
  it("handles encryption", async () => {
    const keyInfo = await genKey();
    const rawData = faker.lorem.sentence();
    const encryptedData = await encrypt(keyInfo.k as string, rawData);
    const decryptedData = await decrypt(keyInfo.k as string, encryptedData);
    expect(rawData).toEqual(decryptedData);
  });
});
