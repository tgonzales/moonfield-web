const FORMAT_LABELS: Record<string, string> = {
  DIGITAL: "Digital",
  CD: "CD",
  VINYL: "Vinyl",
};

export function formatKeyFor(shopifyProductType: string): string {
  const upper = shopifyProductType.toUpperCase();
  if (upper.includes("DIGITAL")) return "DIGITAL";
  if (upper.includes("VINYL")) return "VINYL";
  if (upper.includes("CD")) return "CD";
  return upper;
}

export function formatLabelFor(key: string): string {
  return FORMAT_LABELS[key] ?? key;
}
