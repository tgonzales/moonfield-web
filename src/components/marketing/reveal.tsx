"use client";

import { createElement, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

type RevealProps = {
  as?: ElementType;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
  children: ReactNode;
};

/**
 * Reproduces the original Design Canvas `data-reveal` / `data-reveal-delay`
 * scroll-in behavior (IntersectionObserver, threshold 0.14, -6% root margin).
 */
export function Reveal({ as = "div", delay, className, style, id, children }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (!("IntersectionObserver" in window)) return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only needs to attach once per mount
  }, []);

  const revealStyle: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : "translateY(30px)",
    transition: "opacity 1.1s cubic-bezier(.22,.61,.36,1), transform 1.1s cubic-bezier(.22,.61,.36,1)",
    transitionDelay: delay ? `${delay}ms` : undefined,
    willChange: "opacity, transform",
    ...style,
  };

  // `as` is always a lowercase DOM tag string in this codebase, so forwarding
  // a host-element ref here is safe even though the linter can't prove it statically.
  // eslint-disable-next-line react-hooks/refs
  return createElement(as as string, { ref, id, className, style: revealStyle }, children);
}
