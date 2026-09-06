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
 * Full release-page layout: a 50/50 grid where the left column (cover,
 * format switcher, price, Add to Cart, credits) and the right column
 * (title/artist header, description, track player) both depend on which
 * format is selected — so one component owns that state and lays out
 * both columns, rather than each column managing it independently.
 *
 * `cover`, `header` and `trackPlayer` are Server Component subtrees
 * (image rendering, R2 URL resolution) handed down as props so this
 * Client Component can position them without fetching anything itself.
 */
export function ReleaseLayout({
  cover,
  header,
  options,
  trackPlayer,
}: {
  cover: ReactNode;
  header: ReactNode;
  options: FormatOption[];
  trackPlayer?: ReactNode;
}) {
  const [selectedKey, setSelectedKey] = useState(options[0]?.key);
  const selected = options.find((o) => o.key === selectedKey) ?? options[0];
  const variant = selected?.product.raw.variants.edges[0]?.node;

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        {cover}

        {selected ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
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

              <div className="flex items-center gap-2">
                <p className="text-lg">
                  {variant && <Price amount={variant.price.amount} currencyCode={variant.price.currencyCode} />}
                </p>
                {selected.product.status !== "AVAILABLE" && (
                  <Badge variant="secondary">{selected.product.status}</Badge>
                )}
              </div>
            </div>

            {variant && (
              <AddToCartButton
                variantId={variant.id}
                disabled={!variant.availableForSale}
                productHandle={selected.product.handle}
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Products for this release are coming soon.</p>
        )}

        {selected?.product.credits && <CreditsBlock credits={selected.product.credits} />}
      </div>

      <div className="flex flex-col gap-6">
        {header}
        {selected?.product.raw.descriptionHtml && (
          <ExpandableText html={selected.product.raw.descriptionHtml} maxChars={200} />
        )}
        {trackPlayer}
      </div>
    </div>
  );
}
