import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getReleaseByHandle } from "@/content/releases";
import { getArtistByHandle } from "@/content/artists";
import { getProductByHandle } from "@/lib/shopify/catalog";
import { ProductCard } from "@/components/store/product-card";

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

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
          <Image src={release.coverImage} alt={release.title} fill sizes="300px" className="object-cover" priority />
        </div>
        <div>
          {artist && (
            <Link href={`/artists/${artist.handle}`} className="text-sm text-muted-foreground hover:text-foreground">
              {artist.name}
            </Link>
          )}
          <h1 className="mt-1 font-serif text-4xl">{release.title}</h1>
          {release.releaseDate && <p className="mt-2 text-sm text-muted-foreground">{release.releaseDate}</p>}
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-serif text-2xl">Shop this release</h2>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">Products for this release are coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.handle} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
