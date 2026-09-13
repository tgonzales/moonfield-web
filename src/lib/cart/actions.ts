"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  addCartLines,
  createCart,
  getCart as fetchCart,
  removeCartLines,
  updateCartLines,
} from "@/lib/shopify/cart";
import type { ShopifyCart } from "@/lib/shopify/types";
import { getCustomerSession } from "@/lib/shopify/customer-account/session";

const CART_COOKIE = "moonfield_cart_id";

/**
 * The Next.js storefront never implements its own payment logic (PRD §20).
 * A cart is created lazily on first "add to cart" and its id is kept in a
 * cookie; checkout is always a redirect to Shopify's checkoutUrl.
 *
 * Every call below passes the logged-in customer's access token through to
 * the Storefront API (see src/lib/shopify/cart.ts) whenever one exists, so
 * the cart's buyer identity — and the order it eventually becomes — is
 * linked to their Shopify customer record. Browsing/adding to cart works
 * the same whether logged in or not; only checkout itself is gated (see
 * the checkout href logic in cart-sheet.tsx / the /cart page).
 */
export async function getCart(): Promise<ShopifyCart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;

  const session = await getCustomerSession();
  try {
    return await fetchCart(cartId, session?.accessToken);
  } catch {
    return null;
  }
}

async function ensureCart(): Promise<string> {
  const store = await cookies();
  const session = await getCustomerSession();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) {
    const cart = await fetchCart(existing, session?.accessToken).catch(() => null);
    if (cart) return existing;
  }

  const cart = await createCart([], session?.accessToken);
  store.set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return cart.id;
}

export async function addToCart(merchandiseId: string, quantity = 1): Promise<void> {
  const cartId = await ensureCart();
  const session = await getCustomerSession();
  await addCartLines(cartId, [{ merchandiseId, quantity }], session?.accessToken);
  revalidatePath("/", "layout");
}

export async function updateCartLineQuantity(lineId: string, quantity: number): Promise<void> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return;
  const session = await getCustomerSession();
  await updateCartLines(cartId, [{ id: lineId, quantity }], session?.accessToken);
  revalidatePath("/", "layout");
}

export async function removeCartLine(lineId: string): Promise<void> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return;
  const session = await getCustomerSession();
  await removeCartLines(cartId, [lineId], session?.accessToken);
  revalidatePath("/", "layout");
}
