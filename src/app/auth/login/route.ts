import { NextRequest, NextResponse } from "next/server";
import { getCustomerAccountConfig } from "@/lib/shopify/customer-account/config";
import { generateCodeChallenge, generateCodeVerifier, generateNonce, generateState } from "@/lib/shopify/customer-account/pkce";
import { setPendingAuth } from "@/lib/shopify/customer-account/session";

/**
 * GET /auth/login[?returnTo=/some/path] — starts the Shopify Customer
 * Account API login. No form here: this just redirects to Shopify's
 * hosted (passwordless) login page.
 */
export async function GET(request: NextRequest) {
  let clientId: string, authorizeUrl: string;
  try {
    ({ clientId, authorizeUrl } = getCustomerAccountConfig());
  } catch (err) {
    console.error("Customer Account API is not configured:", err);
    return NextResponse.redirect(new URL("/auth/error", request.nextUrl.origin));
  }

  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/";
  const codeVerifier = generateCodeVerifier();
  const state = generateState();
  const nonce = generateNonce();

  await setPendingAuth({ state, codeVerifier, nonce, returnTo });

  const redirectUri = new URL("/auth/callback", request.nextUrl.origin).toString();
  const url = new URL(authorizeUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", generateCodeChallenge(codeVerifier));
  url.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(url);
}
