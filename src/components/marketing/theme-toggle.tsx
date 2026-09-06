"use client";

import { useEffect, useState, type CSSProperties } from "react";

const baseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "transparent",
  border: "1px solid var(--line-strong)",
  color: "var(--text)",
  borderRadius: 100,
  padding: "8px 16px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  cursor: "pointer",
};

/**
 * Reproduces the original Design Canvas theme toggle: local component state,
 * default 'dark', mirrored onto `document.documentElement[data-theme]`.
 * State is per-page (not shared across routes), matching the original where
 * each static page carried its own independent theme instance.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label="Toggle color theme"
      className={className}
      style={baseStyle}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
