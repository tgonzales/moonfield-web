/**
 * Uploads a release-level file (HD master WAV, FLAC, public stream preview,
 * etc.) to R2 under releases/{release}/{kind}/{filename} — not tied to any
 * Digital Artifact. For content that belongs to the release/product itself
 * rather than the QR-card experience (see scripts/upload-artifact-asset.ts
 * for that case).
 *
 * Usage:
 *   pnpm release:upload --release human-machine --kind master-wav --file ./01.wav
 *   pnpm release:upload --release human-machine --kind stream --file ./01.mp3 --key 01-weight-of-time.mp3 --public
 *
 * --public writes to the public bucket (R2_PUBLIC_BUCKET) and prints the
 * permanent public URL — use only for content that's fine to be openly
 * streamable (product-page previews), never Artifact or master content.
 * --key overrides the destination filename (default: the source file's own
 * basename) — use it to avoid spaces/punctuation in public URLs.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { publicAssetUrl, putAsset, putPublicAsset } from "../src/lib/cloudflare/r2";

const CONTENT_TYPES: Record<string, string> = {
  ".wav": "audio/wav",
  ".flac": "audio/flac",
  ".mp3": "audio/mpeg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

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
  const release = args.release as string | undefined;
  const kind = args.kind as string | undefined;
  const file = args.file as string | undefined;
  const isPublic = Boolean(args.public);
  const keyOverride = args.key as string | undefined;

  if (!release || !kind || !file) {
    console.error(
      "Usage: pnpm release:upload --release <handle> --kind <label> --file <path> [--key <filename>] [--public]",
    );
    process.exit(1);
  }

  const ext = path.extname(file).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    console.error(`Unrecognized file extension "${ext}". Add it to CONTENT_TYPES in this script.`);
    process.exit(1);
  }

  const filename = keyOverride ?? path.basename(file);
  const key = `releases/${release}/${kind}/${filename}`;
  const body = readFileSync(file);

  if (isPublic) {
    await putPublicAsset(key, body, contentType);
    console.log(`Uploaded ${file} -> ${publicAssetUrl(key)}`);
  } else {
    await putAsset(key, body, contentType);
    console.log(`Uploaded ${file} -> r2://${key}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
