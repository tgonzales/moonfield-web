import Link from "next/link";

export const metadata = { title: "Sign-in error — Moonfield Store" };

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="font-serif text-3xl">Something went wrong signing in</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The login link may have expired or already been used. Try signing in again.
      </p>
      <Link href="/auth/login" className="underline">
        Try again
      </Link>
    </div>
  );
}
