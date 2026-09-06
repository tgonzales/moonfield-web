import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Artifact, ArtifactAssets, ArtifactStatus } from "@/lib/domain";
import { generateArtifactToken } from "./token";

/**
 * ArtifactStore is the seam: swap this file's implementation for a real
 * database (Postgres, Vercel KV...) once one exists. Everything else
 * (routes, the artifact landing page, the /scripts uploaders) only ever
 * calls these functions.
 *
 * The JSON-file implementation below is dev/demo-only — Vercel's
 * production filesystem is read-only/ephemeral, so writes here do not
 * persist across deployments or serverless invocations in production.
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

const DATA_DIR = path.join(process.cwd(), "src", "data");
const SEED_FILE = path.join(DATA_DIR, "artifacts.seed.json");
const DEV_FILE = path.join(DATA_DIR, "artifacts.dev.json");

function loadAll(): Artifact[] {
  if (!existsSync(DEV_FILE)) {
    mkdirSync(DATA_DIR, { recursive: true });
    const seed = existsSync(SEED_FILE) ? readFileSync(SEED_FILE, "utf-8") : "[]";
    writeFileSync(DEV_FILE, seed);
  }
  return JSON.parse(readFileSync(DEV_FILE, "utf-8"));
}

function saveAll(artifacts: Artifact[]): void {
  writeFileSync(DEV_FILE, JSON.stringify(artifacts, null, 2));
}

class JsonFileArtifactStore implements ArtifactStore {
  async getByToken(token: string): Promise<Artifact | null> {
    return loadAll().find((a) => a.token === token) ?? null;
  }

  async create(input: {
    releaseHandle: string;
    trackTitle?: string;
    campaign?: string;
    edition?: Artifact["edition"];
  }): Promise<Artifact> {
    const artifacts = loadAll();
    const artifact: Artifact = {
      artifactId: `art_${randomUUID()}`,
      token: generateArtifactToken(),
      releaseHandle: input.releaseHandle,
      trackTitle: input.trackTitle,
      campaign: input.campaign,
      edition: input.edition,
      status: "GENERATED",
      accessCount: 0,
      createdAt: new Date().toISOString(),
    };
    artifacts.push(artifact);
    saveAll(artifacts);
    return artifact;
  }

  async recordAccess(token: string): Promise<Artifact | null> {
    const artifacts = loadAll();
    const artifact = artifacts.find((a) => a.token === token);
    if (!artifact) return null;

    const now = new Date().toISOString();
    const nextStatus: ArtifactStatus =
      artifact.status === "GENERATED" || artifact.status === "UNUSED" ? "ACTIVATED" : "ACCESSED";

    artifact.status = nextStatus;
    artifact.firstAccessAt ??= now;
    artifact.lastAccessAt = now;
    artifact.accessCount += 1;

    saveAll(artifacts);
    return artifact;
  }

  async updateAssets(token: string, assets: ArtifactAssets): Promise<Artifact | null> {
    const artifacts = loadAll();
    const artifact = artifacts.find((a) => a.token === token);
    if (!artifact) return null;

    artifact.assets = { ...artifact.assets, ...assets };
    saveAll(artifacts);
    return artifact;
  }

  async revoke(token: string): Promise<void> {
    const artifacts = loadAll().filter((a) => a.token !== token);
    saveAll(artifacts);
  }
}

export const artifactStore: ArtifactStore = new JsonFileArtifactStore();
