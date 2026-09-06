# Shopify Admin API — scopes

Reference for the custom app's Admin API scopes (Settings → Apps and sales
channels → Develop apps → [app] → Configuration → Admin API scopes). Update
this file whenever scopes change so we don't have to re-discover them.

`SHOPIFY_ADMIN_API_TOKEN` in `.env.local` is regenerated whenever scopes are
changed and the app is reinstalled — update the env var too when you flip
anything below.

## Currently enabled

Confirmed via `currentAppInstallation { accessScopes }` on 2026-09-06.

| Scope | Used by |
|---|---|
| `write_products`, `read_products` | `scripts/create-shopify-product.ts` |
| `write_files`, `read_files` | `scripts/create-shopify-product.ts` (cover image upload via `stagedUploadsCreate`) |
| `write_publications`, `read_publications` | `scripts/create-shopify-product.ts` (publish to the "Moonfield Headless" channel via `publishablePublish`) |

**Gotcha found the hard way:** writing a `custom.*` metafield via `productSet`
does **not** make it visible on the Storefront API by itself — it needs a
*metafield definition* with `access.storefront: PUBLIC_READ`
(`pnpm shopify:setup-metafields`, see `scripts/setup-shopify-metafields.ts`).
Creating the definition doesn't retroactively fix values set before it
existed — re-run `pnpm shopify:product` for that product afterward. Run
`shopify:setup-metafields` once before ever creating a product.

## Needed for features already built or discussed

Not enabled yet — add when we build the corresponding piece.

| Feature | Scopes | Where it plugs in |
|---|---|---|
| Digital HD download delivery (WAV/FLAC from R2 after a paid order) | `read_orders` | `src/app/api/webhooks/shopify/route.ts` + `src/lib/fulfillment/adapters/digital-delivery.adapter.ts` — only need to *read* the order, delivery itself is R2, not Shopify |
| Real fulfillment status sync (elasticStage / merchant-managed orders) | `read_orders`, `write_orders`, `read_merchant_managed_fulfillment_orders`, `write_merchant_managed_fulfillment_orders`, `read_fulfillments`, `write_fulfillments` | `src/lib/fulfillment/adapters/elastic-stage.adapter.ts`, `src/lib/fulfillment/adapters/local.adapter.ts` |
| Subscriptions / memberships (PRD §16, not MVP) | `read_purchase_options`, `write_purchase_options` (selling plans) | not built yet |
| Pre-order / discount campaigns | `read_discounts`, `write_discounts`, `read_price_rules`, `write_price_rules` | not built yet |
| Press/comp copies, manual orders | `read_draft_orders`, `write_draft_orders` | not built yet |
| Gift cards (PRD mentions as a product type) | `read_gift_cards`, `write_gift_cards` | not built yet |
| Customer accounts (none exist yet) | `read_customers`, `write_customers` | not built yet |
| Store analytics dashboard | `read_analytics` | not built yet |

## Full scope list (Shopify Admin API, as of this store's dashboard)

Grouped as Shopify groups them in the admin UI. `write_*` generally implies
the paired `read_*` is also needed (and is usually auto-checked with it).

### Core commerce

| Area | Scopes |
|---|---|
| Products | `write_products`, `read_products` |
| Product listings | `write_product_listings`, `read_product_listings` |
| Product feeds | `write_product_feeds`, `read_product_feeds` |
| Collections / publications | `write_publications`, `read_publications` |
| Orders | `write_orders`, `read_orders` |
| Draft orders | `write_draft_orders`, `read_draft_orders` |
| Order editing | `write_order_edits`, `read_order_edits` |
| Returns | `write_returns`, `read_returns` |
| Discounts | `write_discounts`, `read_discounts` |
| Price rules | `write_price_rules`, `read_price_rules` |
| Purchase options (selling plans / subscriptions) | `write_purchase_options`, `read_purchase_options` |
| Gift cards | `write_gift_cards`, `read_gift_cards` |
| Gift card transactions | `write_gift_card_transactions`, `read_gift_card_transactions` |
| Payment terms | `write_payment_terms`, `read_payment_terms` |
| Payment customizations | `write_payment_customizations`, `read_payment_customizations` |

### Customers

| Area | Scopes |
|---|---|
| Customers (PII) | `write_customers`, `read_customers` |
| Customer browsing behavior (PII) | `read_customer_events` |
| Customer merge (PII) | `write_customer_merge`, `read_customer_merge` |
| Customer data erasure | `write_customer_data_erasure`, `read_customer_data_erasure` |
| Companies (B2B, PII) | `write_companies`, `read_companies` |
| Store credit accounts | `read_store_credit_accounts` |
| Store credit transactions | `write_store_credit_account_transactions`, `read_store_credit_account_transactions` |

### Fulfillment & shipping

