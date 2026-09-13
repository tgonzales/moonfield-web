import type { FulfillmentAdapter, FulfillmentRequest, FulfillmentResult } from "@/lib/domain";
import { FULFILLMENT_PROVIDERS } from "../providers";

/**
 * PRD §8 — CD/Vinyl physical-on-demand via elasticStage.
 *
 * elasticStage has no public API or key-based auth (confirmed 2026-09-13 —
 * their app is a Vue SPA over an internal Laravel REST surface,
 * cookie+CSRF session auth only, no docs/versioning). They've announced a
 * native Shopify integration (targeted July 2026, status unconfirmed as
 * live or not) — check that before building anything here. Automating
 * against their internal endpoints was deliberately ruled out: no
 * contract/versioning, hostile to programmatic auth, and real risk of
 * account suspension on a store that's already selling.
 *
 * Interim decision: CD/Vinyl orders are fulfilled MANUALLY. This adapter
 * just marks the line PENDING (visible on the order in Shopify Admin,
 * which is the queue for now) rather than throwing — a throw here used to
 * abort FulfillmentService.submitOrder's Promise.all for the ENTIRE order,
 * including unrelated line items (e.g. a digital track in the same cart).
 * Swap submitOrder/getStatus for real HTTP calls once elasticStage access
 * exists (their own API, or once/if their Shopify app ships) — nothing
 * else in the codebase needs to change then, that's what this adapter
 * boundary is for.
 */
export class ElasticStageAdapter implements FulfillmentAdapter {
  provider = FULFILLMENT_PROVIDERS.ELASTICSTAGE;

  async submitOrder(request: FulfillmentRequest): Promise<FulfillmentResult> {
    console.warn(
      `[elastic-stage] order ${request.orderNumber} (${request.orderId}) needs MANUAL fulfillment — ` +
        "place it by hand on elasticStage's own store using this order's shipping info.",
    );
    return { providerId: this.provider.id, status: "PENDING" };
  }

  async getStatus(externalReference: string): Promise<FulfillmentResult> {
    console.warn(`[elastic-stage] getStatus(${externalReference}) — no automated status tracking yet, check manually.`);
    return { providerId: this.provider.id, status: "PENDING" };
  }
}
