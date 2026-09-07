# Release playbook

Checklist for taking a finished album (master WAVs + cover art) from local
files to a live, purchasable release on Moonfield Store. Reverse-engineered
from how "Human Machine" and "Hello, How Can I Help You?" were shipped.

No UI exists for any of this on purpose (PRD: the storefront is
catalog/artifact *viewing* only) — it's all offline scripts run by whoever is
producing the release.

## 0. Prerequisites (once per store)

- `.env.local` has: Shopify Admin + Storefront tokens
  (`docs/shopify-admin-scopes.md` lists the Admin scopes needed), and
  Cloudflare R2 credentials — `CLOUDFLARE_ACCOUNT_ID`, `R2_ENDPOINT`,
  `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` (private),
  `R2_PUBLIC_BUCKET` + `R2_PUBLIC_URL` (public).
- Run `pnpm shopify:setup-metafields` at least once. It's idempotent (safe
  to re-run) but **must** run before the *first* product is ever created —
  see the gotcha below.
- `ffmpeg` installed locally (used to derive FLAC/MP3 from the WAV masters —
  no separate `flac` binary needed).

## 1. Source assets needed per release

- One 24-bit/48kHz (or better) mastered WAV per track.
- Cover image, dropped into `public/images/` (referenced by the `Release`'s
  `coverImage` field — this repo's own `public/`, not R2).
- Optional: lyrics/credits text if you're doing per-track Digital Artifacts
  (step 5) or want a `custom.credits` metafield (step 4).

## 2. Per-track audio processing + R2 upload

**Storage model (as of 2026-09-07):** individual master WAV/FLAC files are
archived by the user in Google Drive, not duplicated into R2 — R2 only
stores what's actually *served*: the public preview stream (per track) and
one pre-built ZIP per release (the purchase-fulfillment artifact, since
Moonfield sells releases, not individual tracks — no per-track digital
download exists or is planned). This replaced an earlier approach that also
uploaded every master WAV/FLAC to R2 individually; those older objects
(`releases/<handle>/master-wav/`, `.../hd-flac/`) are left in place for
releases shipped before this change (not backed up to Drive yet) — don't
delete them without checking with the user first.

Pick a release `handle` (kebab-case, matches the album title) and a
zero-padded numeric slug per track, e.g. `01-track-title`. For each track:

```bash
# 1. Lossless copy, kept locally (not uploaded individually — see below)
ffmpeg -y -i "<master.wav>" -c:a flac "<slug>.flac"

# 2. Full-length preview stream (NOT trimmed — the 60s cap in
#    src/components/store/track-player.tsx is client-side only, see below)
ffmpeg -y -i "<master.wav>" -c:a libmp3lame -b:a 256k "<slug>.mp3"

# 3. Upload only the stream preview (public bucket)
pnpm release:upload --release <handle> --kind stream --file "<slug>.mp3" --key "<slug>.mp3" --public
```

Do this for every track, keeping each `<slug>.flac` on disk (e.g. in the same
local folder as the source WAVs) — don't delete them. Once every track is
encoded, zip the FLACs into one archive and upload just that:

```bash
# From the folder containing all the .flac files for this release
zip -j "<handle>.zip" *.flac

# Private bucket — this is the file a customer's purchase eventually unlocks
pnpm release:upload --release <handle> --kind download --file "<handle>.zip" --key "<handle>.zip"
```

This lands objects at:
- public: `releases/<handle>/stream/<slug>.mp3` (one per track)
- `r2://releases/<handle>/download/<handle>.zip` (private, one per release)

Leave the local WAV masters and the `.flac` files where they are — the user
archives them to Google Drive separately, on their own schedule. Don't
delete local FLAC/WAV files after this step; unlike the MP3 stream files
(fully reproducible from the WAV at any time), right now the FLACs are not
yet backed up anywhere else.

**Why the stream preview is a separate public bucket:** "listen before you
buy" — openly streamable, no signing overhead, architecturally separate from
the gated Digital Artifact experience. **Known tradeoff:** this means the
full MP3 is directly fetchable by anyone who finds the URL — the 60-second
cap (`PREVIEW_LIMIT_SECONDS` in `src/components/store/track-player.tsx`)
only stops playback client-side, it is not real DRM. Don't "fix" this by
moving previews to signed URLs unless asked; if real protection is ever
wanted, the correct fix is serving actual trimmed clips, not signing the
full files.

Get each track's duration for the content step below with:
```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 "<master.wav>"
```

**Note:** actual purchase fulfillment (emailing/serving a signed URL to the
ZIP when an order pays) is not built yet — `src/lib/fulfillment/adapters/
digital-delivery.adapter.ts` is still a stub. This step only gets the ZIP
into R2 so it's ready once that's built.

## 3. Add the release to the content layer

In `src/content/releases.ts`, add (or fill in) a `Release` entry:

```ts
{
  handle: "<handle>",
  artistHandle: "<artist-handle>",
  title: "<Display Title>",
  coverImage: "/images/<file>",
  releaseDate: "<year>",
  tracks: [
    { title: "<Track Title>", durationSeconds: <n>, streamKey: "releases/<handle>/stream/<slug>.mp3" },
    // ...one per track, in album order
  ],
  productHandles: [], // filled in after step 4
}
```

If it's a new artist, also add them to `src/content/artists.ts` and list
this release's handle in their `releaseHandles`.

## 4. Create Shopify product(s)

One product per format. Formats and their presets (fulfillment provider,
production mode, Shopify product type) live in
`scripts/create-shopify-product.ts`'s `FORMAT_PRESETS` — currently `digital`,
`cd`, `vinyl`.

```bash
pnpm shopify:product --release <handle> --format digital --price <n> --status active \
  --description "<short blurb>" \
  --credits "<liner notes, optional, max 1000 chars>"

pnpm shopify:product --release <handle> --format cd --price <n> --status active --sku <sku>
pnpm shopify:product --release <handle> --format vinyl --price <n> --status active --sku <sku>
```

Each run:
- Creates (or updates, if re-run with the same handle/format) a Shopify
  product at handle `<handle>-<format>`.
- Uploads `public/images/<coverImage>` as the product's cover, unless
  `--cover skip`.
- Sets `custom.product_type`, `custom.fulfillment_provider`,
  `custom.production_mode`, `custom.artist_handle`, `custom.release_handle`,
  and (if passed) `custom.credits` metafields.
- Sets the price (and `--compare-at` if given).
- Publishes to the "Moonfield Headless" sales channel, unless
  `--publish skip`.
- `--status draft` (the default) creates it unlisted/unpurchasable;
  `--status active` makes it live and purchasable immediately — this is
  the "activate the product for the store" step.

After all format products exist, update that release's `productHandles` in
`src/content/releases.ts` with the handles just created, e.g.
`["<handle>-digital", "<handle>-cd", "<handle>-vinyl"]`.

**Gotcha (confirmed the hard way):** a metafield definition needs
`access.storefront: PUBLIC_READ` to be visible via the Storefront API —
writing the value via `productSet` is not enough on its own. If
`pnpm shopify:setup-metafields` hasn't been run yet for a given `custom.*`
key, values will show correctly in Shopify Admin but come back `null` on the
storefront. Running the metafield setup *after* the fact does not
retroactively fix already-created products — re-run `pnpm shopify:product`
for that product once the definition exists.

**`custom.credits` has a hard 1000-character limit**, enforced both by the
metafield definition and by the script itself before it calls Shopify.

## 5. Optional: per-track Digital Artifact QR cards

A separate, optional product line — not required to sell the release. This
is the gated "scan a physical card, unlock a track's audio + lyrics"
experience (PRD §9-12), distinct from the storefront preview player.

```bash
# One per track
pnpm artifact:create --release <handle> --track "<Track Title>" --campaign <handle>-launch [--edition <n>/<total>]
# prints a token + URL — encode that URL as a QR code for the physical card

pnpm artifact:upload --token <token> --kind audio   --file "<track>.mp3"
pnpm artifact:upload --token <token> --kind lyrics  --file "<lyrics>.md"
# --kind also accepts: video | visual | story | credits
```

Artifact assets always go to the *private* bucket
(`artifacts/<handle>/<token>/<kind>.<ext>`), read back via short-lived
signed URLs (`getSignedAssetUrl` in `src/lib/cloudflare/r2.ts`) — never the
public bucket used for storefront previews. "Human Machine" shipped 10 of
these (one per non-bonus track), campaign name `human-machine-launch`.

## 6. Sanity check before calling it done

- Release page renders all tracks with correct durations and the preview
  player streams each one.
- Each format's product page shows the price, cover image, description, and
  (if set) credits.
- Products are `active` and visible on the Moonfield Headless channel if
  that was the intent — a product can exist and still be invisible to the
  storefront if it's `draft` or unpublished.
