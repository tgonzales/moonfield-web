import type { Metadata } from "next";
import Link from "next/link";
import { cormorantGaramond, inter, fontMono } from "@/components/marketing/fonts";
import { Reveal } from "@/components/marketing/reveal";
import { ParallaxLayer } from "@/components/marketing/parallax-layer";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import "./home.css";

export const metadata: Metadata = {
  title: "Moonfield Records — Music for imagined worlds",
  description:
    "Moonfield Records is an independent record label dedicated to timeless music, cinematic soundscapes and artistic storytelling.",
};

const serif = cormorantGaramond.style.fontFamily;
const sans = inter.style.fontFamily;

const artists = [
  {
    name: "Tito Gonzales",
    image: "/images/tito.png",
    bio: "Composer, producer and multi-instrumentalist exploring cinematic, ambient and progressive music.",
  },
  {
    name: "NiX",
    image: "/images/nix.png",
    bio: "An imaginary band where rock, storytelling and artificial intelligence meet.",
  },
  {
    name: "Anahy",
    image: "/images/anahy.png",
    bio: "Organic voices, poetic melodies and intimate soundscapes.",
  },
];

const albums = [
  { title: "Human Machine", artist: "NiX", year: "2025", cover: "/images/CD-capa-human-machine.jpeg" },
  { title: "Hello, How Can I Help You?", artist: "NiX", year: "2025", cover: "/images/CD-capa-hello-how-i-can-help-you.jpg" },
  { title: "Mano Al Aire", artist: "Tito Gonzales", year: "2024", cover: "/images/CD-mano-al-aire.jpeg" },
  { title: "Out Of My Time", artist: "NiX", year: "2024", cover: "/images/CD-out-of-my-time.jpg" },
  { title: "Playground Groove", artist: "Tito Gonzales", year: "2023", cover: "/images/CD-Playground%20Groove.jpeg" },
  { title: "Children of Glass", artist: "NiX", year: "2023", cover: "/images/CD-children-of-glass.jpg" },
  { title: "Guadalquivír", artist: "Tito Gonzales", year: "2022", cover: "/images/guadalquivir.jpeg" },
];

const syncUses = ["Films", "Television", "Advertising", "Games", "Documentaries", "Streaming"];

