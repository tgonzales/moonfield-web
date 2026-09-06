/**
 * Creates (or updates, if run again with the same handle) a Shopify
 * product from a Moonfield Release, in one of the physical/digital
 * formats defined in the FORMAT_PRESETS below. This is the intended way
 * catalog gets populated — no product-creation UI exists in the
 * storefront by design (PRD: catalog/artifact viewing only).
 *
 * The metafields this sets are exactly what src/lib/shopify/mappers.ts
 * reads to derive Moonfield's product taxonomy (PRD §6-7) — keep the two
 * in sync if either changes.
 *
 * Usage:
 *   pnpm shopify:product --release human-machine --format cd --price 18.00
 *   pnpm shopify:product --release human-machine --format digital --price 9.99 --status active
 *
 * Requires SHOPIFY_ADMIN_API_TOKEN with write_products, read_products,
 * write_files, read_files, write_publications and read_publications
 * (see docs/shopify-admin-scopes.md). Also publishes the product to the
 * "Moonfield Headless" sales channel by default — pass --publish skip to
 * leave it unlisted.
 *
 * IMPORTANT: run `pnpm shopify:setup-metafields` at least once (on a fresh
 * store, or after adding a new custom.* key) BEFORE the first product is
 * created. A metafield value written before its definition exists is only
 * visible via the Admin API — the Storefront API (what the storefront
 * actually reads) returns null for it until this script runs again for
 * that product *after* the definition exists. Confirmed by hand: creating
 * the definition alone did not retroactively fix an already-set value; a
 * second productSet call did.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { adminGraphQL } from "../src/lib/shopify/admin-client";
import { getReleaseByHandle } from "../src/content/releases";
import { getArtistByHandle } from "../src/content/artists";
import type { FulfillmentProviderId, ProductType, ProductionMode } from "../src/lib/domain";

const IMAGE_MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

type Format = "digital" | "cd" | "vinyl";

interface FormatPreset {
  shopifyProductType: string;
  moonfieldProductType: ProductType;
  fulfillmentProviderId: FulfillmentProviderId;
  productionMode: ProductionMode;
  label: string;
}

const FORMAT_PRESETS: Record<Format, FormatPreset> = {
  digital: {
    shopifyProductType: "Digital Album",
    moonfieldProductType: "DIGITAL",
    fulfillmentProviderId: "DIGITAL",
    productionMode: "ON_DEMAND",
    label: "Digital Album",
  },
  cd: {
    shopifyProductType: "CD",
    moonfieldProductType: "PHYSICAL",
    fulfillmentProviderId: "ELASTICSTAGE",
    productionMode: "ON_DEMAND",
    label: "CD",
  },
  vinyl: {
    shopifyProductType: "Vinyl",
    moonfieldProductType: "PHYSICAL",
    fulfillmentProviderId: "ELASTICSTAGE",
    productionMode: "ON_DEMAND",
    label: "Vinyl",
  },
};

interface ShopifyUserError {
  field: string[] | null;
  message: string;
}

function assertNoUserErrors(userErrors: ShopifyUserError[]): void {
  if (userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join("; "));
  }
}

const PRODUCT_SET_MUTATION = `
  mutation ProductSet($input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
    productSet(input: $input, synchronous: true, identifier: $identifier) {
      product {
        id
        handle
        status
        variants(first: 1) {
          edges { node { id } }
        }
      }
      userErrors { field message }
    }
  }
`;

const STAGED_UPLOADS_CREATE_MUTATION = `
  mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters { name value }
      }
      userErrors { field message }
    }
  }
`;

/** Stages the cover image on Shopify's upload host and returns a resourceUrl usable as ProductSetInput.files[].originalSource. */
async function stageCoverImage(filePath: string): Promise<{ resourceUrl: string; filename: string }> {
  const filename = path.basename(filePath);
  const mimeType = IMAGE_MIME_TYPES[path.extname(filePath).toLowerCase()];
  if (!mimeType) throw new Error(`Unrecognized image extension for "${filename}".`);

  const fileSize = statSync(filePath).size;

  const staged = await adminGraphQL<{
    stagedUploadsCreate: {
      stagedTargets: { url: string; resourceUrl: string; parameters: { name: string; value: string }[] }[];
      userErrors: ShopifyUserError[];
    };
  }>(STAGED_UPLOADS_CREATE_MUTATION, {
    input: [{ resource: "IMAGE", filename, mimeType, httpMethod: "POST", fileSize: String(fileSize) }],
  });
  assertNoUserErrors(staged.stagedUploadsCreate.userErrors);

  const target = staged.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const param of target.parameters) form.append(param.name, param.value);
  form.append("file", new Blob([readFileSync(filePath)], { type: mimeType }), filename);

  const uploadRes = await fetch(target.url, { method: "POST", body: form });
  if (!uploadRes.ok) {
    throw new Error(`Cover image upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
  }

  return { resourceUrl: target.resourceUrl, filename };
}

const VARIANTS_BULK_UPDATE_MUTATION = `
  mutation ProductVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants { id price }
      userErrors { field message }
    }
  }
`;

const PUBLICATIONS_QUERY = `
  query Publications { publications(first: 20) { edges { node { id name } } } }
`;

const PUBLISHABLE_PUBLISH_MUTATION = `
  mutation PublishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }
