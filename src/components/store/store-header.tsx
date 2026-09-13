import Link from "next/link";
import { getCart } from "@/lib/cart/actions";
import { CartSheet } from "@/components/cart/cart-sheet";
import { getCustomerSession } from "@/lib/shopify/customer-account/session";

const NAV_LINKS = [
  { href: "/releases", label: "Music" },
  { href: "/artists", label: "Artists" },
  { href: "/merch", label: "Merch" },
  { href: "/artifacts", label: "Artifacts" },
];

export async function StoreHeader() {
  const [cart, session] = await Promise.all([getCart(), getCustomerSession()]);
  // Checkout requires being signed in — that's what links the resulting Shopify
  // order to the customer's account (see src/lib/cart/actions.ts). Cart return
  // path so they land back here and can finish checking out once logged in.
  const checkoutHref = session ? cart?.checkoutUrl : "/auth/login?returnTo=/cart";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="font-serif text-lg tracking-tight">
          Moonfield Store
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Search
          </Link>
          <Link
            href={session ? "/auth/logout" : "/auth/login"}
            className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground md:block"
          >
            {session ? "Log out" : "Log in"}
          </Link>
          <CartSheet cart={cart} checkoutHref={checkoutHref} />
        </div>
      </div>
    </header>
  );
}
