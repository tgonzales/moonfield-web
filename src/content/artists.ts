import type { Artist } from "@/lib/domain";

/**
 * PRD §18 — Moonfield is multi-artist; NiX is the first tenant, not the
 * ceiling of the architecture. Sourced from the current landing page's
 * Artists/Discography sections.
 */
export const ARTISTS: Artist[] = [
  {
    handle: "nix",
    name: "NiX",
    bio: "An imaginary band where rock, storytelling and artificial intelligence meet.",
    image: "/images/nix.png",
    releaseHandles: [
      "human-machine",
      "hello-how-can-i-help-you",
      "out-of-my-time",
      "children-of-glass",
    ],
  },
  {
    handle: "tito-gonzales",
    name: "Tito Gonzales",
    bio: "Composer, producer and multi-instrumentalist exploring cinematic, ambient and progressive music.",
    image: "/images/tito.png",
    releaseHandles: ["mano-al-aire", "playground-groove", "guadalquivir"],
  },
  {
    handle: "anahy",
    name: "Anahy",
    bio: "Moonfield artist. Discography in development.",
    image: "/images/anahy.png",
    releaseHandles: [],
  },
];

export function getArtistByHandle(handle: string): Artist | undefined {
  return ARTISTS.find((a) => a.handle === handle);
}
