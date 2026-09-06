import Link from "next/link";
import { getProducts } from "@/lib/shopify/catalog";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { ProductCard } from "@/components/store/product-card";

export const metadata = { title: "Music — Moonfield Store" };

export default async function MusicPage() {
  const products = isShopifyConfigured ? await getProducts(50) : [];
  const digital = products.filter((p) => p.productType === "DIGITAL");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-3xl">Music</h1>
        <Link href="/releases" className="text-sm text-muted-foreground hover:text-foreground">
          Browse all releases →
        </Link>
      </div>

      {digital.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Digital albums are not listed in Shopify yet — browse{" "}
          <Link href="/releases" className="underline">
            releases
          </Link>{" "}
          in the meantime.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {digital.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
