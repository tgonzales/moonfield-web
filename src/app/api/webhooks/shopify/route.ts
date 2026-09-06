import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getProductByGid } from "@/lib/shopify/catalog";
import { fulfillmentService } from "@/lib/fulfillment/service";
import type { FulfillmentRequestLine } from "@/lib/domain";

/**
 * PRD §22 — order/fulfillment webhooks. Must be idempotent: Shopify retries
 * on any non-2xx response (or timeout), so the same event can arrive more
 * than once.
 *
 * The dedupe set below is in-memory and per-instance only — it survives
 * retries within the same warm serverless instance but not across
 * deploys/cold starts. Replace with a persisted store (same seam as
 * src/lib/artifacts/store.ts) once Moonfield has its own database.
 */
const seenWebhookIds = new Set<string>();

function verifySignature(rawBody: string, hmacHeader: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") return false;
    console.warn("[webhooks/shopify] SHOPIFY_WEBHOOK_SECRET not set — skipping verification in dev.");
    return true;
  }
  if (!hmacHeader) return false;

  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  return a.length === b.length && timingSafeEqual(a, b);
}

interface ShopifyOrderWebhookLineItem {
  id: number;
  product_id: number | null;
  variant_id: number | null;
  title: string;
  quantity: number;
}

interface ShopifyOrderWebhookPayload {
  id: number;
  name: string;
  email: string;
  line_items: ShopifyOrderWebhookLineItem[];
}

async function handleOrderPaid(payload: ShopifyOrderWebhookPayload): Promise<void> {
  const lines: FulfillmentRequestLine[] = [];

  for (const item of payload.line_items) {
    if (!item.product_id || !item.variant_id) continue;

    const product = await getProductByGid(`gid://shopify/Product/${item.product_id}`).catch(
      () => null,
    );

    lines.push({
      orderLineItemId: String(item.id),
      productHandle: product?.handle ?? "unknown",
      variantId: `gid://shopify/ProductVariant/${item.variant_id}`,
      quantity: item.quantity,
      providerId: product?.fulfillmentProviderId ?? "LOCAL",
    });
  }

  const results = await fulfillmentService.submitOrder({
    orderId: String(payload.id),
    orderNumber: payload.name,
    customerEmail: payload.email,
    lines,
  });

  console.info(`[webhooks/shopify] order ${payload.name} routed to`, results);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

  if (!verifySignature(rawBody, hmacHeader)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const webhookId = request.headers.get("x-shopify-webhook-id");
  if (webhookId) {
    if (seenWebhookIds.has(webhookId)) {
      return NextResponse.json({ ok: true, deduped: true });
    }
    seenWebhookIds.add(webhookId);
  }

  const topic = request.headers.get("x-shopify-topic");
  const payload = JSON.parse(rawBody);

  switch (topic) {
    case "orders/paid":
      await handleOrderPaid(payload as ShopifyOrderWebhookPayload).catch((error) =>
        console.error("[webhooks/shopify] failed to process orders/paid", error),
      );
      break;
    case "orders/create":
    case "orders/cancelled":
    case "refunds/create":
    case "fulfillments/create":
    case "fulfillments/update":
      console.info(`[webhooks/shopify] received ${topic}`, { id: payload.id });
      break;
    default:
      console.info(`[webhooks/shopify] unhandled topic: ${topic}`);
  }

  return NextResponse.json({ ok: true });
}
