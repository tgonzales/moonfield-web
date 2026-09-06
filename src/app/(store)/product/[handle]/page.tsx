import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductByHandle } from "@/lib/shopify/catalog";
import { ProductVariantPicker } from "@/components/store/product-variant-picker";
import { Badge } from "@/components/ui/badge";
import { TrackPlayer, type PlayerTrack } from "@/components/store/track-player";
import { ExpandableText } from "@/components/store/expandable-text";
import { CreditsBlock } from "@/components/store/credits-block";
import { getReleaseByHandle } from "@/content/releases";
import { isR2PublicConfigured, publicAssetUrl } from "@/lib/cloudflare/r2";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  const { raw } = product;
  const images = raw.images.edges.map((e) => e.node);
  const variants = raw.variants.edges.map((e) => e.node);

  const release = product.releaseHandle ? getReleaseByHandle(product.releaseHandle) : undefined;
  const playerTracks: PlayerTrack[] | undefined = release?.tracks.map((t) => ({
    title: t.title,
    durationSeconds: t.durationSeconds,
    streamUrl: t.streamKey && isR2PublicConfigured ? publicAssetUrl(t.streamKey) : undefined,
  }));

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
          {images[0] && (
            <Image
              src={images[0].url}
              alt={images[0].altText ?? raw.title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          )}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {images.slice(1).map((image) => (
              <div key={image.url} className="relative aspect-square overflow-hidden rounded-md bg-secondary">
                <Image src={image.url} alt={image.altText ?? raw.title} fill sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{product.productType}</Badge>
          {product.status !== "AVAILABLE" && <Badge variant="secondary">{product.status}</Badge>}
        </div>
        <h1 className="font-serif text-3xl">{raw.title}</h1>
        <ProductVariantPicker productHandle={product.handle} variants={variants} />
        {raw.descriptionHtml && <ExpandableText html={raw.descriptionHtml} maxChars={200} />}
        {release && playerTracks && playerTracks.length > 0 && (
          <TrackPlayer tracks={playerTracks} releaseHandle={release.handle} />
        )}
        {product.credits && <CreditsBlock credits={product.credits} />}
      </div>
    </div>
  );
}
