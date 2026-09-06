import Link from "next/link";
import { getProducts } from "@/lib/shopify/catalog";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { ProductCard } from "@/components/store/product-card";

export const metadata = { title: "Music — Moonfield Store" };

// CD/Vinyl are PHYSICAL but are music formats — they belong here alongside digital albums.
const MUSIC_FORMATS = new Set(["CD", "Vinyl"]);

export default async function MusicPage() {
  const products = isShopifyConfigured ? await getProducts(50) : [];
  const music = products.filter(
    (p) => p.productType === "DIGITAL" || MUSIC_FORMATS.has(p.raw.productType),
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-3xl">Music</h1>
        <Link href="/releases" className="text-sm text-muted-foreground hover:text-foreground">
          Browse all releases →
        </Link>
      </div>

      {music.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No music products are listed in Shopify yet — browse{" "}
          <Link href="/releases" className="underline">
            releases
          </Link>{" "}
          in the meantime.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {music.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
