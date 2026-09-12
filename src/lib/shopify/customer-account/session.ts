import "server-only";
import { cookies } from "next/headers";
import { decryptJson, encryptJson } from "./crypto";

const PENDING_COOKIE = "moonfield_auth_pending";
const SESSION_COOKIE = "moonfield_session";

export interface PendingAuth {
  state: string;
  codeVerifier: string;
  nonce: string;
  /** Path to send the customer back to once login completes. */
  returnTo: string;
}

export interface CustomerSession {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  /** Epoch ms. */
  expiresAt: number;
  customerId: string;
  email: string;
}

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function setPendingAuth(pending: PendingAuth): Promise<void> {
  (await cookies()).set(PENDING_COOKIE, encryptJson(pending), {
    ...cookieBase,
    maxAge: 60 * 10, // 10 minutes — just long enough for the Shopify login round trip
  });
}

/** Reads and immediately clears the pending-auth cookie — it's single-use, only for the callback step. */
export async function getAndClearPendingAuth(): Promise<PendingAuth | null> {
  const store = await cookies();
  const raw = store.get(PENDING_COOKIE)?.value;
  store.delete(PENDING_COOKIE);
  if (!raw) return null;
  return decryptJson<PendingAuth>(raw);
}

export async function setCustomerSession(session: CustomerSession): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, encryptJson(session), {
    ...cookieBase,
    // Cookie itself lives as long as the refresh token could plausibly still work;
    // getCustomerSession() below is what actually enforces expiresAt.
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCustomerSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * Read-only — intentionally does NOT refresh an expired token, because
 * Next.js only allows setting cookies from a Server Action or Route
 * Handler, never during a Server Component render. An expired session
 * reads as logged-out here; refreshCustomerSession() below is for call
 * sites (route handlers) that can actually persist the refreshed cookie.
 */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const session = decryptJson<CustomerSession>(raw);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) return null;
  return session;
}
