import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getReleaseByHandle } from "@/content/releases";
import { getArtistByHandle } from "@/content/artists";
import { getProductByHandle } from "@/lib/shopify/catalog";
import { isR2PublicConfigured, publicAssetUrl } from "@/lib/cloudflare/r2";
import { ReleaseLayout, type FormatOption } from "@/components/store/release-layout";
import { formatKeyFor, formatLabelFor } from "@/components/store/format-utils";
import { PREVIEW_LIMIT_SECONDS } from "@/components/store/track-player";
import { getCustomerSession } from "@/lib/shopify/customer-account/session";

export default async function ReleasePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const release = getReleaseByHandle(handle);
  if (!release) notFound();

  const artist = getArtistByHandle(release.artistHandle);
  const session = await getCustomerSession();
  const previewLimitSeconds = session ? undefined : PREVIEW_LIMIT_SECONDS;
  const products = (
    await Promise.all(release.productHandles.map((h) => getProductByHandle(h)))
  ).filter((p) => p !== null);

  const formatOptions: FormatOption[] = products.map((product) => {
    const key = formatKeyFor(product.raw.productType);
    return { key, label: formatLabelFor(key), product };
  });

  return (
    <ReleaseLayout
      options={formatOptions}
      cover={
        <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
          <Image src={release.coverImage} alt={release.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority />
        </div>
      }
      header={
        <div>
          {artist && (
            <Link href={`/artists/${artist.handle}`} className="text-sm text-muted-foreground hover:text-foreground">
              {artist.name}
            </Link>
          )}
          <h1 className="mt-1 font-serif text-4xl">{release.title}</h1>
          {release.releaseDate && <p className="mt-2 text-sm text-muted-foreground">{release.releaseDate}</p>}
        </div>
      }
      releaseHandle={release.handle}
      previewLimitSeconds={previewLimitSeconds}
      tracks={release.tracks.map((t) => ({
        title: t.title,
        durationSeconds: t.durationSeconds,
        streamUrl: t.streamKey && isR2PublicConfigured ? publicAssetUrl(t.streamKey) : undefined,
      }))}
    />
  );
}
