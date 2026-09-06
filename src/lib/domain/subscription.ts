/**
 * PRD §16 — not part of the MVP. Types only, so the shape is reserved and
 * nothing downstream (Order, Product) needs to be reworked when this ships.
 */
export type SubscriptionPlanTier = "FAN" | "COLLECTOR" | "INNER_CIRCLE";

export interface SubscriptionBenefit {
  kind: "DIGITAL_CONTENT" | "DISCOUNT" | "EARLY_ACCESS" | "ARTIFACT" | "PHYSICAL_DROP";
  description: string;
}

export interface SubscriptionPlan {
  tier: SubscriptionPlanTier;
  name: string;
  priceMonthly: number;
  benefits: SubscriptionBenefit[];
}

export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export interface Subscription {
  id: string;
  customerId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startedAt: string;
}
