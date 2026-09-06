/**
 * Product taxonomy — PRD §6.
 *
 * This is Moonfield's own conceptual layer on top of a Shopify product.
 * Shopify only knows "a product with variants"; Moonfield needs to know
 * *what kind* of thing it is sold as, so the storefront and the fulfillment
 * layer can treat it correctly without hardcoding per-product logic.
 *
 * The mapping from a Shopify product to a `ProductType` (and the other
 * fields below) comes from Shopify metafields on the `custom` namespace
 * (see src/lib/shopify/mappers.ts). Until real metafields are configured
 * in the store, mappers fall back to sensible defaults.
 */
export type ProductType =
  | "DIGITAL"
  | "PHYSICAL"
  | "ARTIFACT"
  | "COLLECTOR"
  | "BUNDLE";

/** PRD §14 — pre-order / availability lifecycle. */
export type ProductStatus =
  | "AVAILABLE"
  | "PREORDER"
  | "SOLD_OUT"
  | "COMING_SOON"
  | "ARCHIVED";

/** PRD §7 — how a physical product actually gets made and shipped. */
export type ProductionMode = "STOCK" | "ON_DEMAND";

/** PRD §7 — id of a FulfillmentProvider a product is routed to. */
export type FulfillmentProviderId =
  | "LOCAL"
  | "ELASTICSTAGE"
  | "PRINT_PROVIDER"
  | "NIX_INTERNAL"
  | "DIGITAL";

/** PRD §15 — limited edition scoping. */
export interface LimitedEdition {
  enabled: boolean;
  totalQuantity: number;
  scope: "GLOBAL" | "VARIANT" | "CAMPAIGN";
}

/** PRD §14 — pre-order windows and expected fulfillment dates. */
export interface PreorderWindow {
  releaseDate?: string;
  expectedShipping?: string;
  preorderStart?: string;
  preorderEnd?: string;
}

/**
 * Moonfield's product envelope around a Shopify product.
 * `raw` keeps the untouched Shopify data so callers can still reach
 * variants/pricing/images without Moonfield needing to re-model all of it.
 */
export interface MoonfieldProduct<TRaw = unknown> {
  handle: string;
  productType: ProductType;
  status: ProductStatus;
  fulfillmentProviderId: FulfillmentProviderId;
  productionMode: ProductionMode;
  artistHandle?: string;
  releaseHandle?: string;
  artifactCampaign?: string;
  limitedEdition?: LimitedEdition;
  preorder?: PreorderWindow;
  /** Handles of the products bundled together, when productType === "BUNDLE". */
  bundleItemHandles?: string[];
  raw: TRaw;
}
