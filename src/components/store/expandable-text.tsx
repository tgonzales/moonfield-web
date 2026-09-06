"use client";

import { useState } from "react";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Shows an HTML blurb truncated to `maxChars` (plain-text length) with a Read more/Show less toggle. */
export function ExpandableText({ html, maxChars = 200 }: { html: string; maxChars?: number }) {
  const [expanded, setExpanded] = useState(false);
  const plain = stripHtml(html);

  if (plain.length <= maxChars) {
    return (
      <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: html }} />
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {expanded ? (
        <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="text-sm text-muted-foreground">{plain.slice(0, maxChars).trimEnd()}…</p>
      )}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="text-xs font-medium uppercase tracking-wide text-foreground underline underline-offset-2"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
