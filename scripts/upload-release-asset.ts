/**
 * Uploads a release-level file (HD master WAV, FLAC, etc.) to R2 under
 * releases/{release}/{kind}/{filename} — not tied to any Digital Artifact.
 * For content that belongs to the release/product itself rather than the
 * QR-card experience (see scripts/upload-artifact-asset.ts for that case).
 *
 * Usage:
 *   pnpm release:upload --release human-machine --kind master-wav --file ./01.wav
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { putAsset } from "../src/lib/cloudflare/r2";

const CONTENT_TYPES: Record<string, string> = {
  ".wav": "audio/wav",
  ".flac": "audio/flac",
  ".mp3": "audio/mpeg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

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
  const { release, kind, file } = args;

  if (!release || !kind || !file) {
    console.error("Usage: pnpm release:upload --release <handle> --kind <label> --file <path>");
    process.exit(1);
  }

  const ext = path.extname(file).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    console.error(`Unrecognized file extension "${ext}". Add it to CONTENT_TYPES in this script.`);
    process.exit(1);
  }

  const filename = path.basename(file);
  const key = `releases/${release}/${kind}/${filename}`;
  const body = readFileSync(file);

  await putAsset(key, body, contentType);
  console.log(`Uploaded ${file} -> r2://${key}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
