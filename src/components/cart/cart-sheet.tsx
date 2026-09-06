"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import type { ShopifyCart } from "@/lib/shopify/types";
import { removeCartLine, updateCartLineQuantity } from "@/lib/cart/actions";
import { formatMoney } from "@/components/store/price";

export function CartSheet({ cart }: { cart: ShopifyCart | null }) {
  const lines = cart?.lines.edges.map((e) => e.node) ?? [];

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Open cart" className="relative" />}
      >
        <ShoppingBag className="size-5" />
        {cart && cart.totalQuantity > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
            {cart.totalQuantity}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {lines.length === 0 && (
            <p className="py-8 text-sm text-muted-foreground">Your cart is empty.</p>
          )}
          <ul className="flex flex-col gap-4">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-3">
                {line.merchandise.product.featuredImage && (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={line.merchandise.product.featuredImage.url}
                      alt={line.merchandise.product.featuredImage.altText ?? line.merchandise.product.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-medium">{line.merchandise.product.title}</p>
                  <p className="text-xs text-muted-foreground">{line.merchandise.title}</p>
                  <div className="flex items-center gap-2">
                    <form
                      action={
                        line.quantity <= 1
                          ? removeCartLine.bind(null, line.id)
                          : updateCartLineQuantity.bind(null, line.id, line.quantity - 1)
                      }
                    >
                      <button
                        type="submit"
                        className="size-6 rounded border text-xs leading-none"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                    </form>
                    <span className="text-xs">{line.quantity}</span>
                    <form action={updateCartLineQuantity.bind(null, line.id, line.quantity + 1)}>
                      <button
                        type="submit"
                        className="size-6 rounded border text-xs leading-none"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </form>
                    <form action={removeCartLine.bind(null, line.id)} className="ml-auto">
                      <button type="submit" className="text-xs text-muted-foreground underline">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
                <p className="text-sm">
                  {formatMoney(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {cart && lines.length > 0 && (
          <SheetFooter className="gap-3 border-t pt-4">
            <div className="flex w-full items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>
                {formatMoney(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
              </span>
            </div>
            <Button render={<a href={cart.checkoutUrl} />} className="w-full">
              Checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
