import Image from "next/image";
import Link from "next/link";
import { getCart } from "@/lib/cart/actions";
import { removeCartLine, updateCartLineQuantity } from "@/lib/cart/actions";
import { formatMoney } from "@/components/store/price";
import { Button } from "@/components/ui/button";
import { getCustomerSession } from "@/lib/shopify/customer-account/session";

export default async function CartPage() {
  const [cart, session] = await Promise.all([getCart(), getCustomerSession()]);
  const lines = cart?.lines.edges.map((e) => e.node) ?? [];
  const checkoutHref = session ? cart?.checkoutUrl : "/auth/login?returnTo=/cart";

  if (lines.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-serif text-3xl">Cart</h1>
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
        <Button render={<Link href="/collections" />} className="w-fit">
          Continue shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-3xl">Cart</h1>
      <ul className="flex flex-col divide-y">
        {lines.map((line) => (
          <li key={line.id} className="flex items-center gap-4 py-4">
            {line.merchandise.product.featuredImage && (
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                <Image
                  src={line.merchandise.product.featuredImage.url}
                  alt={line.merchandise.product.featuredImage.altText ?? line.merchandise.product.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1">
              <p className="font-medium">{line.merchandise.product.title}</p>
              <p className="text-sm text-muted-foreground">{line.merchandise.title}</p>
              <div className="flex items-center gap-3">
                <form
                  action={
                    line.quantity <= 1
                      ? removeCartLine.bind(null, line.id)
                      : updateCartLineQuantity.bind(null, line.id, line.quantity - 1)
                  }
                >
                  <button type="submit" className="size-7 rounded border text-sm">
                    −
                  </button>
                </form>
                <span className="text-sm">{line.quantity}</span>
                <form action={updateCartLineQuantity.bind(null, line.id, line.quantity + 1)}>
                  <button type="submit" className="size-7 rounded border text-sm">
                    +
                  </button>
                </form>
                <form action={removeCartLine.bind(null, line.id)}>
                  <button type="submit" className="text-sm text-muted-foreground underline">
                    Remove
                  </button>
                </form>
              </div>
            </div>
            <p className="font-medium">
              {formatMoney(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
            </p>
          </li>
        ))}
      </ul>

      {cart && (
        <div className="flex flex-col items-end gap-4 border-t pt-6">
          <div className="flex w-full max-w-xs items-center justify-between text-lg font-medium">
            <span>Subtotal</span>
            <span>{formatMoney(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}</span>
          </div>
          <Button render={<a href={checkoutHref ?? cart.checkoutUrl} />} size="lg">
            Checkout
          </Button>
        </div>
      )}
    </div>
  );
}
