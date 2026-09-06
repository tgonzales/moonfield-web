import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} Moonfield Records</p>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-foreground">
            Moonfield.com
          </Link>
          <Link href="/account" className="hover:text-foreground">
            Account
          </Link>
        </div>
      </div>
    </footer>
  );
}
