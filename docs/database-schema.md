# Database schema plan

Proposed relational schema for Moonfield Store's first real database. Written
against what exists today (see file-by-file references) — not a from-scratch
design. Nothing here is implemented yet; this is the plan to review before
building.

## What moves into the DB, and what doesn't

| Stays as-is | Moves into the DB |
|---|---|
| `src/content/releases.ts` / `artists.ts` (static, git-versioned) | Digital Artifacts (`src/lib/artifacts/store.ts` — was a JSON file, explicitly flagged as not persisting on Vercel) — **done, see below** |
| Shopify: products, prices, variants, inventory, orders/payment | Order/fulfillment tracking (currently not persisted at all) |
| Auth (delegated entirely to Shopify — see below, no local table) | Webhook dedupe (currently an in-memory `Set`, lost on every cold start) |

**Why catalog content stays static:** no admin UI exists or is planned (the
storefront is view-only by design), releases change rarely, and git review
is a fine workflow for that cadence. Migrating it to the DB is a separate,
bigger decision (effectively "build a CMS") — not implied by adding auth and
persisting orders/artifacts. Revisit only if that changes.

**Why Digital Artifacts is the most urgent migration, not just auth:**
`src/lib/artifacts/store.ts`'s own comment already flags this — it reads a
JSON file (`src/data/artifacts.dev.json`) that won't persist on Vercel's
read-only/ephemeral filesystem. That's a real production bug today, not a
nice-to-have.

## Build order

1. ~~**Wire up the DB + ORM.** Migrate the artifact store onto it~~ — done
   2026-09-12 (Neon + Drizzle, `artifact`/`artifact_access_event` tables).
2. ~~**Auth**~~ — done 2026-09-12, and it turned out to need **no DB tables
   at all** (see below) — decided against Better Auth in favor of Shopify's
   own Customer Account API, since the goal is to lean on Shopify's stack
   wherever it covers the need.
3. **Order / webhook / digital-download tables** — next up. Unblocks real
   digital fulfillment (the ZIP-per-release work in
   `docs/release-playbook.md`) and makes the webhook handler idempotent
   under retries.

## Entities

### Auth — Shopify Customer Account API, no local table (done, 2026-09-12)

Originally planned as Better Auth (email/password, with `user`/`session`/
`account`/`verification` tables). Changed after weighing it against leaning
on Shopify's own stack wherever it covers the need: Shopify's **Customer
Account API** does headless login via OAuth 2.0 + PKCE against Shopify's
own hosted, **passwordless** login (email one-time code) — no password of
ours to store, no verification/reset email to send ourselves, and an order
placed by a logged-in customer already carries their Shopify identity.

Implementation lives entirely in `src/lib/shopify/customer-account/` and
`src/app/auth/{login,callback,logout}`:
- `config.ts` — reads the client id + the Authorization/Token/Logout
  endpoint URLs from env (copied from Shopify Admin > Sales channels >
  Headless > Customer Account API settings — Shopify's own setup guide has
  you copy these directly rather than construct them). Discovers the
  GraphQL API endpoint dynamically via `/.well-known/customer-account-api`
  so the API version stays current without a hardcoded value.
- `pkce.ts` / `tokens.ts` / `client.ts` — the OAuth mechanics (code
  verifier/challenge/state/nonce, the authorization-code and refresh-token
  exchanges, the Customer Account GraphQL call).
- `session.ts` — the session lives in an **encrypted, httpOnly cookie**
  (AES-256-GCM, `crypto.ts`, key from `AUTH_SESSION_SECRET`), not a DB row:
  access token, refresh token, id token, expiry, customer id, email.
  `getCustomerSession()` is intentionally read-only (Next.js won't allow
  writing cookies during a Server Component render) — an expired session
  just reads as logged-out rather than silently auto-refreshing; wiring a
  refresh into a route handler / middleware is a follow-up, not done yet.

**No `user` table exists.** Anywhere the schema below would have referenced
`user.id`, it now just holds the Shopify customer's GID (a plain string) —
see the order-linking note below.

**Known gaps, called out explicitly rather than guessed at:** the logout
endpoint's exact query parameters weren't confirmed against live testing
(standard OIDC `id_token_hint`/`post_logout_redirect_uri` names are used —
verify once `SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_URL` is actually set); and
whether an order placed at checkout automatically carries the logged-in
customer's identity (vs. needing the buyer's identity explicitly passed to
cart/checkout) hasn't been investigated yet — that's the next thing to
check before the order-linking design below can be fully trusted.

**Setup still needed before this works (user-side, in Shopify Admin):**
enable "Customer accounts" (Settings > Customer accounts), install the
Headless sales channel if not already, register a **confidential** client
under its Customer Account API settings with callback URL
`<domain>/auth/callback`, and put the resulting client id + three endpoint
URLs into `.env.local` (placeholders already added, see `.env.example`).
Local testing needs an HTTPS tunnel (ngrok or similar) — Shopify rejects
`localhost`/`http` redirect URIs outright.

### Digital Artifacts (done, 2026-09-12 — replaced `src/data/artifacts.dev.json`)

Mirrors the existing `Artifact` type in `src/lib/domain/artifact.ts` exactly,
so `src/lib/artifacts/store.ts`'s interface (`getByToken`, `create`,
`recordAccess`, `updateAssets`, `revoke`) needed no changes above that layer.

