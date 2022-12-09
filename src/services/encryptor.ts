import * as jose from "jose";

const JWE_ALG = "A256KW";
const JWE_ENC = "A256GCM";

export async function genKey(): Promise<jose.JWK> {
  const key = await jose.generateSecret(JWE_ALG, {
    extractable: true,
  });
  return await jose.exportJWK(key);
}

export async function encrypt(k: string, data: string): Promise<string> {
  const jwk = { k, kty: "oct" };
  const key = await jose.importJWK(jwk, JWE_ALG);
  return await new jose.CompactEncrypt(new TextEncoder().encode(data))
    .setProtectedHeader({ alg: JWE_ALG, enc: JWE_ENC })
    .encrypt(key);
}

export async function decrypt(k: string, data: string): Promise<string> {
  const jwk = { k, kty: "oct" };
  const key = await jose.importJWK(jwk, JWE_ALG);
  const { plaintext } = await jose.compactDecrypt(data, key);
  return new TextDecoder().decode(plaintext);
}
