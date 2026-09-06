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
      { title: "Weight of Time", durationSeconds: 218, streamKey: "releases/human-machine/stream/01-weight-of-time.mp3" },
      { title: "Shadow of My Heart", durationSeconds: 234, streamKey: "releases/human-machine/stream/02-shadow-of-my-heart.mp3" },
      { title: "Human Machine", durationSeconds: 300, streamKey: "releases/human-machine/stream/03-human-machine.mp3" },
      { title: "Fading Hours", durationSeconds: 223, streamKey: "releases/human-machine/stream/04-fading-hours.mp3" },
      { title: "Velvet Threads of Time", durationSeconds: 247, streamKey: "releases/human-machine/stream/05-velvet-threads-of-time.mp3" },
      { title: "Illusion's Grip", durationSeconds: 254, streamKey: "releases/human-machine/stream/06-illusions-grip.mp3" },
      { title: "The Last Horizon", durationSeconds: 216, streamKey: "releases/human-machine/stream/07-the-last-horizon.mp3" },
      { title: "Unknown Self", durationSeconds: 265, streamKey: "releases/human-machine/stream/08-unknown-self.mp3" },
      { title: "Chasing You", durationSeconds: 436, streamKey: "releases/human-machine/stream/09-chasing-you.mp3" },
      { title: "Fragments of a Forgotten Dawn", durationSeconds: 263, streamKey: "releases/human-machine/stream/10-fragments-of-a-forgotten-dawn.mp3" },
    ],
    productHandles: ["human-machine-digital", "human-machine-cd", "human-machine-vinyl"],
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
