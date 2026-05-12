import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <Link
        href="/auth/login"
        className="w-full max-w-xs rounded-xl bg-white px-6 py-4 text-center text-lg font-semibold text-black transition hover:bg-gray-200 sm:w-auto"
      >
        Login
      </Link>
    </main>
  );
}