import Image from "next/image";
import Link from "next/link";
import { RELEASES } from "@/content/releases";
import { getArtistByHandle } from "@/content/artists";

export const metadata = { title: "Releases — Moonfield Store" };

export default function ReleasesPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-3xl">Releases</h1>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {RELEASES.map((release) => {
          const artist = getArtistByHandle(release.artistHandle);
          return (
            <Link key={release.handle} href={`/releases/${release.handle}`} className="group flex flex-col gap-2">
              <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
                <Image
                  src={release.coverImage}
                  alt={release.title}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <p className="text-sm font-medium">{release.title}</p>
              <p className="text-xs text-muted-foreground">
                {artist?.name}
                {release.releaseDate ? ` · ${release.releaseDate}` : ""}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
