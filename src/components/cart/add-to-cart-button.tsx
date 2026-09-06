"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart/actions";
import { track } from "@/lib/analytics/track";

export function AddToCartButton({
  variantId,
  disabled,
  productHandle,
}: {
  variantId: string;
  disabled?: boolean;
  productHandle: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(async () => {
          await addToCart(variantId, 1);
          track({ name: "add_to_cart", properties: { productHandle, variantId } });
        })
      }
    >
      {disabled ? "Sold out" : isPending ? "Adding…" : "Add to cart"}
    </Button>
  );
}
