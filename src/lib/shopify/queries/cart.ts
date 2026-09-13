import { CART_FRAGMENT } from "../fragments";

/**
 * Every operation below takes an optional $buyer (BuyerInput) and applies
 * it via @inContext(buyer: $buyer) — this is how a Storefront API cart
 * gets linked to a customer authenticated through the Customer Account API
 * (its access_token goes straight into BuyerInput.customerAccessToken; the
 * old storefrontCustomerAccessTokenCreate token-exchange mutation is
 * deprecated and no longer needed). Passing $buyer: null/undefined is
 * fine for an anonymous cart. See src/lib/shopify/cart.ts for callers.
 */
export const GET_CART_QUERY = `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!, $buyer: BuyerInput) @inContext(buyer: $buyer) {
    cart(id: $cartId) {
      ...MoonfieldCartFields
    }
  }
`;

export const CREATE_CART_MUTATION = `
  ${CART_FRAGMENT}
  mutation CreateCart($lines: [CartLineInput!], $buyer: BuyerInput) @inContext(buyer: $buyer) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...MoonfieldCartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADD_CART_LINES_MUTATION = `
  ${CART_FRAGMENT}
  mutation AddCartLines($cartId: ID!, $lines: [CartLineInput!]!, $buyer: BuyerInput) @inContext(buyer: $buyer) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...MoonfieldCartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_CART_LINES_MUTATION = `
  ${CART_FRAGMENT}
  mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!, $buyer: BuyerInput) @inContext(buyer: $buyer) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...MoonfieldCartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const REMOVE_CART_LINES_MUTATION = `
  ${CART_FRAGMENT}
  mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!, $buyer: BuyerInput) @inContext(buyer: $buyer) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...MoonfieldCartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;
