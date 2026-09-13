import "server-only";

import { storefrontFetch } from "./client";
import {
  ADD_CART_LINES_MUTATION,
  CREATE_CART_MUTATION,
  GET_CART_QUERY,
  REMOVE_CART_LINES_MUTATION,
  UPDATE_CART_LINES_MUTATION,
} from "./queries/cart";
import type { ShopifyCart, ShopifyUserError } from "./types";

function assertNoUserErrors(userErrors: ShopifyUserError[]): void {
  if (userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join("; "));
  }
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

/** Shared by every cart call below — see queries/cart.ts's header comment for why. */
function buyerVariables(customerAccessToken?: string): { buyer?: { customerAccessToken: string } } {
  return customerAccessToken ? { buyer: { customerAccessToken } } : {};
}

export async function createCart(lines: CartLineInput[], customerAccessToken?: string): Promise<ShopifyCart> {
  const data = await storefrontFetch<{
    cartCreate: { cart: ShopifyCart; userErrors: ShopifyUserError[] };
  }>(CREATE_CART_MUTATION, { lines, ...buyerVariables(customerAccessToken) }, { cache: "no-store" });
  assertNoUserErrors(data.cartCreate.userErrors);
  return data.cartCreate.cart;
}

export async function getCart(cartId: string, customerAccessToken?: string): Promise<ShopifyCart | null> {
  const data = await storefrontFetch<{ cart: ShopifyCart | null }>(
    GET_CART_QUERY,
    { cartId, ...buyerVariables(customerAccessToken) },
    { cache: "no-store" },
  );
  return data.cart;
}

export async function addCartLines(
  cartId: string,
  lines: CartLineInput[],
  customerAccessToken?: string,
): Promise<ShopifyCart> {
  const data = await storefrontFetch<{
    cartLinesAdd: { cart: ShopifyCart; userErrors: ShopifyUserError[] };
  }>(ADD_CART_LINES_MUTATION, { cartId, lines, ...buyerVariables(customerAccessToken) }, { cache: "no-store" });
  assertNoUserErrors(data.cartLinesAdd.userErrors);
  return data.cartLinesAdd.cart;
}

export interface CartLineUpdateInput {
  id: string;
  quantity: number;
}

export async function updateCartLines(
  cartId: string,
  lines: CartLineUpdateInput[],
  customerAccessToken?: string,
): Promise<ShopifyCart> {
  const data = await storefrontFetch<{
    cartLinesUpdate: { cart: ShopifyCart; userErrors: ShopifyUserError[] };
  }>(UPDATE_CART_LINES_MUTATION, { cartId, lines, ...buyerVariables(customerAccessToken) }, { cache: "no-store" });
  assertNoUserErrors(data.cartLinesUpdate.userErrors);
  return data.cartLinesUpdate.cart;
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
  customerAccessToken?: string,
): Promise<ShopifyCart> {
  const data = await storefrontFetch<{
    cartLinesRemove: { cart: ShopifyCart; userErrors: ShopifyUserError[] };
  }>(REMOVE_CART_LINES_MUTATION, { cartId, lineIds, ...buyerVariables(customerAccessToken) }, { cache: "no-store" });
  assertNoUserErrors(data.cartLinesRemove.userErrors);
  return data.cartLinesRemove.cart;
}
