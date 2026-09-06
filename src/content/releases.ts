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
    tracks: [
      { title: "Hello, How Can I Help You", durationSeconds: 339, streamKey: "releases/hello-how-can-i-help-you/stream/01-hello-how-can-i-help-you.mp3" },
      { title: "Insert Coin for Empathy", durationSeconds: 237, streamKey: "releases/hello-how-can-i-help-you/stream/02-insert-coin-for-empathy.mp3" },
      { title: "Pins & Wheels (User Error)", durationSeconds: 179, streamKey: "releases/hello-how-can-i-help-you/stream/03-pins-wheels-user-error.mp3" },
      { title: "Insert Coin (Refund Denied)", durationSeconds: 384, streamKey: "releases/hello-how-can-i-help-you/stream/04-insert-coin-refund-denied.mp3" },
      { title: "Goggles Never Lie", durationSeconds: 280, streamKey: "releases/hello-how-can-i-help-you/stream/05-goggles-never-lie.mp3" },
      { title: "Cognitive Drift", durationSeconds: 256, streamKey: "releases/hello-how-can-i-help-you/stream/06-cognitive-drift.mp3" },
      { title: "Wind-Organ Customer Service", durationSeconds: 215, streamKey: "releases/hello-how-can-i-help-you/stream/07-wind-organ-customer-service.mp3" },
      { title: "Confusion Gauge (220V of Missing You)", durationSeconds: 340, streamKey: "releases/hello-how-can-i-help-you/stream/08-confusion-gauge-220v-missing-you.mp3" },
      { title: "Ticket 404 — Cosmic Waiting Room", durationSeconds: 275, streamKey: "releases/hello-how-can-i-help-you/stream/09-ticket-404-cosmic-waiting-room.mp3" },
      { title: "Heart Firewall (403 Forbidden)", durationSeconds: 273, streamKey: "releases/hello-how-can-i-help-you/stream/10-heart-firewall-403-forbidden.mp3" },
      { title: "Sandbox Love", durationSeconds: 370, streamKey: "releases/hello-how-can-i-help-you/stream/11-sandbox-love.mp3" },
    ],
    productHandles: ["hello-how-can-i-help-you-digital", "hello-how-can-i-help-you-cd", "hello-how-can-i-help-you-vinyl"],
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
    tracks: [
      { title: "Mano al Aire", durationSeconds: 273, streamKey: "releases/mano-al-aire/stream/01-mano-al-aire.mp3" },
      { title: "Pa Sanlucar", durationSeconds: 215, streamKey: "releases/mano-al-aire/stream/02-pa-sanlucar.mp3" },
      { title: "Camino a Casa", durationSeconds: 373, streamKey: "releases/mano-al-aire/stream/03-camino-a-casa.mp3" },
      { title: "Marie Black", durationSeconds: 347, streamKey: "releases/mano-al-aire/stream/04-marie-black.mp3" },
      { title: "SuMaRe", durationSeconds: 193, streamKey: "releases/mano-al-aire/stream/05-sumare.mp3" },
      { title: "Sonrisa Bolera", durationSeconds: 320, streamKey: "releases/mano-al-aire/stream/06-sonrisa-bolera.mp3" },
      { title: "Lamentos Del Moro", durationSeconds: 287, streamKey: "releases/mano-al-aire/stream/07-lamentos-del-moro.mp3" },
      { title: "Oriente", durationSeconds: 229, streamKey: "releases/mano-al-aire/stream/08-oriente.mp3" },
      { title: "Penezziando", durationSeconds: 238, streamKey: "releases/mano-al-aire/stream/09-penezziando.mp3" },
    ],
    productHandles: ["mano-al-aire-digital", "mano-al-aire-cd", "mano-al-aire-vinyl"],
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
    tracks: [
      { title: "Guadalquivir", durationSeconds: 271, streamKey: "releases/guadalquivir/stream/01-guadalquivir.mp3" },
      { title: "Calle De Los Ingleses", durationSeconds: 193, streamKey: "releases/guadalquivir/stream/02-calle-de-los-ingleses.mp3" },
      { title: "Ojos Negros", durationSeconds: 248, streamKey: "releases/guadalquivir/stream/03-ojos-negros.mp3" },
      { title: "Tangos Molinero", durationSeconds: 212, streamKey: "releases/guadalquivir/stream/04-tangos-molinero.mp3" },
      { title: "Castro De La Rua", durationSeconds: 253, streamKey: "releases/guadalquivir/stream/05-castro-de-la-rua.mp3" },
      { title: "Viento y Arena", durationSeconds: 258, streamKey: "releases/guadalquivir/stream/06-viento-y-arena.mp3" },
      { title: "Sin Medias Palabras", durationSeconds: 230, streamKey: "releases/guadalquivir/stream/07-sin-medias-palabras.mp3" },
      { title: "Improviso a Tientos", durationSeconds: 281, streamKey: "releases/guadalquivir/stream/08-improviso-a-tientos.mp3" },
      { title: "Olivares", durationSeconds: 270, streamKey: "releases/guadalquivir/stream/09-olivares.mp3" },
    ],
    productHandles: ["guadalquivir-digital", "guadalquivir-cd", "guadalquivir-vinyl"],
  },
  {
    handle: "jazz-iberico",
    artistHandle: "tito-gonzales",
    title: "Jazz Ibérico",
    coverImage: "/images/CD-jazz-iberico.jpg",
    releaseDate: "2026",
    tracks: [
      { title: "Safira", durationSeconds: 232, streamKey: "releases/jazz-iberico/stream/01-safira.mp3" },
      { title: "Bajo La Luna (Acoustic)", durationSeconds: 274, streamKey: "releases/jazz-iberico/stream/02-bajo-la-luna-acoustic.mp3" },
      { title: "Fabricia", durationSeconds: 200, streamKey: "releases/jazz-iberico/stream/03-fabricia.mp3" },
      { title: "Hecho a Mano (Bulería)", durationSeconds: 309, streamKey: "releases/jazz-iberico/stream/04-hecho-a-mano-buleria.mp3" },
      { title: "Mi B", durationSeconds: 229, streamKey: "releases/jazz-iberico/stream/05-mi-b.mp3" },
      { title: "Pa Helva", durationSeconds: 202, streamKey: "releases/jazz-iberico/stream/06-pa-helva.mp3" },
      { title: "Seville", durationSeconds: 238, streamKey: "releases/jazz-iberico/stream/07-seville.mp3" },
      { title: "La Aura", durationSeconds: 267, streamKey: "releases/jazz-iberico/stream/08-la-aura.mp3" },
      { title: "Waltz For Branca", durationSeconds: 194, streamKey: "releases/jazz-iberico/stream/09-waltz-for-branca.mp3" },
    ],
    productHandles: ["jazz-iberico-digital", "jazz-iberico-cd", "jazz-iberico-vinyl"],
  },
];

export function getReleaseByHandle(handle: string): Release | undefined {
  return RELEASES.find((r) => r.handle === handle);
}

export function getReleasesByArtist(artistHandle: string): Release[] {
  return RELEASES.filter((r) => r.artistHandle === artistHandle);
}
