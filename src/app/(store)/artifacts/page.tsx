export const metadata = { title: "Digital Artifacts — Moonfield Store" };

/** PRD §9-13 — explainer page for the Digital Artifact program. */
export default function ArtifactsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-serif text-3xl">Digital Artifacts</h1>
      <p className="text-muted-foreground">
        A Digital Artifact is a physical card with a unique QR code. Scanning it opens a private,
        mobile-first page on Moonfield&apos;s own infrastructure — never a redirect to a third-party
        streaming service — with the story, credits, lyrics and visuals behind a track.
      </p>
      <p className="text-muted-foreground">
        Each artifact is a numbered, collectible object. Access is tracked from the first scan, and
        an artifact can be revisited any time — the moment a card gets scanned for the first time is
        as much a part of the release as the music itself.
      </p>
      <p className="text-sm text-muted-foreground">
        Artifact cards ship bundled with select CD, Vinyl and Collector editions. Look for the{" "}
        <span className="font-medium text-foreground">Artifact</span> badge on a product page.
      </p>
    </div>
  );
}
