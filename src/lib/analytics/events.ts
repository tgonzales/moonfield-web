/** PRD §23 — the base event vocabulary. Extend, don't rename, once anything ships to a real provider. */
export type AnalyticsEventName =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "purchase"
  | "artifact_scan"
  | "artifact_first_access"
  | "artifact_play"
  | "preorder"
  | "subscription_started";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | undefined>;
}
