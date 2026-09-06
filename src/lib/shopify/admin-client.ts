/**
 * Shopify Admin API (GraphQL) client. Only ever used from scripts/*.ts
 * (catalog population) — the storefront app talks to Shopify exclusively
 * through the Storefront API (see client.ts). Never import this from a
 * page or route handler.
 *
 * No `server-only` guard: this module is imported directly by the
 * plain-Node scripts in /scripts, which `server-only` would break.
 */
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";
const token = process.env.SHOPIFY_ADMIN_API_TOKEN;

export const isShopifyAdminConfigured = Boolean(domain && token);

export class ShopifyAdminError extends Error {
  constructor(
    message: string,
    public readonly errors?: unknown,
  ) {
    super(message);
    this.name = "ShopifyAdminError";
  }
}

export async function adminGraphQL<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  if (!isShopifyAdminConfigured) {
    throw new ShopifyAdminError(
      "Shopify Admin API is not configured (missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_API_TOKEN).",
    );
  }

  const res = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token as string,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new ShopifyAdminError(`Shopify Admin API request failed: ${res.status}`, json.errors);
  }

  return json.data as TData;
}
