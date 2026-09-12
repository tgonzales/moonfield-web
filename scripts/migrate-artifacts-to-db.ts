/**
 * One-time migration: imports src/data/artifacts.dev.json (the old JSON-file
 * store's local dev data) into Postgres, preserving createdAt/status/
 * accessCount/timestamps exactly rather than regenerating them.
 *
 * Usage: pnpm tsx --env-file=.env.local scripts/migrate-artifacts-to-db.ts
 * Safe to re-run — uses onConflictDoNothing keyed on artifactId.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { db } from "../src/lib/db/client";
import { artifacts } from "../src/lib/db/schema";
import type { Artifact } from "../src/lib/domain";

async function main() {
  const file = path.join(process.cwd(), "src", "data", "artifacts.dev.json");
  if (!existsSync(file)) {
    console.log("No src/data/artifacts.dev.json found — nothing to migrate.");
    return;
  }

  const records: Artifact[] = JSON.parse(readFileSync(file, "utf-8"));
  if (records.length === 0) {
    console.log("artifacts.dev.json is empty — nothing to migrate.");
    return;
  }

  const rows = records.map((a) => ({
    artifactId: a.artifactId,
    token: a.token,
    releaseHandle: a.releaseHandle,
    trackTitle: a.trackTitle,
    campaign: a.campaign,
    status: a.status,
    editionNumber: a.edition?.number,
    editionOf: a.edition?.of,
    ownerCustomerId: a.ownerCustomerId,
    firstAccessAt: a.firstAccessAt ? new Date(a.firstAccessAt) : undefined,
    lastAccessAt: a.lastAccessAt ? new Date(a.lastAccessAt) : undefined,
    accessCount: a.accessCount,
    createdAt: new Date(a.createdAt),
    audioKey: a.assets?.audioKey,
    videoKey: a.assets?.videoKey,
    storyKey: a.assets?.storyKey,
    creditsKey: a.assets?.creditsKey,
    lyricsKey: a.assets?.lyricsKey,
    visualKeys: a.assets?.visualKeys,
  }));

  const inserted = await db.insert(artifacts).values(rows).onConflictDoNothing().returning({ token: artifacts.token });

  console.log(`Migrated ${inserted.length}/${records.length} artifact(s) (skipped any already present).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
