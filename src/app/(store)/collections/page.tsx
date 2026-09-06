import Link from "next/link";
import Image from "next/image";
import { getCollections } from "@/lib/shopify/catalog";
import { isShopifyConfigured } from "@/lib/shopify/client";

export const metadata = { title: "Collections — Moonfield Store" };

export default async function CollectionsPage() {
  if (!isShopifyConfigured) {
    return <p className="text-sm text-muted-foreground">Shopify is not configured yet.</p>;
  }

  const collections = await getCollections();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-3xl">Collections</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.handle}`}
            className="group flex flex-col gap-3"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-secondary">
              {collection.image && (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText ?? collection.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              )}
            </div>
            <h2 className="text-sm font-medium">{collection.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
