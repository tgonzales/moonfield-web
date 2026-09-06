/**
 * One-time (idempotent) setup: creates the metafield definitions the
 * storefront reads (src/lib/shopify/fragments.ts, mappers.ts) with
 * Storefront API read access. Without a *definition* with
 * `access.storefront: PUBLIC_READ`, a metafield's value is only visible
 * via the Admin API — writing it via productSet is not enough, which is
 * why newly-created products showed the right values in Admin but came
 * back null on the Storefront API.
 *
 * Usage: pnpm shopify:setup-metafields
 * Safe to re-run — if a definition already exists, its validations/name/
 * description are updated in place (e.g. bumping a max-length) rather than
 * being left as whatever they were when first created.
 */
import { adminGraphQL } from "../src/lib/shopify/admin-client";

interface ShopifyUserError {
  field: string[] | null;
  message: string;
  code?: string;
}

const DEFINITIONS: { key: string; name: string; description: string; type?: string; maxLength?: number }[] = [
  { key: "product_type", name: "Moonfield Product Type", description: "DIGITAL | PHYSICAL | ARTIFACT | COLLECTOR | BUNDLE" },
  { key: "fulfillment_provider", name: "Fulfillment Provider", description: "LOCAL | ELASTICSTAGE | PRINT_PROVIDER | NIX_INTERNAL | DIGITAL" },
  { key: "production_mode", name: "Production Mode", description: "STOCK | ON_DEMAND" },
  { key: "artist_handle", name: "Artist Handle", description: "Matches src/content/artists.ts" },
  { key: "release_handle", name: "Release Handle", description: "Matches src/content/releases.ts" },
  { key: "artifact_campaign", name: "Artifact Campaign", description: "Digital Artifact campaign name" },
  { key: "limited_edition_total", name: "Limited Edition Total", description: "Total run size, e.g. 100" },
  { key: "preorder_release_date", name: "Preorder Release Date", description: "PRD §14" },
  { key: "preorder_expected_shipping", name: "Preorder Expected Shipping", description: "PRD §14" },
  { key: "preorder_start", name: "Preorder Start", description: "PRD §14" },
  { key: "preorder_end", name: "Preorder End", description: "PRD §14" },
  { key: "bundle_item_handles", name: "Bundle Item Handles", description: "Comma-separated product handles" },
  {
    key: "credits",
    name: "Credits",
    description: "Liner-notes style credits (writing, production, mixing...) — distinct from the product description",
    type: "multi_line_text_field",
    maxLength: 1000,
  },
];

const CREATE_MUTATION = `
  mutation MetafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition { id key }
      userErrors { field message code }
    }
  }
`;

const UPDATE_MUTATION = `
  mutation MetafieldDefinitionUpdate($definition: MetafieldDefinitionUpdateInput!) {
    metafieldDefinitionUpdate(definition: $definition) {
      updatedDefinition { id key }
      userErrors { field message code }
    }
  }
`;

async function main() {
  for (const def of DEFINITIONS) {
    const validations = def.maxLength ? [{ name: "max", value: String(def.maxLength) }] : undefined;

    const result = await adminGraphQL<{
      metafieldDefinitionCreate: {
        createdDefinition: { id: string; key: string } | null;
        userErrors: ShopifyUserError[];
      };
    }>(CREATE_MUTATION, {
      definition: {
        namespace: "custom",
        key: def.key,
        name: def.name,
        description: def.description,
        ownerType: "PRODUCT",
        type: def.type ?? "single_line_text_field",
        access: { storefront: "PUBLIC_READ" },
        validations,
      },
    });

    const { createdDefinition, userErrors } = result.metafieldDefinitionCreate;
    const alreadyExists = userErrors.some((e) => e.code === "TAKEN");

    if (createdDefinition) {
      console.log(`✓ created custom.${def.key}`);
      continue;
    }

    if (!alreadyExists) {
      console.error(`✗ custom.${def.key}:`, userErrors.map((e) => e.message).join("; "));
      continue;
    }

    const updateResult = await adminGraphQL<{
      metafieldDefinitionUpdate: {
        updatedDefinition: { id: string; key: string } | null;
        userErrors: ShopifyUserError[];
      };
    }>(UPDATE_MUTATION, {
      definition: {
        namespace: "custom",
        key: def.key,
        name: def.name,
        description: def.description,
        ownerType: "PRODUCT",
        validations,
      },
    });

    if (updateResult.metafieldDefinitionUpdate.updatedDefinition) {
      console.log(`= custom.${def.key} already existed — updated (e.g. max length ${def.maxLength ?? "n/a"})`);
    } else {
      console.error(
        `✗ custom.${def.key} update failed:`,
        updateResult.metafieldDefinitionUpdate.userErrors.map((e) => e.message).join("; "),
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