export default function HomePage() {
  return (
    <div className="mf-home" style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", overflowX: "hidden", fontFamily: sans }}>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px clamp(24px,5vw,72px)",
          background: "var(--nav-bg)",
          backdropFilter: "saturate(160%) blur(18px)",
          WebkitBackdropFilter: "saturate(160%) blur(18px)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <a href="#top" style={{ fontFamily: serif, fontSize: 22, fontWeight: 500, letterSpacing: "0.01em", color: "var(--text)" }}>
          Moonfield
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(18px,3vw,40px)" }}>
          <a href="#artists" style={{ fontSize: 13, letterSpacing: "0.04em", color: "var(--muted)" }}>Artists</a>
          <a href="#discography" style={{ fontSize: 13, letterSpacing: "0.04em", color: "var(--muted)" }}>Discography</a>
          <a href="#licensing" style={{ fontSize: 13, letterSpacing: "0.04em", color: "var(--muted)" }}>Licensing</a>
          <a href="#contact" style={{ fontSize: 13, letterSpacing: "0.04em", color: "var(--muted)" }}>Contact</a>
          <Link href="/releases" style={{ fontSize: 13, letterSpacing: "0.04em", color: "var(--muted)" }}>Shop</Link>
          <ThemeToggle className="nav-toggle" />
        </div>
      </nav>

      {/* HERO */}
      <header id="top" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <ParallaxLayer
            factor={0.18}
            style={{
              position: "absolute",
              inset: "-8% 0",
              backgroundColor: "var(--secondary)",
              backgroundImage: "url('/images/chamber-jazz-2.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.48)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg) 2%, transparent 46%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 2, width: "100%", padding: "0 clamp(24px,5vw,72px) clamp(64px,9vh,120px)" }}>
          <div style={{ maxWidth: 1000 }}>
            <Reveal as="p" style={{ fontFamily: fontMono, fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 28 }}>
              Independent Record Label
            </Reveal>
            <Reveal
              as="h1"
              delay={120}
              style={{ fontFamily: serif, fontWeight: 300, fontSize: "clamp(48px,8.5vw,132px)", lineHeight: 0.94, letterSpacing: "-0.02em", marginBottom: 34 }}
            >
              Music for<br />imagined worlds.
            </Reveal>
            <Reveal
              as="p"
              delay={240}
              style={{ fontFamily: sans, fontWeight: 300, fontSize: "clamp(17px,1.5vw,21px)", lineHeight: 1.6, color: "var(--muted)", maxWidth: 600, marginBottom: 44 }}
            >
              Moonfield Records is an independent record label dedicated to timeless music, cinematic soundscapes and artistic storytelling.
            </Reveal>
            <Reveal as="div" delay={360} style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <a
                href="#artists"
                className="cta-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "var(--text)",
                  color: "var(--bg)",
                  padding: "16px 32px",
                  borderRadius: 100,
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  transition: "background 0.4s ease, color 0.4s ease",
                }}
              >
                Explore Artists
              </a>
              <a
                href="#discography"
                className="cta-secondary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "16px 32px",
                  borderRadius: 100,
                  border: "1px solid var(--line-strong)",
                  color: "var(--text)",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  transition: "border-color 0.4s ease",
                }}
              >
                Discography
              </a>
            </Reveal>
          </div>
        </div>
      </header>

      {/* ABOUT */}
      <section style={{ padding: "clamp(100px,15vw,200px) clamp(24px,5vw,72px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: "clamp(40px,6vw,90px)" }}>
          <Reveal as="h2" style={{ fontFamily: serif, fontWeight: 300, fontSize: "clamp(34px,6vw,88px)", lineHeight: 1.0, letterSpacing: "-0.02em", maxWidth: "14ch" }}>
            Where sound becomes landscape.
          </Reveal>
          <Reveal
            as="div"
            delay={120}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(28px,4vw,64px)", maxWidth: 1000, marginLeft: "auto" }}
          >
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: "clamp(16px,1.3vw,19px)", lineHeight: 1.7, color: "var(--muted)" }}>
              Moonfield Records creates music that lives beyond genres.
            </p>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: "clamp(16px,1.3vw,19px)", lineHeight: 1.7, color: "var(--muted)" }}>
              Our work explores silence, atmosphere, memory and imagination through albums, instrumental works, cinematic productions and audiovisual storytelling.
            </p>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: "clamp(16px,1.3vw,19px)", lineHeight: 1.7, color: "var(--muted)" }}>
              Every release is conceived as a complete artistic experience where music, visual identity and narrative become one.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ARTISTS */}
      <section id="artists" style={{ padding: "clamp(80px,10vw,140px) clamp(24px,5vw,72px)", background: "var(--secondary)", transition: "background 0.6s ease" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <Reveal
            as="div"
            style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: "clamp(48px,6vw,84px)" }}
          >
            <h2 style={{ fontFamily: serif, fontWeight: 300, fontSize: "clamp(34px,5vw,72px)", lineHeight: 1, letterSpacing: "-0.02em" }}>Artists</h2>
            <p style={{ fontFamily: fontMono, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--faint)" }}>Three worlds · one label</p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(28px,3vw,44px)" }}>
            {artists.map((artist, i) => (
              <Reveal key={artist.name} as="article" delay={i * 120} style={{ display: "flex", flexDirection: "column" }}>
                <div
                  className="artist-image-wrap"
                  style={{ position: "relative", aspectRatio: "1", borderRadius: 6, overflow: "hidden", background: "#000", transition: "transform 0.7s cubic-bezier(.22,.61,.36,1)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={artist.image} alt={artist.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(26px,2.4vw,36px)", letterSpacing: "-0.01em", margin: "26px 0 12px" }}>{artist.name}</h3>
                <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 15, lineHeight: 1.65, color: "var(--muted)", marginBottom: 22 }}>{artist.bio}</p>
                <a
                  href="#discography"
                  className="discover-link"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text)", marginTop: "auto" }}
                >
                  Discover <span style={{ fontFamily: "serif" }}>→</span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DISCOGRAPHY */}
      <section id="discography" style={{ padding: "clamp(100px,13vw,180px) 0" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 clamp(24px,5vw,72px)" }}>
          <Reveal
            as="div"
            style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: "clamp(40px,5vw,72px)" }}
          >
            <h2 style={{ fontFamily: serif, fontWeight: 300, fontSize: "clamp(34px,5vw,72px)", lineHeight: 1, letterSpacing: "-0.02em" }}>Discography</h2>
            <p style={{ fontFamily: fontMono, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--faint)" }}>Scroll →</p>
          </Reveal>
        </div>
        <Reveal
          as="div"
          style={{ display: "flex", gap: "clamp(20px,2.4vw,36px)", overflowX: "auto", padding: "10px clamp(24px,5vw,72px) 40px", scrollSnapType: "x mandatory" }}
        >
          {albums.map((album) => (
            <article key={album.title} style={{ flex: "0 0 auto", width: "clamp(260px,30vw,380px)", scrollSnapAlign: "start" }}>
              <div
                className="album-cover"
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: 4,
                  overflow: "hidden",
                  backgroundColor: "var(--secondary)",
                  boxShadow: "var(--shadow)",
                  transition: "transform 0.7s cubic-bezier(.22,.61,.36,1), box-shadow 0.7s ease",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={album.cover} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ marginTop: 22 }}>
                <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(22px,2vw,30px)", letterSpacing: "-0.01em" }}>{album.title}</h3>
                <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: "var(--muted)", marginTop: 6 }}>
                  {album.artist} · {album.year}
                </p>
              </div>
            </article>
          ))}
        </Reveal>
      </section>

      {/* PHONOGRAPHIC PRODUCTION + AUDIOVISUAL */}
      <section style={{ padding: "clamp(80px,10vw,150px) clamp(24px,5vw,72px)", background: "var(--secondary)", transition: "background 0.6s ease" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "clamp(48px,7vw,110px)" }}>
          <Reveal as="div">
            <p style={{ fontFamily: fontMono, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 24 }}>01 — Studio</p>
            <h2 style={{ fontFamily: serif, fontWeight: 300, fontSize: "clamp(30px,3.6vw,52px)", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 26 }}>
              Phonographic Production
            </h2>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: "clamp(16px,1.2vw,18px)", lineHeight: 1.75, color: "var(--muted)", maxWidth: "46ch" }}>
              From composition to mastering, Moonfield Records develops complete musical productions with an obsessive attention to artistic identity, sonic quality and emotional impact.
            </p>
          </Reveal>
          <Reveal as="div" delay={140}>
            <p style={{ fontFamily: fontMono, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 24 }}>02 — Vision</p>
            <h2 style={{ fontFamily: serif, fontWeight: 300, fontSize: "clamp(30px,3.6vw,52px)", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 26 }}>
              Audiovisual Storytelling
            </h2>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: "clamp(16px,1.2vw,18px)", lineHeight: 1.75, color: "var(--muted)", maxWidth: "46ch", marginBottom: 16 }}>
              Music extends beyond listening.
            </p>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: "clamp(16px,1.2vw,18px)", lineHeight: 1.75, color: "var(--muted)", maxWidth: "46ch" }}>
              We create visual narratives, album artwork, films, music videos and conceptual experiences that transform sound into imagery.
            </p>
          </Reveal>
        </div>
      </section>

      {/* SYNC LICENSING */}
      <section id="licensing" style={{ padding: "clamp(100px,13vw,180px) clamp(24px,5vw,72px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(48px,6vw,90px)", alignItems: "start" }}>
          <Reveal as="div">
            <p style={{ fontFamily: fontMono, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 24 }}>Sync Licensing</p>
            <h2 style={{ fontFamily: serif, fontWeight: 300, fontSize: "clamp(32px,4.4vw,64px)", lineHeight: 1.02, letterSpacing: "-0.02em", marginBottom: 26 }}>
              Music for Film &amp; Media
            </h2>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: "clamp(16px,1.2vw,18px)", lineHeight: 1.7, color: "var(--muted)", maxWidth: "42ch" }}>
              Original compositions and curated catalog available for a wide range of visual and interactive media.
            </p>
          </Reveal>
          <Reveal as="div" delay={140} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderTop: "1px solid var(--line)" }}>
            {syncUses.map((use) => (
              <div key={use} style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 8px", borderBottom: "1px solid var(--line)" }}>
                <span style={{ width: 6, height: 6, borderRadius: 100, background: "var(--accent)", flex: "0 0 auto" }} />
                <span style={{ fontFamily: serif, fontSize: "clamp(20px,1.8vw,26px)", fontWeight: 400 }}>{use}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* A&R */}
      <section style={{ padding: "clamp(80px,10vw,150px) clamp(24px,5vw,72px)", background: "var(--secondary)", transition: "background 0.6s ease" }}>
        <Reveal as="div" style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: fontMono, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 26 }}>A&amp;R</p>
          <h2 style={{ fontFamily: serif, fontWeight: 300, fontSize: "clamp(32px,4.6vw,64px)", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 30 }}>
            Curated Collaborations
          </h2>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: "clamp(16px,1.3vw,20px)", lineHeight: 1.75, color: "var(--muted)", marginBottom: 18 }}>
            Moonfield collaborates with artists whose work values authenticity, imagination and long-term artistic vision.
          </p>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: "clamp(16px,1.3vw,20px)", lineHeight: 1.75, color: "var(--muted)" }}>
            Rather than volume, we seek meaningful creative partnerships.
          </p>
        </Reveal>
      </section>

      {/* MANIFESTO */}
      <section style={{ padding: "clamp(120px,18vw,240px) clamp(24px,5vw,72px)" }}>
        <Reveal as="div" style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <blockquote
            style={{ fontFamily: serif, fontWeight: 300, fontStyle: "italic", fontSize: "clamp(44px,8vw,120px)", lineHeight: 1.0, letterSpacing: "-0.02em", marginBottom: 44 }}
          >
            &ldquo;We don&rsquo;t chase trends.<br />We build worlds.&rdquo;
          </blockquote>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: "clamp(15px,1.2vw,18px)", lineHeight: 1.75, color: "var(--muted)", maxWidth: "56ch", margin: "0 auto" }}>
            A manifesto for slowness and intention — every note, image and silence placed in service of a world worth returning to.
          </p>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer id="contact" style={{ background: "var(--secondary)", borderTop: "1px solid var(--line)", padding: "clamp(64px,7vw,110px) clamp(24px,5vw,72px) 40px", transition: "background 0.6s ease" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 48, marginBottom: "clamp(56px,8vw,100px)" }}>
            <div>
              <a href="#top" style={{ fontFamily: serif, fontSize: "clamp(30px,3vw,44px)", fontWeight: 400, color: "var(--text)", letterSpacing: "-0.01em" }}>
                Moonfield Records
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <span style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 6 }}>Explore</span>
              <a href="#artists" className="footer-link" style={{ fontSize: 14, color: "var(--muted)" }}>Artists</a>
              <a href="#discography" className="footer-link" style={{ fontSize: 14, color: "var(--muted)" }}>Discography</a>
              <a href="#licensing" className="footer-link" style={{ fontSize: 14, color: "var(--muted)" }}>Licensing</a>
              <a href="#contact" className="footer-link" style={{ fontSize: 14, color: "var(--muted)" }}>Contact</a>
              <Link href="/releases" className="footer-link" style={{ fontSize: 14, color: "var(--muted)" }}>Shop</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <span style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 6 }}>Follow</span>
              <a href="#" className="footer-link" style={{ fontSize: 14, color: "var(--muted)" }}>Instagram</a>
              <a href="#" className="footer-link" style={{ fontSize: 14, color: "var(--muted)" }}>YouTube</a>
              <a href="#" className="footer-link" style={{ fontSize: 14, color: "var(--muted)" }}>Bandcamp</a>
              <a href="#" className="footer-link" style={{ fontSize: 14, color: "var(--muted)" }}>Substack</a>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, paddingTop: 28, borderTop: "1px solid var(--line)" }}>
            <p style={{ fontFamily: sans, fontSize: 12, color: "var(--faint)" }}>© 2026 Moonfield Records. All rights reserved.</p>
            <p style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--faint)" }}>Music for imagined worlds</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
