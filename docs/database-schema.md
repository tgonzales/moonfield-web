# Database schema plan

Proposed relational schema for Moonfield Store's first real database. Written
against what exists today (see file-by-file references) — not a from-scratch
design. Nothing here is implemented yet; this is the plan to review before
building.

## What moves into the DB, and what doesn't

| Stays as-is | Moves into the DB |
|---|---|
| `src/content/releases.ts` / `artists.ts` (static, git-versioned) | Auth (new) |
| Shopify: products, prices, variants, inventory, orders/payment | Digital Artifacts (`src/lib/artifacts/store.ts` — currently a JSON file, explicitly flagged as not persisting on Vercel) |
| | Order/fulfillment tracking (currently not persisted at all) |
| | Webhook dedupe (currently an in-memory `Set`, lost on every cold start) |

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

## Suggested build order (independent of what you pick for auth)

1. **Wire up the DB + ORM.** Migrate the artifact store onto it — fixes the
   prod-persistence bug and proves the setup end-to-end with something small.
2. **Auth tables** (Better Auth, email/password) — unblocks login and the
   streaming-tier gate.
3. **Order / webhook / digital-download tables** — unblocks real digital
   fulfillment (the ZIP-per-release work in `docs/release-playbook.md`) and
   makes the webhook handler idempotent under retries.

## Entities

### Auth (Better Auth's standard schema)

Don't hand-author these — generate them from Better Auth's CLI/adapter once
the ORM is chosen (`npx @better-auth/cli generate` or the Drizzle/Prisma
adapter's migration), since the exact columns are Better Auth's contract and
can shift between versions. Shape, for planning purposes:

- **`user`** — id, name, email, emailVerified, image, createdAt, updatedAt
- **`session`** — id, userId → user.id, token, expiresAt, ipAddress,
  userAgent, createdAt, updatedAt
- **`account`** — id, userId → user.id, accountId, providerId
  (`"credential"` for email/password), password (hashed), createdAt,
  updatedAt
- **`verification`** — id, identifier, value, expiresAt, createdAt,
  updatedAt (email verification + password reset tokens)

Config: `emailAndPassword: { enabled: true }`, no OAuth providers. Email
verification / password reset needs an email-sending provider wired in —
not chosen yet, flag as a dependency when this phase starts.

### Digital Artifacts (replaces `src/data/artifacts.dev.json`)

Mirrors the existing `Artifact` type in `src/lib/domain/artifact.ts` exactly,
so `src/lib/artifacts/store.ts`'s interface (`getByToken`, `create`,
`recordAccess`, `updateAssets`, `revoke`) can be reimplemented against the DB
with no changes needed above that layer.

- **`artifact`** — artifactId (pk), token (unique), releaseHandle,
  trackTitle (nullable), campaign (nullable), status (`GENERATED` |
  `UNUSED` | `ACTIVATED` | `ACCESSED`), editionNumber (nullable), editionOf
  (nullable), ownerCustomerId (nullable — see note below), firstAccessAt
  (nullable), lastAccessAt (nullable), accessCount (default 0), createdAt,
  audioKey / videoKey / storyKey / creditsKey / lyricsKey (nullable, R2
  keys), visualKeys (array of R2 keys)
- **`artifact_access_event`** — id, artifactId → artifact.artifactId,
  accessedAt, ipHash (nullable). The `ArtifactAccessEvent` type already
  exists in the domain layer but has nowhere to persist today — this gives
  it a home.

`ownerCustomerId` can become a real FK to `user.id` once auth exists; keep it
a loose nullable string until then (an artifact can be scanned/owned before
any account system exists, e.g. a physical card scan by an anonymous fan).

### Orders & digital fulfillment (currently: not persisted at all)

- **`webhook_event`** — id (the Shopify webhook id itself, PK — this *is*
  the dedupe key, replacing the in-memory `Set` in
  `src/app/api/webhooks/shopify/route.ts`), topic, receivedAt, payload
  (jsonb, raw body — cheap insurance for replay/debugging), processedAt
  (nullable), status (`PENDING` | `PROCESSED` | `FAILED`), error (nullable)

- **`order`** — id (uuid), shopifyOrderId (unique), orderNumber,
  customerEmail, userId (nullable FK → user.id — see linking note below),
  status (`PENDING` | `PAID` | `CANCELLED` | `REFUNDED`, matches the
  existing `OrderStatus` type), createdAt, updatedAt

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

**Order→user linking (guest checkout is the default):** Shopify checkout
stays guest-friendly — no account required to buy. At `orders/paid` webhook
time, look up `user` by `customerEmail`; set `order.userId` if found, else
leave it null. On login, backfill: match `session.user.email` against any
`order.customerEmail` with `userId IS NULL` and claim them. This is the
standard pattern for bolting accounts onto an already-live guest checkout.

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
user 1─* session
user 1─* account
user 1─0..* order            (nullable FK — guest orders allowed)
order 1─* order_line_item
order_line_item 1─0..1 digital_download
artifact 1─* artifact_access_event
```

`artifact.releaseHandle` and `order_line_item.releaseHandle` are loose
string references to `src/content/releases.ts` handles, not foreign keys —
there's no `release` table (see "what stays as-is" above).

## Open decisions (need your input before implementing)

1. **Postgres provider + ORM.** Vercel no longer offers its own Postgres —
   provisioning goes through the Marketplace now (Neon is the common
   choice). For the ORM, Drizzle pairs directly with Better Auth's official
   adapter and fits serverless/Fluid Compute better than Prisma's heavier
   runtime. Both are just my default recommendation — say if you've already
   picked something while setting up the database.
2. **Phasing.** Build order above (artifacts → auth → orders) is a
   suggestion, not a requirement — say if you want a different order or all
   three at once.
3. **Email delivery.** Both auth (verification/reset) and digital download
   delivery need an outbound email provider — not chosen yet, out of scope
   for this schema doc but will block both features from being fully live.
