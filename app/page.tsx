import Link from "next/link";

export default function Home() {
  return (
    <main className="auth-shell flex-col gap-6 text-center">
      <h1 className="text-4xl font-semibold text-slate-900">
        Production Auth Module Ready
      </h1>
      <p className="max-w-xl text-sm text-slate-700">
        Use the links below to test signup/login flow, JWT refresh, route protection,
        and logout behavior.
      </p>
      <div className="flex gap-3">
        <Link
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/85"
          href="/login"
        >
          Login
        </Link>
        <Link
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          href="/signup"
        >
          Signup
        </Link>
        <Link
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          href="/dashboard"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}
