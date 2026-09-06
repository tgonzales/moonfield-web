import type { FulfillmentAdapter, FulfillmentRequest, FulfillmentResult } from "@/lib/domain";
import { FULFILLMENT_PROVIDERS } from "../providers";

/**
 * Digital products (albums, artifacts) don't need "shipping" — they're
 * considered delivered the moment the order is paid. Real delivery
 * mechanics (unlock links, artifact activation) are handled by the order
 * webhook, not here; this adapter just reports the terminal status.
 */
export class DigitalDeliveryAdapter implements FulfillmentAdapter {
  provider = FULFILLMENT_PROVIDERS.DIGITAL;

  async submitOrder(request: FulfillmentRequest): Promise<FulfillmentResult> {
    return {
      providerId: this.provider.id,
      externalReference: `digital:${request.orderId}`,
      status: "DELIVERED",
    };
  }

  async getStatus(): Promise<FulfillmentResult> {
    return { providerId: this.provider.id, status: "DELIVERED" };
  }
}
