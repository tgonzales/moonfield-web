import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArtistByHandle } from "@/content/artists";
import { getReleasesByArtist } from "@/content/releases";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const artist = getArtistByHandle(handle);
  if (!artist) notFound();

  const releases = getReleasesByArtist(handle);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr] md:items-center">
        <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
          <Image src={artist.image} alt={artist.name} fill sizes="240px" className="object-cover" />
        </div>
        <div>
          <h1 className="font-serif text-4xl">{artist.name}</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">{artist.bio}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-serif text-2xl">Releases</h2>
        {releases.length === 0 ? (
          <p className="text-sm text-muted-foreground">No releases published yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {releases.map((release) => (
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
                {release.releaseDate && (
                  <p className="text-xs text-muted-foreground">{release.releaseDate}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
