import { createHash, randomBytes } from "node:crypto";

/** OAuth 2.0 + PKCE (RFC 7636) parameters for the Customer Account API's authorization request. */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function generateState(): string {
  return randomBytes(16).toString("base64url");
}

export function generateNonce(): string {
  return randomBytes(16).toString("base64url");
}
