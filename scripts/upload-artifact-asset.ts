/**
 * Uploads one local media/text file to the private Cloudflare R2 bucket and
 * links it to an existing Digital Artifact. Content only ever enters the
 * system this way — never through the storefront (PRD: catalog/artifact
 * viewing only, no in-app uploads).
 *
 * Usage:
 *   pnpm artifact:upload --token 8F72K91QRT --kind audio --file ./tangerine.mp3
 *
 * --kind is one of: audio | video | visual | story | credits | lyrics
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { artifactStore } from "../src/lib/artifacts/store";
import { putAsset } from "../src/lib/cloudflare/r2";
import type { ArtifactAssets } from "../src/lib/domain";

const CONTENT_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".md": "text/markdown",
  ".txt": "text/plain",
};

const ASSET_KEY_FIELD: Record<string, keyof ArtifactAssets> = {
  audio: "audioKey",
  video: "videoKey",
  story: "storyKey",
  credits: "creditsKey",
  lyrics: "lyricsKey",
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
  const { token, kind, file } = args;

  if (!token || !kind || !file) {
    console.error("Usage: pnpm artifact:upload --token <token> --kind <audio|video|visual|story|credits|lyrics> --file <path>");
    process.exit(1);
  }

  const artifact = await artifactStore.getByToken(token);
  if (!artifact) {
    console.error(`No artifact found for token "${token}". Create it first with pnpm artifact:create.`);
    process.exit(1);
  }

  const ext = path.extname(file).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    console.error(`Unrecognized file extension "${ext}". Add it to CONTENT_TYPES in this script.`);
    process.exit(1);
  }

  const key = `artifacts/${artifact.releaseHandle}/${token}/${kind}${ext}`;
  const body = readFileSync(file);

  await putAsset(key, body, contentType);
  console.log(`Uploaded ${file} -> r2://${key}`);

  if (kind === "visual") {
    const existing = artifact.assets?.visualKeys ?? [];
    await artifactStore.updateAssets(token, { visualKeys: [...existing, key] });
  } else {
    const field = ASSET_KEY_FIELD[kind];
    if (!field) {
      console.error(`Unknown --kind "${kind}". Use audio, video, visual, story, credits or lyrics.`);
      process.exit(1);
    }
    await artifactStore.updateAssets(token, { [field]: key });
  }

  console.log(`Linked to artifact ${artifact.artifactId} (${token}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
