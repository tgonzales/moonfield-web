import type { FulfillmentAdapter, FulfillmentRequest, FulfillmentResult } from "@/lib/domain";
import { FULFILLMENT_PROVIDERS } from "../providers";

/**
 * Stock merchandise packed and shipped by Moonfield itself. No external
 * API exists yet — this just records intent so the order flow and the
 * Order/Fulfillment model can be exercised end to end before a real
 * warehouse process is wired up.
 */
export class LocalProviderAdapter implements FulfillmentAdapter {
  provider = FULFILLMENT_PROVIDERS.LOCAL;

  async submitOrder(request: FulfillmentRequest): Promise<FulfillmentResult> {
    return {
      providerId: this.provider.id,
      externalReference: `local:${request.orderId}`,
      status: "PENDING",
    };
  }

  async getStatus(externalReference: string): Promise<FulfillmentResult> {
    return { providerId: this.provider.id, externalReference, status: "PENDING" };
  }
}
