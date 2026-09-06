export const metadata = { title: "Account — Moonfield Store" };

/**
 * PRD §2 (non-goals) — full customer accounts are not part of the MVP.
 * Placeholder so /account resolves and the nav can link somewhere real.
 */
export default function AccountPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-3xl">Account</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Customer accounts are coming soon. Order confirmations are sent by email after checkout.
      </p>
    </div>
  );
}
