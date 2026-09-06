"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type ParallaxLayerProps = {
  factor?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Reproduces the original Design Canvas `data-parallax` hero background
 * drift: translateY(scrollY * factor), applied via direct style mutation
 * (not React state) to avoid re-render churn on scroll.
 */
export function ParallaxLayer({ factor = 0.15, className, style }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      el.style.transform = `translateY(${(y * factor).toFixed(1)}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [factor]);

  return <div ref={ref} className={className} style={{ willChange: "transform", ...style }} />;
}
