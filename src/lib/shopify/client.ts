import "server-only";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";
const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;

export class ShopifyStorefrontError extends Error {
  constructor(
    message: string,
    public readonly errors?: unknown,
  ) {
    super(message);
    this.name = "ShopifyStorefrontError";
  }
}

/** True when the store isn't configured — lets pages fall back gracefully. */
export const isShopifyConfigured = Boolean(domain && token);

interface StorefrontFetchOptions {
  cache?: RequestCache;
  /** Seconds; passed through to Next.js fetch revalidation. */
  revalidate?: number;
  tags?: string[];
}

export async function storefrontFetch<TData>(
  query: string,
  variables?: Record<string, unknown>,
  options: StorefrontFetchOptions = {},
): Promise<TData> {
  if (!isShopifyConfigured) {
    throw new ShopifyStorefrontError(
      "Shopify Storefront API is not configured (missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_API_TOKEN).",
    );
  }

  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token as string,
    },
    body: JSON.stringify({ query, variables }),
    cache: options.cache,
    next: {
      revalidate: options.revalidate,
      tags: options.tags,
    },
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new ShopifyStorefrontError(
      `Shopify Storefront API request failed: ${res.status}`,
      json.errors,
    );
  }

  return json.data as TData;
}
