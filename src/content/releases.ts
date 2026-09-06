import type { Release } from "@/lib/domain";

/**
 * PRD §5 — Release sits between Artist and Product. `productHandles` is
 * empty until matching Shopify products exist (the store currently only
 * has Shopify's sample catalog) — wire them up once real NiX/Tito products
 * are created in Shopify admin.
 */
export const RELEASES: Release[] = [
  {
    handle: "human-machine",
    artistHandle: "nix",
    title: "Human Machine",
    coverImage: "/images/CD-capa-human-machine.jpeg",
    releaseDate: "2025",
    tracks: [
      { title: "Weight of Time", durationSeconds: 218 },
      { title: "Shadow of My Heart", durationSeconds: 234 },
      { title: "Human Machine", durationSeconds: 300 },
      { title: "Fading Hours", durationSeconds: 223 },
      { title: "Velvet Threads of Time", durationSeconds: 247 },
      { title: "Illusion's Grip", durationSeconds: 254 },
      { title: "The Last Horizon", durationSeconds: 216 },
      { title: "Unknown Self", durationSeconds: 265 },
      { title: "Chasing You", durationSeconds: 436 },
      { title: "Fragments of a Forgotten Dawn", durationSeconds: 263 },
    ],
    productHandles: [],
  },
  {
    handle: "hello-how-can-i-help-you",
    artistHandle: "nix",
    title: "Hello, How Can I Help You?",
    coverImage: "/images/CD-capa-hello-how-i-can-help-you.jpg",
    releaseDate: "2025",
    tracks: [],
    productHandles: [],
  },
  {
    handle: "out-of-my-time",
    artistHandle: "nix",
    title: "Out Of My Time",
    coverImage: "/images/CD-out-of-my-time.jpg",
    releaseDate: "2024",
    tracks: [],
    productHandles: [],
  },
  {
    handle: "children-of-glass",
    artistHandle: "nix",
    title: "Children of Glass",
    coverImage: "/images/CD-children-of-glass.jpg",
    releaseDate: "2023",
    tracks: [],
    productHandles: [],
  },
  {
    handle: "mano-al-aire",
    artistHandle: "tito-gonzales",
    title: "Mano Al Aire",
    coverImage: "/images/CD-mano-al-aire.jpeg",
    releaseDate: "2024",
    tracks: [],
    productHandles: [],
  },
  {
    handle: "playground-groove",
    artistHandle: "tito-gonzales",
    title: "Playground Groove",
    coverImage: "/images/CD-Playground Groove.jpeg",
    releaseDate: "2023",
    tracks: [],
    productHandles: [],
  },
  {
    handle: "guadalquivir",
    artistHandle: "tito-gonzales",
    title: "Guadalquivír",
    coverImage: "/images/guadalquivir.jpeg",
    releaseDate: "2022",
    tracks: [],
    productHandles: [],
  },
];

export function getReleaseByHandle(handle: string): Release | undefined {
  return RELEASES.find((r) => r.handle === handle);
}

export function getReleasesByArtist(artistHandle: string): Release[] {
  return RELEASES.filter((r) => r.artistHandle === artistHandle);
}
