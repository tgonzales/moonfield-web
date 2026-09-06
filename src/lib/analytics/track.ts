import type { AnalyticsEvent } from "./events";

/**
 * No analytics provider is wired up yet. This function is the seam every
 * component should call through, so plugging in a real provider later
 * (PostHog, Segment, GA...) means editing only this file.
 */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", event.name, event.properties ?? {});
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {
    // Analytics must never break the page.
  });
}

export function trackServer(event: AnalyticsEvent): void {
  console.info("[analytics:server]", event.name, event.properties ?? {});
}
