/**
 * Shopify Customer Account API config (headless login — replaces the
 * earlier Better Auth plan in docs/database-schema.md, see 2026-09-12
 * update there). Auth is entirely delegated to Shopify: OAuth 2.0 + PKCE
 * against a confidential client registered in Shopify Admin under
 * Sales channels > Headless > (your storefront) > Customer Account API
 * settings. No password, no email sending on our side for login.
 *
 * The Authorization/Token/Logout endpoint URLs are NOT constructed here —
 * Shopify's own setup guide has you copy them directly from that admin
 * screen (they're not a documented, stable URL template), so they're
 * plain env vars. The GraphQL API endpoint is the one thing we discover
 * dynamically via `/.well-known/customer-account-api` — confirmed by hand
 * (curl) that this lives on the store's own domain (SHOPIFY_STORE_DOMAIN,
 * e.g. your-store.myshopify.com), NOT on the shopify.com/authentication/
 * <shop_id> OAuth issuer domain the Authorization/Token URLs use. The two
 * domains are unrelated; don't try to derive one from the other. Keeping
 * this dynamic (rather than hardcoding a GraphQL URL) is what keeps the
 * API version current automatically.
 */
export interface CustomerAccountConfig {
  clientId: string;
  /** Confidential clients only — sent as HTTP Basic auth on token requests, never in a body/query param. */
  clientSecret: string | undefined;
  authorizeUrl: string;
  tokenUrl: string;
  logoutUrl: string | undefined;
}

export function getCustomerAccountConfig(): CustomerAccountConfig {
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;
  const authorizeUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_AUTHORIZE_URL;
  const tokenUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL;
  const logoutUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_URL;

  if (!clientId || !authorizeUrl || !tokenUrl) {
    throw new Error(
      "Customer Account API is not configured — set SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID, " +
        "SHOPIFY_CUSTOMER_ACCOUNT_AUTHORIZE_URL and SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL " +
        "(copied from Shopify Admin > Sales channels > Headless > Customer Account API settings).",
    );
  }

  return { clientId, clientSecret, authorizeUrl, tokenUrl, logoutUrl };
}

let cachedGraphqlApiUrl: { url: string; expiresAt: number } | null = null;

/** Cached in-memory for an hour — this only changes if Shopify rotates API versions. */
export async function getCustomerAccountGraphqlUrl(): Promise<string> {
  if (cachedGraphqlApiUrl && cachedGraphqlApiUrl.expiresAt > Date.now()) {
    return cachedGraphqlApiUrl.url;
  }

  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!storeDomain) {
    throw new Error("SHOPIFY_STORE_DOMAIN is not configured — needed to discover the Customer Account GraphQL endpoint.");
  }
  const res = await fetch(`https://${storeDomain}/.well-known/customer-account-api`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to discover Customer Account API endpoint (${res.status}).`);
  }
  const data = (await res.json()) as { graphql_api?: string };
  if (!data.graphql_api) {
    throw new Error("Customer Account API discovery response had no graphql_api field.");
  }

  cachedGraphqlApiUrl = { url: data.graphql_api, expiresAt: Date.now() + 60 * 60 * 1000 };
  return data.graphql_api;
}
