import "server-only";

import type { MoonfieldProduct } from "@/lib/domain";
import { storefrontFetch } from "./client";
import { mapShopifyProduct } from "./mappers";
import { GET_COLLECTION_BY_HANDLE_QUERY, GET_COLLECTIONS_QUERY } from "./queries/collections";
import {
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_PRODUCT_BY_ID_QUERY,
  GET_PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from "./queries/products";
import type { ShopifyCollection, ShopifyProduct } from "./types";

const CATALOG_REVALIDATE_SECONDS = 60;

export async function getProducts(first = 20): Promise<MoonfieldProduct<ShopifyProduct>[]> {
  const data = await storefrontFetch<{ products: { edges: { node: ShopifyProduct }[] } }>(
    GET_PRODUCTS_QUERY,
    { first },
    { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["products"] },
  );
  return data.products.edges.map((e) => mapShopifyProduct(e.node));
}

export async function getProductByHandle(
  handle: string,
): Promise<MoonfieldProduct<ShopifyProduct> | null> {
  const data = await storefrontFetch<{ product: ShopifyProduct | null }>(
    GET_PRODUCT_BY_HANDLE_QUERY,
    { handle },
    { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["products", `product:${handle}`] },
  );
  return data.product ? mapShopifyProduct(data.product) : null;
}

/** Used by the order webhook, which only receives numeric product ids — never call this from page code. */
export async function getProductByGid(
  gid: string,
): Promise<MoonfieldProduct<ShopifyProduct> | null> {
  const data = await storefrontFetch<{ node: ShopifyProduct | null }>(
    GET_PRODUCT_BY_ID_QUERY,
    { id: gid },
    { cache: "no-store" },
  );
  return data.node ? mapShopifyProduct(data.node) : null;
}

export async function searchProducts(
  query: string,
  first = 20,
): Promise<MoonfieldProduct<ShopifyProduct>[]> {
  const data = await storefrontFetch<{ products: { edges: { node: ShopifyProduct }[] } }>(
    SEARCH_PRODUCTS_QUERY,
    { query, first },
    { cache: "no-store" },
  );
  return data.products.edges.map((e) => mapShopifyProduct(e.node));
}

export async function getCollections(first = 20): Promise<ShopifyCollection[]> {
  const data = await storefrontFetch<{ collections: { edges: { node: ShopifyCollection }[] } }>(
    GET_COLLECTIONS_QUERY,
    { first },
    { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["collections"] },
  );
  return data.collections.edges.map((e) => e.node);
}

export interface CollectionWithProducts {
  collection: ShopifyCollection;
  products: MoonfieldProduct<ShopifyProduct>[];
}

export async function getCollectionByHandle(
  handle: string,
  first = 24,
): Promise<CollectionWithProducts | null> {
  const data = await storefrontFetch<{
    collection: (ShopifyCollection & { products: { edges: { node: ShopifyProduct }[] } }) | null;
  }>(
    GET_COLLECTION_BY_HANDLE_QUERY,
    { handle, first },
    { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["collections", `collection:${handle}`] },
  );

  if (!data.collection) return null;

  const { products, ...collection } = data.collection;
  return {
    collection,
    products: products.edges.map((e) => mapShopifyProduct(e.node)),
  };
}
