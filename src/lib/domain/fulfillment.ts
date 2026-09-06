import type { FulfillmentProviderId, ProductionMode } from "./product";

/**
 * PRD §7 — every physical (or digital-delivery) product is routed to a
 * provider. The storefront and checkout never talk to a provider directly;
 * they only ever see this interface, wired up by FulfillmentService
 * (see src/lib/fulfillment/service.ts).
 */
export interface FulfillmentCapability {
  productionModes: ProductionMode[];
  supportsTracking: boolean;
}

export interface FulfillmentProvider {
  id: FulfillmentProviderId;
  name: string;
  type: "PHYSICAL" | "DIGITAL";
  capabilities: FulfillmentCapability;
}

/** A single order line item, already resolved to the provider that must fulfill it. */
export interface FulfillmentRequestLine {
  orderLineItemId: string;
  productHandle: string;
  variantId: string;
  quantity: number;
  providerId: FulfillmentProviderId;
}

export interface FulfillmentRequest {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  shippingAddress?: ShippingAddress;
  lines: FulfillmentRequestLine[];
}

export interface ShippingAddress {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip: string;
  countryCode: string;
}

export type FulfillmentStatus =
  | "PENDING"
  | "IN_PRODUCTION"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "FAILED";

export interface FulfillmentResult {
  providerId: FulfillmentProviderId;
  externalReference?: string;
  status: FulfillmentStatus;
  trackingUrl?: string;
}

/**
 * The seam every fulfillment provider integration must implement.
 * Nothing upstream (Next.js pages, webhooks) should ever import a concrete
 * adapter directly — always go through FulfillmentService.
 */
export interface FulfillmentAdapter {
  provider: FulfillmentProvider;
  submitOrder(request: FulfillmentRequest): Promise<FulfillmentResult>;
  getStatus(externalReference: string): Promise<FulfillmentResult>;
}
