import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Digital Artifact media (audio, video, story/credits/lyrics text, visuals)
 * lives in a private Cloudflare R2 bucket, never in Shopify. The storefront
 * only ever reads from R2 — content is written exclusively by the offline
 * scripts in /scripts, never by an upload flow inside the app (PRD: this
 * store is catalog/artifact *viewing* only).
 *
 * R2 is S3-compatible, so the standard AWS SDK works against its endpoint.
 *
 * No `server-only` guard here (unlike src/lib/shopify/client.ts): this
 * module is also imported by the plain-Node scripts in /scripts, which
 * `server-only` would break. Never import this from a Client Component.
 */
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const endpoint = process.env.R2_ENDPOINT ?? (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

export const isR2Configured = Boolean(endpoint && accessKeyId && secretAccessKey && bucket);

/**
 * Public bucket (separate from the private one above) for assets that are
 * fine to serve without signing — track previews for the storefront player
 * (PRD-adjacent: "listen before you buy" is not the gated Artifact
 * experience, so it doesn't need a signed, expiring URL).
 */
const publicBucket = process.env.R2_PUBLIC_BUCKET;
const publicBaseUrl = process.env.R2_PUBLIC_URL;
export const isR2PublicConfigured = Boolean(publicBaseUrl);
const isR2PublicWriteConfigured = Boolean(endpoint && accessKeyId && secretAccessKey && publicBucket);

export function publicAssetUrl(key: string): string {
  if (!publicBaseUrl) {
    throw new Error("R2_PUBLIC_URL is not configured.");
  }
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${publicBaseUrl}/${encodedKey}`;
}

/** Only ever called from /scripts — never from a request handler. */
export async function putPublicAsset(key: string, body: Buffer, contentType: string): Promise<void> {
  if (!isR2PublicWriteConfigured) {
    throw new Error("Cloudflare R2 public bucket is not configured (missing endpoint, bucket or credentials).");
  }
  await client().send(
    new PutObjectCommand({ Bucket: publicBucket, Key: key, Body: body, ContentType: contentType }),
  );
}

const DEFAULT_SIGNED_URL_TTL_SECONDS = Number(process.env.R2_SIGNED_URL_TTL_SECONDS ?? 3600);

function client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: endpoint as string,
    credentials: { accessKeyId: accessKeyId as string, secretAccessKey: secretAccessKey as string },
  });
}

/** Used by the artifact landing page to build a short-lived URL for a private asset. */
export async function getSignedAssetUrl(
  key: string,
  expiresInSeconds = DEFAULT_SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  if (!isR2Configured) {
    throw new Error("Cloudflare R2 is not configured (missing endpoint, bucket or credentials).");
  }
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client(), command, { expiresIn: expiresInSeconds });
}

/** Used for text assets (story/credits/lyrics markdown) rendered directly on the page. */
export async function getAssetText(key: string): Promise<string | null> {
  if (!isR2Configured) return null;
  try {
    const result = await client().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return (await result.Body?.transformToString()) ?? null;
  } catch {
    return null;
  }
}

/** Only ever called from /scripts — never from a request handler. */
export async function putAsset(key: string, body: Buffer, contentType: string): Promise<void> {
  if (!isR2Configured) {
    throw new Error("Cloudflare R2 is not configured (missing endpoint, bucket or credentials).");
  }
  await client().send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
  );
}
