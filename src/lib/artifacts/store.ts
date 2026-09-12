import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { artifacts } from "@/lib/db/schema";
import type { Artifact, ArtifactAssets, ArtifactStatus } from "@/lib/domain";
import { generateArtifactToken } from "./token";

/**
 * ArtifactStore is the seam: routes, the artifact landing page, and the
 * /scripts uploaders only ever call these functions, never the DB directly.
 *
 * Backed by Postgres (Drizzle, see src/lib/db) — replaces the earlier
 * JSON-file implementation, which did not persist on Vercel's read-only
 * production filesystem (see docs/database-schema.md).
 *
 * No `server-only` guard here: this module doubles as the write target for
 * the plain-Node scripts in /scripts, which `server-only` would break.
 */
export interface ArtifactStore {
  getByToken(token: string): Promise<Artifact | null>;
  create(input: {
    releaseHandle: string;
    trackTitle?: string;
    campaign?: string;
    edition?: Artifact["edition"];
  }): Promise<Artifact>;
  recordAccess(token: string): Promise<Artifact | null>;
  updateAssets(token: string, assets: ArtifactAssets): Promise<Artifact | null>;
  revoke(token: string): Promise<void>;
}

type ArtifactRow = typeof artifacts.$inferSelect;

function toArtifact(row: ArtifactRow): Artifact {
  return {
    artifactId: row.artifactId,
    token: row.token,
    releaseHandle: row.releaseHandle,
    trackTitle: row.trackTitle ?? undefined,
    campaign: row.campaign ?? undefined,
    status: row.status as ArtifactStatus,
    edition:
      row.editionNumber != null && row.editionOf != null
        ? { number: row.editionNumber, of: row.editionOf }
        : undefined,
    ownerCustomerId: row.ownerCustomerId ?? undefined,
    firstAccessAt: row.firstAccessAt?.toISOString(),
    lastAccessAt: row.lastAccessAt?.toISOString(),
    accessCount: row.accessCount,
    createdAt: row.createdAt.toISOString(),
    assets: {
      audioKey: row.audioKey ?? undefined,
      videoKey: row.videoKey ?? undefined,
      storyKey: row.storyKey ?? undefined,
      creditsKey: row.creditsKey ?? undefined,
      lyricsKey: row.lyricsKey ?? undefined,
      visualKeys: row.visualKeys ?? undefined,
    },
  };
}

class DbArtifactStore implements ArtifactStore {
  async getByToken(token: string): Promise<Artifact | null> {
    const [row] = await db.select().from(artifacts).where(eq(artifacts.token, token)).limit(1);
    return row ? toArtifact(row) : null;
  }

  async create(input: {
    releaseHandle: string;
    trackTitle?: string;
    campaign?: string;
    edition?: Artifact["edition"];
  }): Promise<Artifact> {
    const [row] = await db
      .insert(artifacts)
      .values({
        artifactId: `art_${randomUUID()}`,
        token: generateArtifactToken(),
        releaseHandle: input.releaseHandle,
        trackTitle: input.trackTitle,
        campaign: input.campaign,
        editionNumber: input.edition?.number,
        editionOf: input.edition?.of,
        status: "GENERATED",
      })
      .returning();
    return toArtifact(row);
  }

  async recordAccess(token: string): Promise<Artifact | null> {
    const [existing] = await db.select().from(artifacts).where(eq(artifacts.token, token)).limit(1);
    if (!existing) return null;

    const now = new Date();
    const nextStatus: ArtifactStatus =
      existing.status === "GENERATED" || existing.status === "UNUSED" ? "ACTIVATED" : "ACCESSED";

    const [row] = await db
      .update(artifacts)
      .set({
        status: nextStatus,
        firstAccessAt: existing.firstAccessAt ?? now,
        lastAccessAt: now,
        accessCount: existing.accessCount + 1,
      })
      .where(eq(artifacts.token, token))
      .returning();
    return toArtifact(row);
  }

  async updateAssets(token: string, assets: ArtifactAssets): Promise<Artifact | null> {
    // Partial merge, matching the old JSON store's `{ ...artifact.assets, ...assets }` —
    // only overwrite the keys actually present in `assets`, never null out the rest.
    const patch: Partial<typeof artifacts.$inferInsert> = {};
    if ("audioKey" in assets) patch.audioKey = assets.audioKey;
    if ("videoKey" in assets) patch.videoKey = assets.videoKey;
    if ("storyKey" in assets) patch.storyKey = assets.storyKey;
    if ("creditsKey" in assets) patch.creditsKey = assets.creditsKey;
    if ("lyricsKey" in assets) patch.lyricsKey = assets.lyricsKey;
    if ("visualKeys" in assets) patch.visualKeys = assets.visualKeys;

    if (Object.keys(patch).length === 0) {
      return this.getByToken(token);
    }

    const [row] = await db.update(artifacts).set(patch).where(eq(artifacts.token, token)).returning();
    return row ? toArtifact(row) : null;
  }

  async revoke(token: string): Promise<void> {
    await db.delete(artifacts).where(eq(artifacts.token, token));
  }
}

export const artifactStore: ArtifactStore = new DbArtifactStore();
