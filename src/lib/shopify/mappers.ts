import type {
  FulfillmentProviderId,
  MoonfieldProduct,
  ProductStatus,
  ProductType,
  ProductionMode,
} from "@/lib/domain";
import type { ShopifyMetafield, ShopifyProduct } from "./types";

function readMetafield(
  metafields: (ShopifyMetafield | null)[],
  key: string,
): string | undefined {
  return metafields.find((m) => m?.key === key)?.value ?? undefined;
}

const PRODUCT_TYPES: ProductType[] = ["DIGITAL", "PHYSICAL", "ARTIFACT", "COLLECTOR", "BUNDLE"];
const FULFILLMENT_PROVIDERS: FulfillmentProviderId[] = [
  "LOCAL",
  "ELASTICSTAGE",
  "PRINT_PROVIDER",
  "NIX_INTERNAL",
  "DIGITAL",
];

/**
 * Turns a raw Shopify product into Moonfield's own product envelope
 * (PRD §6-7). Metafields are optional — a store that hasn't configured
 * them yet still gets a usable, sensibly-defaulted product.
 */
export function mapShopifyProduct(product: ShopifyProduct): MoonfieldProduct<ShopifyProduct> {
  const metafields = product.metafields ?? [];

  const rawProductType = readMetafield(metafields, "product_type")?.toUpperCase();
  const productType: ProductType = PRODUCT_TYPES.includes(rawProductType as ProductType)
    ? (rawProductType as ProductType)
    : "PHYSICAL";

  const rawProvider = readMetafield(metafields, "fulfillment_provider")?.toUpperCase();
  const fulfillmentProviderId: FulfillmentProviderId = FULFILLMENT_PROVIDERS.includes(
    rawProvider as FulfillmentProviderId,
  )
    ? (rawProvider as FulfillmentProviderId)
    : productType === "DIGITAL" || productType === "ARTIFACT"
      ? "DIGITAL"
      : "LOCAL";

  const productionMode: ProductionMode =
    readMetafield(metafields, "production_mode")?.toUpperCase() === "ON_DEMAND"
      ? "ON_DEMAND"
      : "STOCK";

  const status: ProductStatus = !product.availableForSale
    ? "SOLD_OUT"
    : readMetafield(metafields, "preorder_start")
      ? "PREORDER"
      : "AVAILABLE";

  const limitedEditionTotal = readMetafield(metafields, "limited_edition_total");
  const bundleItemHandles = readMetafield(metafields, "bundle_item_handles");

  return {
    handle: product.handle,
    productType,
    status,
    fulfillmentProviderId,
    productionMode,
    artistHandle: readMetafield(metafields, "artist_handle"),
    releaseHandle: readMetafield(metafields, "release_handle"),
    artifactCampaign: readMetafield(metafields, "artifact_campaign"),
    limitedEdition: limitedEditionTotal
      ? { enabled: true, totalQuantity: Number(limitedEditionTotal), scope: "GLOBAL" }
      : undefined,
    preorder: readMetafield(metafields, "preorder_start")
      ? {
          releaseDate: readMetafield(metafields, "preorder_release_date"),
          expectedShipping: readMetafield(metafields, "preorder_expected_shipping"),
          preorderStart: readMetafield(metafields, "preorder_start"),
          preorderEnd: readMetafield(metafields, "preorder_end"),
        }
      : undefined,
    bundleItemHandles: bundleItemHandles ? bundleItemHandles.split(",").map((h) => h.trim()) : undefined,
    raw: product,
  };
}
