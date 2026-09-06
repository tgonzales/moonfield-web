import { notFound } from "next/navigation";
import { getCollectionByHandle } from "@/lib/shopify/catalog";
import { ProductCard } from "@/components/store/product-card";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const result = await getCollectionByHandle(handle);
  if (!result) notFound();

  const { collection, products } = result;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl">{collection.title}</h1>
        {collection.description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{collection.description}</p>
        )}
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products in this collection yet.</p>
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
