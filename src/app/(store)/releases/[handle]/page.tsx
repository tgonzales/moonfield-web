import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getReleaseByHandle } from "@/content/releases";
import { getArtistByHandle } from "@/content/artists";
import { getProductByHandle } from "@/lib/shopify/catalog";
import { TrackPlayer } from "@/components/store/track-player";
import { isR2PublicConfigured, publicAssetUrl } from "@/lib/cloudflare/r2";
import { FormatSwitcher, type FormatOption } from "@/components/store/format-switcher";
import { formatKeyFor, formatLabelFor } from "@/components/store/format-utils";

export default async function ReleasePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const release = getReleaseByHandle(handle);
  if (!release) notFound();

  const artist = getArtistByHandle(release.artistHandle);
  const products = (
    await Promise.all(release.productHandles.map((h) => getProductByHandle(h)))
  ).filter((p) => p !== null);

  const formatOptions: FormatOption[] = products.map((product) => {
    const key = formatKeyFor(product.raw.productType);
    return { key, label: formatLabelFor(key), product };
  });

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
          <Image src={release.coverImage} alt={release.title} fill sizes="300px" className="object-cover" priority />
        </div>
        <div className="flex flex-col gap-6">
          <div>
            {artist && (
              <Link href={`/artists/${artist.handle}`} className="text-sm text-muted-foreground hover:text-foreground">
                {artist.name}
              </Link>
            )}
            <h1 className="mt-1 font-serif text-4xl">{release.title}</h1>
            {release.releaseDate && <p className="mt-2 text-sm text-muted-foreground">{release.releaseDate}</p>}
          </div>

          {formatOptions.length > 0 ? (
            <FormatSwitcher options={formatOptions} />
          ) : (
            <p className="text-sm text-muted-foreground">Products for this release are coming soon.</p>
          )}
        </div>
      </div>

      {release.tracks.length > 0 && (
        <TrackPlayer
          releaseHandle={release.handle}
          tracks={release.tracks.map((t) => ({
            title: t.title,
            durationSeconds: t.durationSeconds,
            streamUrl: t.streamKey && isR2PublicConfigured ? publicAssetUrl(t.streamKey) : undefined,
          }))}
        />
      )}
    </div>
  );
}
