/**
 * Creates a Digital Artifact record and prints the token/URL to put on a
 * physical card's QR code (PRD §9-12). No UI exists for this on purpose —
 * artifact creation is a catalog-management operation, run by whoever is
 * producing a batch of cards, not a storefront feature.
 *
 * Usage:
 *   pnpm artifact:create --release hello-how-can-i-help-you --track Tangerine \
 *     --campaign nix-launch --edition 2/100
 */
import { artifactStore } from "../src/lib/artifacts/store";
import { artifactUrl } from "../src/lib/artifacts/token";

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

  if (!args.release) {
    console.error("Usage: pnpm artifact:create --release <handle> [--track <title>] [--campaign <name>] [--edition <n>/<total>]");
    process.exit(1);
  }

  let edition: { number: number; of: number } | undefined;
  if (args.edition) {
    const [number, of] = args.edition.split("/").map(Number);
    edition = { number, of };
  }

  const artifact = await artifactStore.create({
    releaseHandle: args.release,
    trackTitle: args.track,
    campaign: args.campaign,
    edition,
  });

  console.log("Artifact created:");
  console.log(`  token:      ${artifact.token}`);
  console.log(`  artifactId: ${artifact.artifactId}`);
  console.log(`  url:        https://moonfield.com${artifactUrl(artifact.token)}`);
  console.log("Encode the url above as a QR code for the physical card.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
