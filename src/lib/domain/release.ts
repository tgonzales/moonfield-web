/**
 * Artist -> Release -> Product hierarchy — PRD §5.
 *
 * A Release is a Moonfield concept with no Shopify equivalent: it groups
 * every product (digital album, CD, vinyl, artifact, bundle...) that
 * belongs to the same body of work, plus the collector/track metadata a
 * Digital Artifact needs (PRD §9).
 */
export interface Track {
  title: string;
  durationSeconds?: number;
}

export interface Release {
  handle: string;
  artistHandle: string;
  title: string;
  coverImage: string;
  releaseDate?: string;
  tracks: Track[];
  /** Shopify product handles that belong to this release. */
  productHandles: string[];
}
