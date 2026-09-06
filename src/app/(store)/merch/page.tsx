import Link from "next/link";
import { getCollectionByHandle, getProducts } from "@/lib/shopify/catalog";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { ProductCard } from "@/components/store/product-card";

export const metadata = { title: "Merch — Moonfield Store" };

export default async function MerchPage() {
  if (!isShopifyConfigured) {
    return <p className="text-sm text-muted-foreground">Shopify is not configured yet.</p>;
  }

  // CD/Vinyl are PHYSICAL but are music formats, not merch — they belong on /music.
  const MUSIC_FORMATS = new Set(["CD", "Vinyl"]);

  const merchCollection = await getCollectionByHandle("merch");
  const products = merchCollection
    ? merchCollection.products
    : (await getProducts(50)).filter(
        (p) => p.productType === "PHYSICAL" && !MUSIC_FORMATS.has(p.raw.productType),
      );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-3xl">Merch</h1>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No merch listed yet.{" "}
          <Link href="/collections" className="underline">
            Browse all collections
          </Link>
          .
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
