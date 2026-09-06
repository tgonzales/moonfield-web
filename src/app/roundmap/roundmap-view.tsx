"use client";

import { useState } from "react";
import Link from "next/link";
import { cormorantGaramond, inter, fontMono } from "@/components/marketing/fonts";
import { ThemeToggle } from "@/components/marketing/theme-toggle";

const serif = cormorantGaramond.style.fontFamily;
const sans = inter.style.fontFamily;

type Release = { title: string; year?: string; subtitle?: string; date: string };
type ReleaseGroup = { label?: string; items: Release[] };

const titoGroups: ReleaseGroup[] = [
  {
    items: [
      { title: "Guadalquivír", year: "2002", date: "07/2026" },
      { title: "Templanza", year: "2005", date: "07/2026" },
      { title: "Mano Al Aire", year: "2007", date: "07/2026" },
      { title: "Jazz Ibérico", year: "2011", date: "11/2025" },
    ],
  },
  {
    items: [
      { title: "El Pátio", year: "2012", date: "08/2026" },
      { title: "Aire", year: "2012", date: "08/2026" },
      { title: "Brisa", year: "2013", date: "08/2026" },
    ],
  },
  {
    items: [
      { title: "Playground Groove", year: "2023", date: "09/2026" },
      { title: "Hi Chuck", year: "2023", date: "10/2026" },
      { title: "Stringfire", year: "2025", date: "11/2026" },
      { title: "Stringfire II", year: "2025", date: "12/2026" },
    ],
  },
  {
    label: "Live",
    items: [{ title: "The Imaginary Band", subtitle: "Live from an Empty Stadium", date: "02/2027" }],
  },
  {
    items: [{ title: "Andalusian", year: "2024", date: "04/2027" }],
  },
  {
    items: [
      { title: "Next Stop", date: "06/2027" },
      { title: "See You Soon", date: "08/2027" },
      { title: "Slowly Fast", date: "10/2027" },
      { title: "Another Good Day", date: "12/2027" },
    ],
  },
  {
    label: "Collections",
    items: [{ title: "Mediterranean Chamber Jazz", year: "2026", subtitle: "Vol. 1, 2, 3, 4", date: "01/2027" }],
  },
];

const nixGroups: ReleaseGroup[] = [
  {
    items: [
      { title: "Human Machine", year: "2025", date: "08/2026" },
      { title: "Hello, How Can I Help You?", year: "2025", date: "08/2026" },
      { title: "Children of Glass", year: "2023", date: "08/2026" },
      { title: "Out Of My Time", year: "2024", date: "08/2026" },
      { title: "Let It Burn", date: "10/2026" },
      { title: "Fly Butterfly", date: "12/2026" },
      { title: "Echo Chamber", date: "02/2027" },
      { title: "NiX Live", subtitle: "Live album", date: "04/2027" },
      { title: "Afterlight", date: "06/2027" },
      { title: "Clockwork Butterflies", date: "08/2027" },
    ],
  },
];

const anahyGroups: ReleaseGroup[] = [
  {
    items: [
      { title: "Lyra", date: "10/2026" },
      { title: "Silenced", date: "03/2027" },
      { title: "The Girl And The Owl", date: "06/2027" },
    ],
  },
];

type Tab = "tito" | "nix" | "anahy";

const tabs: { key: Tab; label: string; groups: ReleaseGroup[] }[] = [
  { key: "tito", label: "Tito Gonzales", groups: titoGroups },
  { key: "nix", label: "NiX", groups: nixGroups },
  { key: "anahy", label: "Anahy", groups: anahyGroups },
];

export function RoundmapView() {
  const [tab, setTab] = useState<Tab>("tito");

  const activeGroups = tabs.find((t) => t.key === tab)?.groups ?? [];
  const activeCount = activeGroups.reduce((total, group) => total + group.items.length, 0);

  return (
    <div className="mf-roundmap" style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", overflowX: "hidden", fontFamily: sans }}>
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
        <Link href="/" className="back-link" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, letterSpacing: "0.04em", color: "var(--muted)" }}>
          <span style={{ fontFamily: "serif" }}>←</span> Moonfield
        </Link>
        <ThemeToggle className="nav-toggle" />
      </nav>

      <header style={{ padding: "clamp(140px,18vw,200px) clamp(24px,5vw,72px) clamp(40px,6vw,64px)" }}>
        <div style={{ maxWidth: 900 }}>
          <p style={{ fontFamily: fontMono, fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 24 }}>
            Internal · Roadmap
          </p>
          <h1 style={{ fontFamily: serif, fontWeight: 300, fontSize: "clamp(38px,6vw,84px)", lineHeight: 1.02, letterSpacing: "-0.02em", marginBottom: 22 }}>
            Remaster &amp; Release Plan{" "}
            <span style={{ fontSize: "0.42em", fontFamily: sans, fontWeight: 300, letterSpacing: 0, color: "var(--faint)", whiteSpace: "nowrap" }}>
              ({activeCount} albums)
            </span>
          </h1>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 15, lineHeight: 1.7, color: "var(--faint)", maxWidth: "56ch" }}>
            Planned catalog of remasters, new originals and live releases, by artist. Dates subject to change.
          </p>
        </div>
      </header>

      <div style={{ position: "sticky", top: 65, zIndex: 50, background: "var(--bg)", borderBottom: "1px solid var(--line)", padding: "0 clamp(24px,5vw,72px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: "clamp(20px,3vw,40px)" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="tab-button"
              data-active={tab === t.key}
              style={{
                fontFamily: serif,
                fontSize: "clamp(16px,1.6vw,19px)",
                fontWeight: 400,
                padding: "14px 2px",
                border: "none",
                borderBottom: `2px solid ${tab === t.key ? "var(--text)" : "transparent"}`,
                background: "transparent",
                color: tab === t.key ? "var(--text)" : "var(--faint)",
                cursor: "pointer",
                transition: "color 0.3s ease, border-color 0.3s ease",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ padding: "clamp(48px,6vw,72px) clamp(24px,5vw,72px) clamp(140px,16vw,200px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {activeGroups.map((group, gi) => (
            <section key={`${tab}-${gi}`} style={{ marginBottom: "clamp(48px,6vw,72px)" }}>
              {group.label ? (
                <p style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 18 }}>
                  {group.label}
                </p>
              ) : null}
              <div style={{ borderTop: "1px solid var(--line)" }}>
                {group.items.map((release, ri) => (
                  <div
                    key={`${release.title}-${ri}`}
                    style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 24, padding: "20px 0", borderBottom: "1px solid var(--line)" }}
                  >
                    <div>
                      <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(20px,2vw,28px)", letterSpacing: "-0.01em" }}>
                        {release.title}
                        {release.year ? (
                          <span style={{ fontFamily: sans, fontWeight: 300, fontSize: 15, color: "var(--faint)", marginLeft: 10 }}>{release.year}</span>
                        ) : null}
                      </h3>
                      {release.subtitle ? (
                        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: "var(--muted)", marginTop: 4 }}>{release.subtitle}</p>
                      ) : null}
                    </div>
                    <span
                      style={{
                        flex: "0 0 auto",
                        fontFamily: fontMono,
                        fontSize: 12,
                        letterSpacing: "0.08em",
                        color: "var(--text)",
                        border: "1px solid var(--line-strong)",
                        borderRadius: 100,
                        padding: "6px 14px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {release.date}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
