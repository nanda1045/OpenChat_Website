import Link from "next/link";

export const metadata = { title: "Sign-in failed — OpenChat" };

export default function AuthCodeError() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Sign-in didn’t complete</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Something went wrong exchanging your Google login. Please try again.
      </p>
      <Link
        href="/"
        className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
      >
        Back home
      </Link>
    </main>
  );
}