`;

/** Finds the headless sales channel by name so a re-run doesn't need a hardcoded publication id. */
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

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      args[argv[i].slice(2)] = argv[i + 1];
      i++;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { release: releaseHandle, format, price } = args;
  const status = (args.status ?? "draft").toUpperCase();
  const sku = args.sku;
  const compareAtPrice = args["compare-at"];
  const description = args["description-file"]
    ? readFileSync(args["description-file"], "utf-8")
    : args.description;
  const credits = args["credits-file"] ? readFileSync(args["credits-file"], "utf-8") : args.credits;

  if (!releaseHandle || !format || !price) {
    console.error(
      "Usage: pnpm shopify:product --release <handle> --format <digital|cd|vinyl> --price <n> [--sku <s>] [--compare-at <n>] [--status draft|active] [--cover skip] [--publish skip] [--description \"...\"|--description-file <path>] [--credits \"...\"|--credits-file <path>]",
    );
    process.exit(1);
  }

  // Shopify's native description field (descriptionHtml) has no hard length limit — only
  // custom.credits does (500 chars, enforced by the metafield definition itself).
  if (credits && credits.length > 500) {
    console.error(`--credits is ${credits.length} characters — keep it to 500 or fewer (enforced by the metafield too).`);
    process.exit(1);
  }

  const preset = FORMAT_PRESETS[format as Format];
  if (!preset) {
    console.error(`Unknown --format "${format}". Use one of: ${Object.keys(FORMAT_PRESETS).join(", ")}`);
    process.exit(1);
  }

  const release = getReleaseByHandle(releaseHandle);
  if (!release) {
    console.error(`No release found for handle "${releaseHandle}" in src/content/releases.ts.`);
    process.exit(1);
  }
  const artist = getArtistByHandle(release.artistHandle);

  const productHandle = `${release.handle}-${format}`;

  const input: Record<string, unknown> = {
    title: `${release.title} (${preset.label})`,
    handle: productHandle,
    vendor: artist?.name ?? "Moonfield Records",
    productType: preset.shopifyProductType,
    status,
    tags: [release.artistHandle, release.handle, format],
    ...(description ? { descriptionHtml: description } : {}),
    metafields: [
      { namespace: "custom", key: "product_type", type: "single_line_text_field", value: preset.moonfieldProductType },
      { namespace: "custom", key: "fulfillment_provider", type: "single_line_text_field", value: preset.fulfillmentProviderId },
      { namespace: "custom", key: "production_mode", type: "single_line_text_field", value: preset.productionMode },
      { namespace: "custom", key: "artist_handle", type: "single_line_text_field", value: release.artistHandle },
      { namespace: "custom", key: "release_handle", type: "single_line_text_field", value: release.handle },
      ...(credits ? [{ namespace: "custom", key: "credits", type: "multi_line_text_field", value: credits }] : []),
    ],
  };

  let coverUploaded = false;
  if (args.cover !== "skip") {
    const coverPath = path.join(process.cwd(), "public", release.coverImage);
    if (existsSync(coverPath)) {
      console.log(`Uploading cover image (${coverPath})...`);
      const { resourceUrl, filename } = await stageCoverImage(coverPath);
      input.files = [{ originalSource: resourceUrl, contentType: "IMAGE", filename, alt: release.title }];
      coverUploaded = true;
    } else {
      console.warn(`Cover image not found at ${coverPath} — skipping.`);
    }
  }

  console.log(`Creating/updating "${input.title}" (${productHandle})...`);

  const setResult = await adminGraphQL<{
    productSet: { product: { id: string; handle: string; status: string; variants: { edges: { node: { id: string } }[] } }; userErrors: ShopifyUserError[] };
  }>(PRODUCT_SET_MUTATION, { input, identifier: { handle: productHandle } });

  assertNoUserErrors(setResult.productSet.userErrors);
  const product = setResult.productSet.product;
  const defaultVariantId = product.variants.edges[0]?.node.id;

  if (!defaultVariantId) {
    throw new Error("Product created but no default variant was returned — cannot set price.");
  }

  const variantInput: Record<string, unknown> = { id: defaultVariantId, price };
  if (compareAtPrice) variantInput.compareAtPrice = compareAtPrice;
  if (sku) variantInput.inventoryItem = { sku };

  const variantResult = await adminGraphQL<{
    productVariantsBulkUpdate: { productVariants: unknown[]; userErrors: ShopifyUserError[] };
  }>(VARIANTS_BULK_UPDATE_MUTATION, { productId: product.id, variants: [variantInput] });

  assertNoUserErrors(variantResult.productVariantsBulkUpdate.userErrors);

  console.log(`Done: ${product.handle} (${product.status}) — price set to ${price}`);
  console.log(`Product GID: ${product.id}`);
  if (!coverUploaded) {
    console.log("Note: no cover image was uploaded — add one manually in Shopify admin for now.");
  }

  if (args.publish !== "skip") {
    const headlessId = await findHeadlessPublicationId();
    const publishResult = await adminGraphQL<{
      publishablePublish: { userErrors: ShopifyUserError[] };
    }>(PUBLISHABLE_PUBLISH_MUTATION, { id: product.id, input: [{ publicationId: headlessId }] });
    assertNoUserErrors(publishResult.publishablePublish.userErrors);
    console.log("Published to the Moonfield Headless sales channel.");
  } else {
    console.log("Skipped publishing to a sales channel (--publish skip) — product stays unlisted.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
