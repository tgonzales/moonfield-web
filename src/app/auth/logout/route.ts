import { NextRequest, NextResponse } from "next/server";
import { getCustomerAccountConfig } from "@/lib/shopify/customer-account/config";
import { clearCustomerSession, getCustomerSession } from "@/lib/shopify/customer-account/session";

/**
 * GET /auth/logout — always clears the local Moonfield session cookie
 * first (that part is certain), then best-effort redirects to Shopify's
 * logout endpoint if one is configured. The exact query params Shopify's
 * logout endpoint expects weren't confirmed against live docs while
 * building this (standard OIDC RP-Initiated Logout names used here:
 * id_token_hint, post_logout_redirect_uri) — verify against the actual
 * Logout endpoint URL behavior once SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_URL is
 * set, and adjust if Shopify expects something different.
 */
export async function GET(request: NextRequest) {
  const session = await getCustomerSession();
  await clearCustomerSession();

  let logoutUrl: string | undefined;
  try {
    logoutUrl = getCustomerAccountConfig().logoutUrl;
  } catch {
    // Customer Account API isn't configured at all — local cookie is already
    // cleared above, which is all logout can meaningfully do in that case.
  }
  if (!logoutUrl) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  const url = new URL(logoutUrl);
  if (session?.idToken) url.searchParams.set("id_token_hint", session.idToken);
  url.searchParams.set("post_logout_redirect_uri", request.nextUrl.origin);

  return NextResponse.redirect(url);
}
