import Link from "next/link";
import Image from "next/image";
import { ARTISTS } from "@/content/artists";

export const metadata = { title: "Artists — Moonfield Store" };

export default function ArtistsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-3xl">Artists</h1>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        {ARTISTS.map((artist) => (
          <Link key={artist.handle} href={`/artists/${artist.handle}`} className="group flex flex-col gap-3">
            <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <div>
              <h2 className="font-serif text-xl">{artist.name}</h2>
              <p className="text-sm text-muted-foreground">{artist.bio}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
