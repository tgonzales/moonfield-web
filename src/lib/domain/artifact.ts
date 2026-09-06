/**
 * Digital Artifact — PRD §9-12, §25.
 *
 * A card with a QR code that resolves to `moonfield.com/a/{token}` and
 * renders a mobile-first landing experience (PRD §13). The token is the
 * entity — never a proxy for a Bandcamp/YouTube link.
 */
export type ArtifactStatus = "GENERATED" | "UNUSED" | "ACTIVATED" | "ACCESSED";

/**
 * Keys into the private Cloudflare R2 bucket (see src/lib/cloudflare/r2.ts)
 * — never a resolved URL. The artifact landing page turns a key into a
 * short-lived signed URL per request; storing a URL here would go stale.
 */
export interface ArtifactAssets {
  audioKey?: string;
  videoKey?: string;
  visualKeys?: string[];
  storyKey?: string;
  creditsKey?: string;
  lyricsKey?: string;
}

export interface Artifact {
  artifactId: string;
  /** Opaque, non-sequential, non-enumerable — PRD §12, §25. Never store PII here. */
  token: string;
  releaseHandle: string;
  trackTitle?: string;
  campaign?: string;
  status: ArtifactStatus;
  edition?: {
    number: number;
    of: number;
  };
  ownerCustomerId?: string;
  firstAccessAt?: string;
  lastAccessAt?: string;
  accessCount: number;
  createdAt: string;
  assets?: ArtifactAssets;
}

export interface ArtifactAccessEvent {
  artifactId: string;
  accessedAt: string;
  /** Never store IP/user-agent/PII beyond what's needed for basic abuse detection. */
  ipHash?: string;
}
