/**
 * Publishes any product that's missing from the "Moonfield Headless" sales
 * channel — this is the recurring gap with Gelato (and any other app that
 * creates products directly in Shopify): they land on "Online Store" by
 * default, never on our headless channel, so the Storefront API — what
 * this site actually reads — returns null for them until this runs.
 *
 * Usage:
 *   pnpm shopify:publish-headless               # scan + publish everything missing
 *   pnpm shopify:publish-headless --dry-run      # just report what would be published
 *   pnpm shopify:publish-headless --handle <h>   # only this one product handle
 *
 * Safe to re-run — a product already on the channel is skipped, not
 * re-published.
 */
import { adminGraphQL } from "../src/lib/shopify/admin-client";

interface ShopifyUserError {
  field: string[] | null;
  message: string;
}

const PUBLICATIONS_QUERY = `
  query Publications { publications(first: 20) { edges { node { id name } } } }
`;

const PRODUCTS_PAGE_QUERY = `
  query ProductsPage($cursor: String) {
    products(first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          resourcePublications(first: 20) {
            edges { node { publication { id name } isPublished } }
          }
        }
      }
    }
  }
`;

const PUBLISHABLE_PUBLISH_MUTATION = `
  mutation PublishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }
`;

interface ProductNode {
  id: string;
  handle: string;
  title: string;
  resourcePublications: { edges: { node: { publication: { id: string; name: string }; isPublished: boolean } }[] };
}

async function findHeadlessPublicationId(): Promise<string> {
  const data = await adminGraphQL<{ publications: { edges: { node: { id: string; name: string } }[] } }>(
    PUBLICATIONS_QUERY,
  );
  const match = data.publications.edges.find((e) => /headless/i.test(e.node.name));
  if (!match) {
    throw new Error(
      `No sales channel with "headless" in its name was found. Available: ${data.publications.edges
        .map((e) => e.node.name)
        .join(", ")}`,
    );
  }
  return match.node.id;
}

async function fetchAllProducts(): Promise<ProductNode[]> {
  const products: ProductNode[] = [];
  let cursor: string | undefined;

  while (true) {
    const data = await adminGraphQL<{
      products: { pageInfo: { hasNextPage: boolean; endCursor: string }; edges: { node: ProductNode }[] };
    }>(PRODUCTS_PAGE_QUERY, { cursor });

    products.push(...data.products.edges.map((e) => e.node));
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }

  return products;
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const name = argv[i].slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        args[name] = true;
      } else {
        args[name] = next;
        i++;
      }
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = Boolean(args["dry-run"]);
  const onlyHandle = args.handle as string | undefined;

  const headlessId = await findHeadlessPublicationId();
  console.log(`Headless channel: ${headlessId}`);

  const allProducts = await fetchAllProducts();
  const products = onlyHandle ? allProducts.filter((p) => p.handle === onlyHandle) : allProducts;

  if (onlyHandle && products.length === 0) {
    console.error(`No product found with handle "${onlyHandle}".`);
    process.exit(1);
  }

  const missing = products.filter(
    (p) => !p.resourcePublications.edges.some((e) => e.node.publication.id === headlessId && e.node.isPublished),
  );

  console.log(`Scanned ${products.length} product(s), ${missing.length} missing from Moonfield Headless.`);

  if (missing.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  for (const product of missing) {
    if (dryRun) {
      console.log(`[dry-run] would publish: ${product.title} (${product.handle})`);
      continue;
    }

    const result = await adminGraphQL<{
      publishablePublish: { userErrors: ShopifyUserError[] };
    }>(PUBLISHABLE_PUBLISH_MUTATION, { id: product.id, input: [{ publicationId: headlessId }] });

    if (result.publishablePublish.userErrors.length > 0) {
      console.error(
        `✗ ${product.title} (${product.handle}): ${result.publishablePublish.userErrors.map((e) => e.message).join("; ")}`,
      );
    } else {
      console.log(`✓ published: ${product.title} (${product.handle})`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
