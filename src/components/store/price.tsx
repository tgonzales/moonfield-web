export function formatMoney(amount: string | number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

export function Price({ amount, currencyCode }: { amount: string | number; currencyCode: string }) {
  return <span>{formatMoney(amount, currencyCode)}</span>;
}
