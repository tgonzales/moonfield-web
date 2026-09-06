import { PRODUCT_FRAGMENT } from "../fragments";

export const GET_PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProducts($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...MoonfieldProductFields
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...MoonfieldProductFields
    }
  }
`;

export const GET_PRODUCT_BY_ID_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProductById($id: ID!) {
    node(id: $id) {
      ... on Product {
        ...MoonfieldProductFields
      }
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query SearchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          ...MoonfieldProductFields
        }
      }
    }
  }
`;
