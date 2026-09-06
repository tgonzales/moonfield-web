import type { Metadata } from "next";
import { RoundmapView } from "./roundmap-view";
import "./roundmap.css";

export const metadata: Metadata = {
  title: "Remaster & Release Plan — Moonfield Records",
  robots: { index: false, follow: false },
};

export default function RoundmapPage() {
  return <RoundmapView />;
}
