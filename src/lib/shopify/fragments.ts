/**
 * Metafields read on every product to derive Moonfield's own product
 * taxonomy (see src/lib/domain/product.ts and mappers.ts). These live in
 * the `custom` namespace and are optional — the mapper falls back to
 * defaults when a store hasn't set them up yet.
 */
export const PRODUCT_METAFIELD_IDENTIFIERS = `
  metafields(identifiers: [
    { namespace: "custom", key: "product_type" }
    { namespace: "custom", key: "fulfillment_provider" }
    { namespace: "custom", key: "production_mode" }
    { namespace: "custom", key: "artist_handle" }
    { namespace: "custom", key: "release_handle" }
    { namespace: "custom", key: "artifact_campaign" }
    { namespace: "custom", key: "limited_edition_total" }
    { namespace: "custom", key: "preorder_release_date" }
    { namespace: "custom", key: "preorder_expected_shipping" }
    { namespace: "custom", key: "preorder_start" }
    { namespace: "custom", key: "preorder_end" }
    { namespace: "custom", key: "bundle_item_handles" }
  ]) {
    key
    value
  }
`;

export const PRODUCT_FRAGMENT = `
  fragment MoonfieldProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    tags
    productType
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 50) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    ${PRODUCT_METAFIELD_IDENTIFIERS}
  }
`;

export const CART_FRAGMENT = `
  fragment MoonfieldCartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                handle
                title
                featuredImage {
                  url
                  altText
                  width
                  height
                }
              }
              price {
                amount
                currencyCode
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
