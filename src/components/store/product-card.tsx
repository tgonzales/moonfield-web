import Image from "next/image";
import Link from "next/link";
import type { MoonfieldProduct } from "@/lib/domain";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { Badge } from "@/components/ui/badge";
import { Price } from "./price";

const STATUS_LABEL: Record<MoonfieldProduct["status"], string> = {
  AVAILABLE: "",
  PREORDER: "Pre-order",
  SOLD_OUT: "Sold out",
  COMING_SOON: "Coming soon",
  ARCHIVED: "Archived",
};

export function ProductCard({ product }: { product: MoonfieldProduct<ShopifyProduct> }) {
  const { raw } = product;
  const statusLabel = STATUS_LABEL[product.status];

  return (
    <Link href={`/product/${product.handle}`} className="group flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
        {raw.featuredImage && (
          <Image
            src={raw.featuredImage.url}
            alt={raw.featuredImage.altText ?? raw.title}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
        {statusLabel && (
          <Badge variant="secondary" className="absolute left-3 top-3">
            {statusLabel}
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{raw.title}</h3>
        <p className="text-sm text-muted-foreground">
          <Price
            amount={raw.priceRange.minVariantPrice.amount}
            currencyCode={raw.priceRange.minVariantPrice.currencyCode}
          />
        </p>
      </div>
    </Link>
  );
}
