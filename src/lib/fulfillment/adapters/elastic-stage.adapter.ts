import type { FulfillmentAdapter, FulfillmentRequest, FulfillmentResult } from "@/lib/domain";
import { FULFILLMENT_PROVIDERS } from "../providers";

/**
 * PRD §8 — CD/Vinyl physical-on-demand via elasticStage. No API credentials
 * exist yet, so this adapter only defines the contract (submitOrder /
 * getStatus) FulfillmentService expects; swap the method bodies for real
 * HTTP calls once elasticStage access is available. Keeping the adapter
 * boundary here means nothing else in the codebase needs to change then.
 */
export class ElasticStageAdapter implements FulfillmentAdapter {
  provider = FULFILLMENT_PROVIDERS.ELASTICSTAGE;

  async submitOrder(request: FulfillmentRequest): Promise<FulfillmentResult> {
    throw new Error(
      `ElasticStageAdapter is not connected yet (order ${request.orderId}). ` +
        "Configure elasticStage API credentials and implement submitOrder().",
    );
  }

  async getStatus(externalReference: string): Promise<FulfillmentResult> {
    throw new Error(
      `ElasticStageAdapter is not connected yet (reference ${externalReference}).`,
    );
  }
}
