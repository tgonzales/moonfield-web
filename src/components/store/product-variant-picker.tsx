"use client";

import { useMemo, useState } from "react";
import type { ShopifyProductVariant } from "@/lib/shopify/types";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Price } from "./price";

export function ProductVariantPicker({
  productHandle,
  variants,
}: {
  productHandle: string;
  variants: ShopifyProductVariant[];
}) {
  const firstAvailable = variants.find((v) => v.availableForSale) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id);
  const selected = useMemo(
    () => variants.find((v) => v.id === selectedId) ?? firstAvailable,
    [variants, selectedId, firstAvailable],
  );

  const hasRealOptions = variants.length > 1 && variants[0]?.title !== "Default Title";

  if (!selected) return null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">
        <Price amount={selected.price.amount} currencyCode={selected.price.currencyCode} />
      </p>

      {hasRealOptions && (
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedId(variant.id)}
              disabled={!variant.availableForSale}
              className={`rounded-md border px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40 ${
                variant.id === selected.id ? "border-foreground" : "border-border"
              }`}
            >
              {variant.title}
            </button>
          ))}
        </div>
      )}

      <AddToCartButton
        variantId={selected.id}
        disabled={!selected.availableForSale}
        productHandle={productHandle}
      />
    </div>
  );
}
