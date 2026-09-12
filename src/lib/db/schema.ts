/**
 * Drizzle schema. Phase 1 (see docs/database-schema.md): Digital Artifacts
 * only, replacing src/data/artifacts.dev.json (which does not persist on
 * Vercel's read-only production filesystem). Auth and order/fulfillment
 * tables land in later phases per that doc.
 */
import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const artifactStatusValues = ["GENERATED", "UNUSED", "ACTIVATED", "ACCESSED"] as const;

export const artifacts = pgTable("artifact", {
  artifactId: text("artifact_id").primaryKey(),
  token: text("token").notNull().unique(),
  releaseHandle: text("release_handle").notNull(),
  trackTitle: text("track_title"),
  campaign: text("campaign"),
  status: text("status", { enum: artifactStatusValues }).notNull().default("GENERATED"),
  editionNumber: integer("edition_number"),
  editionOf: integer("edition_of"),
  ownerCustomerId: text("owner_customer_id"),
  firstAccessAt: timestamp("first_access_at", { withTimezone: true }),
  lastAccessAt: timestamp("last_access_at", { withTimezone: true }),
  accessCount: integer("access_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // R2 keys, never resolved URLs — see src/lib/domain/artifact.ts's ArtifactAssets comment.
  audioKey: text("audio_key"),
  videoKey: text("video_key"),
  storyKey: text("story_key"),
  creditsKey: text("credits_key"),
  lyricsKey: text("lyrics_key"),
  visualKeys: jsonb("visual_keys").$type<string[]>(),
});

export const artifactAccessEvents = pgTable("artifact_access_event", {
  id: text("id").primaryKey(),
  artifactId: text("artifact_id")
    .notNull()
    .references(() => artifacts.artifactId, { onDelete: "cascade" }),
  accessedAt: timestamp("accessed_at", { withTimezone: true }).notNull().defaultNow(),
  ipHash: text("ip_hash"),
});
