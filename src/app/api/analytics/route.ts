import { NextResponse } from "next/server";
import { trackServer } from "@/lib/analytics/track";
import type { AnalyticsEvent } from "@/lib/analytics/events";

export async function POST(request: Request) {
  const event = (await request.json()) as AnalyticsEvent;
  trackServer(event);
  return NextResponse.json({ ok: true });
}
