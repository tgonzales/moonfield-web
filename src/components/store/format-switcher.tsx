"use client";

import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ExpandableText } from "./expandable-text";
import { CreditsBlock } from "./credits-block";
import { Price } from "./price";
import type { MoonfieldProduct } from "@/lib/domain";
import type { ShopifyProduct } from "@/lib/shopify/types";

export interface FormatOption {
  /** Shopify's native productType, e.g. "Digital Album" | "CD" | "Vinyl" — used to pick the button label. */
  key: string;
  label: string;
  product: MoonfieldProduct<ShopifyProduct>;
}

/**
 * One buy box for a release backed by several separate Shopify products
 * (digital / CD / vinyl are each their own product, not variants of one).
 * Switching format swaps which product's price/description/credits/variant
 * is shown and what Add to Cart actually adds — it does not touch the URL,
 * so there's still just the one release page (PRD-adjacent: catalog is
 * release-first, Shopify products are an implementation detail).
 *
 * `trackPlayer` is rendered between the buy controls and the credits —
 * it's a Server Component subtree (needs server-resolved R2 stream URLs)
 * handed down as a prop so this Client Component can slot it into the
 * right visual position without needing to fetch anything itself.
 */
export function FormatSwitcher({ options, trackPlayer }: { options: FormatOption[]; trackPlayer?: ReactNode }) {
  const [selectedKey, setSelectedKey] = useState(options[0]?.key);
  const selected = options.find((o) => o.key === selectedKey) ?? options[0];

  if (!selected) return null;

  const { raw } = selected.product;
  const variant = raw.variants.edges[0]?.node;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSelectedKey(option.key)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                option.key === selectedKey
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <p className="text-lg">
            {variant && <Price amount={variant.price.amount} currencyCode={variant.price.currencyCode} />}
          </p>
          {selected.product.status !== "AVAILABLE" && (
            <Badge variant="secondary">{selected.product.status}</Badge>
          )}
        </div>

        {variant && (
          <AddToCartButton
            variantId={variant.id}
            disabled={!variant.availableForSale}
            productHandle={selected.product.handle}
          />
        )}

        {raw.descriptionHtml && <ExpandableText html={raw.descriptionHtml} maxChars={200} />}
      </div>

      {trackPlayer}

      {selected.product.credits && <CreditsBlock credits={selected.product.credits} />}
    </div>
  );
}
