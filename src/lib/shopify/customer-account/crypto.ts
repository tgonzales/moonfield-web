import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * AES-256-GCM encryption for cookie payloads (the OAuth session and the
 * short-lived PKCE state — see session.ts). No session data ever touches
 * the DB; everything lives in an encrypted, httpOnly cookie, so this is the
 * only thing standing between the cookie and a readable access token.
 *
 * AUTH_SESSION_SECRET must be a base64-encoded 32-byte key, e.g.:
 *   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
 */
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is not configured.");
  }
  const key = Buffer.from(secret, "base64");
  if (key.length !== 32) {
    throw new Error("AUTH_SESSION_SECRET must decode to exactly 32 bytes (base64).");
  }
  return key;
}

function toBase64Url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function encryptJson(payload: unknown): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf-8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return toBase64Url(Buffer.concat([iv, tag, ciphertext]));
}

/** Returns null on any failure (tampered/expired-key/malformed cookie) rather than throwing — callers treat that as "no session". */
export function decryptJson<T>(value: string): T | null {
  try {
    const key = getKey();
    const buf = Buffer.from(value, "base64url");
    const iv = buf.subarray(0, IV_LENGTH);
    const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(plaintext.toString("utf-8")) as T;
  } catch {
    return null;
  }
}
