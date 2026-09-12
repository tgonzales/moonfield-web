import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentCustomer } from "@/lib/shopify/customer-account/client";
import { exchangeCodeForTokens } from "@/lib/shopify/customer-account/tokens";
import { getAndClearPendingAuth, setCustomerSession } from "@/lib/shopify/customer-account/session";

/** GET /auth/callback — Shopify redirects here after the customer logs in (or cancels/errors). */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const error = params.get("error");
  const code = params.get("code");
  const state = params.get("state");

  const pending = await getAndClearPendingAuth();

  if (error || !code || !state || !pending) {
    return NextResponse.redirect(new URL("/auth/error", request.nextUrl.origin));
  }
  if (state !== pending.state) {
    // Possible CSRF / stale link — never proceed on a state mismatch.
    return NextResponse.redirect(new URL("/auth/error", request.nextUrl.origin));
  }

  const redirectUri = new URL("/auth/callback", request.nextUrl.origin).toString();

  try {
    const tokens = await exchangeCodeForTokens({ code, redirectUri, codeVerifier: pending.codeVerifier });
    const customer = await fetchCurrentCustomer(tokens.access_token);

    await setCustomerSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      customerId: customer.id,
      email: customer.email,
    });

    return NextResponse.redirect(new URL(pending.returnTo || "/", request.nextUrl.origin));
  } catch (err) {
    console.error("Customer Account API callback failed:", err);
    return NextResponse.redirect(new URL("/auth/error", request.nextUrl.origin));
  }
}
