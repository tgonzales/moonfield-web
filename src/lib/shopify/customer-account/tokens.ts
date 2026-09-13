import { getCustomerAccountConfig } from "./config";

interface TokenResponse {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in: number;
}

async function postToken(body: URLSearchParams): Promise<TokenResponse> {
  const { tokenUrl, clientId, clientSecret } = getCustomerAccountConfig();
  const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
  // Confidential client: authenticate via HTTP Basic, never as a body/query param.
  if (clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  }

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Customer Account token request failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

/** Authorization code -> tokens (the callback step). */
export async function exchangeCodeForTokens(input: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<TokenResponse> {
  const { clientId } = getCustomerAccountConfig();
  return postToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: input.redirectUri,
      code: input.code,
      code_verifier: input.codeVerifier,
    }),
  );
}

/**
 * Refresh -> a new access token. Only headless/Hydrogen (confidential)
 * clients get a refresh_token in the first place — if the session has
 * none, there's nothing to refresh; the caller should treat that as
 * "session over, log in again."
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const { clientId } = getCustomerAccountConfig();
  return postToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: refreshToken,
    }),
  );
}
