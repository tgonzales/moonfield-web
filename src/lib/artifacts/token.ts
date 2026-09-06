import { randomBytes } from "node:crypto";

/**
 * PRD §12, §25 — tokens must be unique, non-sequential, large enough to be
 * unguessable, and safe to print on a physical card (no ambiguous glyphs).
 * Crockford's base32 alphabet minus easily-confused characters (I, L, O, U).
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const TOKEN_LENGTH = 10;

export function generateArtifactToken(): string {
  const bytes = randomBytes(TOKEN_LENGTH);
  let token = "";
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    token += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return token;
}

/** Format check only — never assume a syntactically valid token exists (PRD §25: rate-limit lookups). */
export function isPlausibleArtifactToken(value: string): boolean {
  return new RegExp(`^[${ALPHABET}]{${TOKEN_LENGTH}}$`).test(value);
}

export function artifactUrl(token: string): string {
  return `/a/${token}`;
}
