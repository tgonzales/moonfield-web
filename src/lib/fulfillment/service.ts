import type {
  FulfillmentAdapter,
  FulfillmentProviderId,
  FulfillmentRequest,
  FulfillmentResult,
} from "@/lib/domain";
import { DigitalDeliveryAdapter } from "./adapters/digital-delivery.adapter";
import { ElasticStageAdapter } from "./adapters/elastic-stage.adapter";
import { LocalProviderAdapter } from "./adapters/local.adapter";

/**
 * PRD §8, §21 — the only entry point anything outside this folder should
 * use. An order's line items are grouped by provider and dispatched to the
 * matching adapter; callers never import an adapter directly.
 */
class FulfillmentService {
  private adapters = new Map<FulfillmentProviderId, FulfillmentAdapter>([
    ["DIGITAL", new DigitalDeliveryAdapter()],
    ["LOCAL", new LocalProviderAdapter()],
    ["ELASTICSTAGE", new ElasticStageAdapter()],
  ]);

  private adapterFor(providerId: FulfillmentProviderId): FulfillmentAdapter {
    const adapter = this.adapters.get(providerId);
    if (!adapter) {
      throw new Error(`No fulfillment adapter registered for provider "${providerId}".`);
    }
    return adapter;
  }

  /**
   * Splits a request by provider and submits each group independently — an
   * order may span providers (e.g. a CD line via ELASTICSTAGE alongside a
   * digital track via DIGITAL in the same order), so one provider's
   * failure must never prevent the others from being processed. Uses
   * allSettled (not all) for exactly that reason — a rejected provider is
   * normalized into a FAILED result rather than aborting the whole call.
   */
  async submitOrder(request: FulfillmentRequest): Promise<FulfillmentResult[]> {
    const byProvider = new Map<FulfillmentProviderId, typeof request.lines>();
    for (const line of request.lines) {
      const group = byProvider.get(line.providerId) ?? [];
      group.push(line);
      byProvider.set(line.providerId, group);
    }

    const entries = Array.from(byProvider.entries());
    const settled = await Promise.allSettled(
      entries.map(([providerId, lines]) => this.adapterFor(providerId).submitOrder({ ...request, lines })),
    );

    return settled.map((result, i) => {
      if (result.status === "fulfilled") return result.value;
      const [providerId] = entries[i];
      console.error(`[fulfillment] provider "${providerId}" failed for order ${request.orderId}:`, result.reason);
      return { providerId, status: "FAILED" };
    });
  }

  async getStatus(
    providerId: FulfillmentProviderId,
    externalReference: string,
  ): Promise<FulfillmentResult> {
    return this.adapterFor(providerId).getStatus(externalReference);
  }
}

export const fulfillmentService = new FulfillmentService();
