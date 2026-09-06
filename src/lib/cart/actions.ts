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

const CART_COOKIE = "moonfield_cart_id";

/**
 * The Next.js storefront never implements its own payment logic (PRD §20).
 * A cart is created lazily on first "add to cart" and its id is kept in a
 * cookie; checkout is always a redirect to Shopify's checkoutUrl.
 */
export async function getCart(): Promise<ShopifyCart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;

  try {
    return await fetchCart(cartId);
  } catch {
    return null;
  }
}

async function ensureCart(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) {
    const cart = await fetchCart(existing).catch(() => null);
    if (cart) return existing;
  }

  const cart = await createCart([]);
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
  await addCartLines(cartId, [{ merchandiseId, quantity }]);
  revalidatePath("/", "layout");
}

export async function updateCartLineQuantity(lineId: string, quantity: number): Promise<void> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return;
  await updateCartLines(cartId, [{ id: lineId, quantity }]);
  revalidatePath("/", "layout");
}

export async function removeCartLine(lineId: string): Promise<void> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return;
  await removeCartLines(cartId, [lineId]);
  revalidatePath("/", "layout");
}
