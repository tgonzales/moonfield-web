import { notFound } from "next/navigation";
import Image from "next/image";
import { artifactStore } from "@/lib/artifacts/store";
import { isPlausibleArtifactToken } from "@/lib/artifacts/token";
import { getReleaseByHandle } from "@/content/releases";
import { getArtistByHandle } from "@/content/artists";
import { trackServer } from "@/lib/analytics/track";
import { getAssetText, getSignedAssetUrl, isR2Configured } from "@/lib/cloudflare/r2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = { title: "Moonfield Artifact" };

/**
 * PRD §13 — mobile-first landing an Artifact QR resolves to. No store
 * chrome: this is a standalone, immersive page, not a storefront page.
 * Media/text content is read from Cloudflare R2 (src/lib/cloudflare/r2.ts)
 * — nothing here writes to R2; that only happens via /scripts.
 */
export default async function ArtifactPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // PRD §25 — reject obviously-malformed tokens before touching the store (basic enumeration guard).
  if (!isPlausibleArtifactToken(token)) notFound();

  const existing = await artifactStore.getByToken(token);
  if (!existing) notFound();

  const wasFirstAccess = existing.accessCount === 0;
  const artifact = await artifactStore.recordAccess(token);
  if (!artifact) notFound();

  trackServer({ name: "artifact_scan", properties: { artifactId: artifact.artifactId } });
  if (wasFirstAccess) {
    trackServer({ name: "artifact_first_access", properties: { artifactId: artifact.artifactId } });
  }

  const release = getReleaseByHandle(artifact.releaseHandle);
  const artist = release ? getArtistByHandle(release.artistHandle) : undefined;
  const assets = artifact.assets;

  const [audioUrl, story, credits, lyrics, visualUrls] = isR2Configured
    ? await Promise.all([
        assets?.audioKey ? getSignedAssetUrl(assets.audioKey) : Promise.resolve(undefined),
        assets?.storyKey ? getAssetText(assets.storyKey) : Promise.resolve(null),
        assets?.creditsKey ? getAssetText(assets.creditsKey) : Promise.resolve(null),
        assets?.lyricsKey ? getAssetText(assets.lyricsKey) : Promise.resolve(null),
        Promise.all((assets?.visualKeys ?? []).map((key) => getSignedAssetUrl(key))),
      ])
    : [undefined, null, null, null, []];

  const tabs = [
    { value: "story", label: "Story", content: story },
    { value: "credits", label: "Credits", content: credits },
    { value: "lyrics", label: "Lyrics", content: lyrics },
    { value: "visual", label: "Visual", content: visualUrls.length > 0 ? visualUrls : null },
  ].filter((tab) => tab.content);

  return (
    <div className="relative flex min-h-screen flex-col items-center px-6 py-16 text-center text-white">
      {release && (
        <div className="absolute inset-0 -z-10 opacity-40">
          <Image src={release.coverImage} alt="" fill className="object-cover" priority />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-black" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/70 to-black" />

      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">{artist?.name ?? "Moonfield"}</p>
        <h1 className="mt-3 font-serif text-4xl">{artifact.trackTitle ?? release?.title ?? "Artifact"}</h1>

        {artifact.edition && (
          <p className="mt-2 text-xs uppercase tracking-widest text-white/50">
            {String(artifact.edition.number).padStart(3, "0")} / {artifact.edition.of}
          </p>
        )}

        {audioUrl ? (
          <audio controls src={audioUrl} className="mt-10 w-full max-w-xs" />
        ) : (
          <button
            type="button"
            disabled
            className="mt-10 flex size-16 items-center justify-center rounded-full border border-white/30 text-white/50"
            title="Playback is not connected yet"
          >
            ▶
          </button>
        )}
      </div>

      {tabs.length > 0 ? (
        <Tabs defaultValue={tabs[0].value} className="w-full max-w-md pb-8">
          <TabsList className="mx-auto bg-white/10">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="uppercase tracking-widest">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4 text-left text-sm text-white/80">
              {tab.value === "visual" ? (
                <div className="grid grid-cols-2 gap-2">
                  {(tab.content as string[]).map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={url} src={url} alt="" className="aspect-square w-full rounded-md object-cover" />
                  ))}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{tab.content as string}</p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <nav className="pb-8 flex flex-col gap-4 text-sm uppercase tracking-widest text-white/40">
          <span>Story</span>
          <span>Credits</span>
          <span>Lyrics</span>
          <span>Visual</span>
        </nav>
      )}
    </div>
  );
}
