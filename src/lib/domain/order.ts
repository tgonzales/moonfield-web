import type { FulfillmentStatus } from "./fulfillment";
import type { FulfillmentProviderId } from "./product";

/**
 * PRD §21 — an Order is not 1:1 with a single fulfillment. Each line item
 * is routed independently (a CD via elasticStage, a t-shirt via local
 * fulfillment, a digital artifact via instant digital delivery, in the
 * same order). Never assume a single provider per order.
 */
export interface OrderLineItem {
  id: string;
  productHandle: string;
  variantId: string;
  title: string;
  quantity: number;
  fulfillmentProviderId: FulfillmentProviderId;
  fulfillmentStatus: FulfillmentStatus;
}

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";

export interface Order {
  id: string;
  shopifyOrderId: string;
  orderNumber: string;
  customerEmail: string;
  status: OrderStatus;
  lineItems: OrderLineItem[];
  createdAt: string;
}
