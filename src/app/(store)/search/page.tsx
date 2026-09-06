import { searchProducts } from "@/lib/shopify/catalog";
import { ProductCard } from "@/components/store/product-card";
import { Input } from "@/components/ui/input";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = q ? await searchProducts(q) : [];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-3xl">Search</h1>
      <form className="max-w-md">
        <Input type="search" name="q" defaultValue={q} placeholder="Search products…" />
      </form>
      {q && (
        <p className="text-sm text-muted-foreground">
          {products.length} result{products.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
        </p>
      )}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.handle} product={product} />
        ))}
      </div>
    </div>
  );
}
