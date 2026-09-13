"use client";

import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ExpandableText } from "./expandable-text";
import { CreditsBlock } from "./credits-block";
import { Price } from "./price";
import { TrackPlayer, type PlayerTrack } from "./track-player";
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
 * TrackPlayer is built here (not passed as a ready node) because its
 * mobile Description/Credits modal buttons need the *currently selected*
 * format's copy — `tracks` themselves are plain server-resolved data
 * (R2 URLs), not JSX, so there's no Server/Client boundary issue passing
 * them down as a prop.
 *
 * `cover` and `header` don't depend on the selected format, so they stay
 * as Server Component subtrees handed down as props.
 */
export function ReleaseLayout({
  cover,
  header,
  options,
  tracks,
  releaseHandle,
  previewLimitSeconds,
}: {
  cover: ReactNode;
  header: ReactNode;
  options: FormatOption[];
  tracks: PlayerTrack[];
  releaseHandle: string;
  previewLimitSeconds?: number;
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

        {selected?.product.credits && (
          <div className="hidden md:block">
            <CreditsBlock credits={selected.product.credits} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {header}
        {selected?.product.raw.descriptionHtml && (
          <div className="hidden md:block">
            <ExpandableText html={selected.product.raw.descriptionHtml} maxChars={200} />
          </div>
        )}
        {tracks.length > 0 && (
          <TrackPlayer
            releaseHandle={releaseHandle}
            tracks={tracks}
            description={selected?.product.raw.descriptionHtml}
            credits={selected?.product.credits}
            previewLimitSeconds={previewLimitSeconds}
          />
        )}
      </div>
    </div>
  );
}