| Area | Scopes |
|---|---|
| Fulfillment services | `write_fulfillments`, `read_fulfillments` |
| Assigned fulfillment orders | `write_assigned_fulfillment_orders`, `read_assigned_fulfillment_orders` |
| Merchant-managed fulfillment orders | `write_merchant_managed_fulfillment_orders`, `read_merchant_managed_fulfillment_orders` |
| Third-party fulfillment orders | `write_third_party_fulfillment_orders`, `read_third_party_fulfillment_orders` |
| Custom fulfillment services | `write_custom_fulfillment_services`, `read_custom_fulfillment_services` |
| Fulfillment constraint rules | `write_fulfillment_constraint_rules`, `read_fulfillment_constraint_rules` |
| Inventory | `write_inventory`, `read_inventory` |
| Inventory shipments | `write_inventory_shipments`, `read_inventory_shipments` |
| Inventory shipments received items | `write_inventory_shipments_received_items`, `read_inventory_shipments_received_items` |
| Inventory transfers | `write_inventory_transfers`, `read_inventory_transfers` |
| Locations (PII) | `write_locations`, `read_locations` |
| Shipping (PII) | `write_shipping`, `read_shipping` |
| Delivery customizations | `write_delivery_customizations`, `read_delivery_customizations` |
| Delivery option generators | `write_delivery_option_generators`, `read_delivery_option_generators` |
| Packing slip templates | `write_packing_slip_templates`, `read_packing_slip_templates` |
| Cart transforms | `write_cart_transforms`, `read_cart_transforms`, `read_all_cart_transforms` |

### Store content & theme

| Area | Scopes |
|---|---|
| Files | `write_files`, `read_files` |
| Online store content (articles/blogs/pages, PII) | `write_content`, `read_content` |
| Online store pages | `write_online_store_pages`, `read_online_store_pages` |
| Online store navigation | `write_online_store_navigation`, `read_online_store_navigation` |
| Themes | `write_themes`, `read_themes` |
| Theme code | `write_theme_code` |
| Script tags | `write_script_tags`, `read_script_tags` |
| Translations | `write_translations`, `read_translations` |
| Locales | `write_locales`, `read_locales` |
| Metaobject definitions | `write_metaobject_definitions`, `read_metaobject_definitions` |
| Metaobject entries | `write_metaobjects`, `read_metaobjects` |
| Checkout branding settings | `write_checkout_branding_settings`, `read_checkout_branding_settings` |
| Checkout & accounts configuration | `write_checkout_and_accounts_configurations`, `read_checkout_and_accounts_configurations` |

### Apps, channels & marketing

| Area | Scopes |
|---|---|
| Apps | `read_apps` |
| Sales channels | `write_channels`, `read_channels` |
| Discovery API | `write_discovery`, `read_discovery` |
| Pixels | `write_pixels`, `read_pixels` |
| Custom pixels | `write_custom_pixels`, `read_custom_pixels` |
| Marketing events | `write_marketing_events`, `read_marketing_events` |
| Marketing integrated campaigns | `write_marketing_integrated_campaigns`, `read_marketing_integrated_campaigns` |
| App proxy | `write_app_proxy`, `read_app_proxy` |
| Resource feedback | `write_resource_feedbacks`, `read_resource_feedbacks` |
| Analytics | `read_analytics` |
| Analytics annotations | `write_analytics_annotations`, `read_analytics_annotations` |
| Reports | `write_reports`, `read_reports` |

### Payments & finance

| Area | Scopes |
|---|---|
| Shopify Payments accounts | `read_shopify_payments_accounts` |
| Shopify Payments bank accounts | `read_shopify_payments_bank_accounts` |
| Shopify Payments payouts | `read_shopify_payments_payouts` |
| Shopify Payments disputes | `write_shopify_payments_disputes`, `read_shopify_payments_disputes` |
| Shopify Payments provider accounts (sensitive) | `read_shopify_payments_provider_accounts_sensitive` |
| Cash tracking | `write_cash_tracking`, `read_cash_tracking` |
| Payment notifications | `write_payment_notifications`, `read_payment_notifications` |

### Markets, legal & misc

| Area | Scopes |
|---|---|
| Shopify Markets | `write_markets`, `read_markets` |
| Markets home | `write_markets_home`, `read_markets_home` |
| Legal policies | `write_legal_policies`, `read_legal_policies` |
| Privacy settings | `write_privacy_settings`, `read_privacy_settings` |
| Discounts allocator functions | `write_discounts_allocator_functions`, `read_discounts_allocator_functions` |
| Checkout Kit enhanced buyer events | `read_checkout_kit_enhanced_buyer_events` |
| Validations | `validations` |

## Notes

- Scopes are additive per app install — enabling more later doesn't break
  anything already working, so it's fine to only enable what's needed as
  each feature gets built rather than front-loading everything.
- `write_*` scopes need real justification (each one widens what a leaked
  token could do) — only add the ones a concrete script/feature needs.
- Storefront API tokens (`SHOPIFY_STOREFRONT_API_TOKEN`) are a completely
  separate scope system (configured on the Headless sales channel, not
  here) — this file is Admin API only.
