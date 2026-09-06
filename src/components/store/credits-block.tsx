export function CreditsBlock({ credits }: { credits: string }) {
  return (
    <div className="text-sm text-muted-foreground">
      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-foreground">Credits</p>
      <p className="whitespace-pre-wrap">{credits}</p>
    </div>
  );
}