- **`artifact`** — artifactId (pk), token (unique), releaseHandle,
  trackTitle (nullable), campaign (nullable), status (`GENERATED` |
  `UNUSED` | `ACTIVATED` | `ACCESSED`), editionNumber (nullable), editionOf
  (nullable), ownerCustomerId (nullable — see note below), firstAccessAt
  (nullable), lastAccessAt (nullable), accessCount (default 0), createdAt,
  audioKey / videoKey / storyKey / creditsKey / lyricsKey (nullable, R2
  keys), visualKeys (jsonb array of R2 keys)
- **`artifact_access_event`** — id, artifactId → artifact.artifactId,
  accessedAt, ipHash (nullable). The `ArtifactAccessEvent` type already
  existed in the domain layer but had nowhere to persist — this gives it a
  home. (Not wired up to actually insert rows anywhere yet — the table
  exists, nothing calls it.)

`ownerCustomerId` stays a loose nullable string (the Shopify customer GID,
once known) — there's no `user` table to foreign-key to, and an artifact
can be scanned/owned before any login happens at all (e.g. a physical card
scan by an anonymous fan).

### Orders & digital fulfillment (currently: not persisted at all)

- **`webhook_event`** — id (the Shopify webhook id itself, PK — this *is*
  the dedupe key, replacing the in-memory `Set` in
  `src/app/api/webhooks/shopify/route.ts`), topic, receivedAt, payload
  (jsonb, raw body — cheap insurance for replay/debugging), processedAt
  (nullable), status (`PENDING` | `PROCESSED` | `FAILED`), error (nullable)

- **`order`** — id (uuid), shopifyOrderId (unique), orderNumber,
  customerEmail, shopifyCustomerId (nullable — Shopify's own customer GID,
  not a local FK; see linking note below), status (`PENDING` | `PAID` |
  `CANCELLED` | `REFUNDED`, matches the existing `OrderStatus` type),
  createdAt, updatedAt

- **`order_line_item`** — id, orderId → order.id, shopifyLineItemId,
  productHandle (Shopify product handle, e.g. `human-machine-digital`),
  releaseHandle (nullable, denormalized from the product's `custom.*`
  metafield so reads don't need to hit Shopify again), variantId, title,
  quantity, fulfillmentProviderId (`LOCAL` | `ELASTICSTAGE` |
  `PRINT_PROVIDER` | `NIX_INTERNAL` | `DIGITAL`), fulfillmentStatus
  (`PENDING` | `IN_PRODUCTION` | `PACKED` | `SHIPPED` | `DELIVERED` |
  `FAILED`), externalReference (nullable), trackingUrl (nullable),
  createdAt, updatedAt — this is the persisted form of the `Order`/
  `OrderLineItem` domain types that `FulfillmentService` already works with
  in memory

- **`digital_download`** — id, orderLineItemId → order_line_item.id
  (unique — one grant per digital line item), releaseHandle, token
  (unique, opaque — same pattern as the artifact token), r2Key (e.g.
  `releases/<handle>/download/<handle>.zip`), downloadCount (default 0),
  lastDownloadedAt (nullable), expiresAt (nullable, optional link-expiry
  policy), createdAt

**Order→customer linking:** the `orders/paid` webhook payload includes the
Shopify customer id directly if the buyer was identified at checkout —
store it straight into `order.shopifyCustomerId`, no lookup needed (unlike
the earlier Better Auth-based plan, there's no separate local `user` table
to join against). If checkout happened as a guest (no `customer` on the
payload), `shopifyCustomerId` stays null and only `customerEmail` is known.
**Open question, not yet investigated:** whether our headless cart/checkout
flow currently carries a logged-in customer's identity through to Shopify's
checkout at all, or if it's guest-only regardless of Customer Account API
login state — that determines how often `shopifyCustomerId` actually gets
populated automatically. Check `src/lib/shopify/cart.ts` / the checkout
redirect before relying on this.

**Digital download flow (replaces the `DigitalDeliveryAdapter` stub, which
today unconditionally reports `DELIVERED` without producing anything):** on
`orders/paid`, for each `DIGITAL` line item, create a `digital_download` row
with a fresh token, then email the customer (or show on an order/account
page) a link like `/download/<token>`. That route validates the token,
generates a **fresh** signed R2 URL on request (never store the signed URL
itself — only the R2 key), and increments `downloadCount`. Actually sending
that email needs a provider too — same open dependency as auth's
verification email.

### Deliberately not modeled yet

**Subscriptions** — `src/lib/domain/subscription.ts` already has types
(`SubscriptionPlan`, `Subscription`, tiers FAN/COLLECTOR/INNER_CIRCLE) but
they're explicitly not wired to anything. Leave out of the DB for now; a
`subscription` table referencing `user.id` slots in cleanly later without
disturbing anything above.

## Entity relationships

```
order 1─* order_line_item
order_line_item 1─0..1 digital_download
artifact 1─* artifact_access_event
```

No `user` table — `order.shopifyCustomerId` and `artifact.ownerCustomerId`
hold a Shopify customer GID directly (a plain string, not a foreign key);
Shopify's Customer Account API is the only identity provider.

`artifact.releaseHandle` and `order_line_item.releaseHandle` are loose
string references to `src/content/releases.ts` handles, not foreign keys —
there's no `release` table (see "what stays as-is" above).

## Open decisions (need your input before implementing)

1. ~~Postgres provider + ORM~~ — settled: Neon + Drizzle, both live.
2. **Phasing.** Order/webhook/digital-download tables are next — say if you
   want to sequence that differently.
3. **Digital download delivery email.** Still needs an outbound email
   provider (auth no longer does, now that it's Shopify-hosted) — not
   chosen yet, will block the digital-download flow from being fully live.
4. **Cart/checkout buyer identity**, flagged above — needs a look before the
   order→customer linking design can be trusted to work as described.
