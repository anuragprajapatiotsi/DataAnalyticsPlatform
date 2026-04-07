import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#f8fafc] overflow-hidden">
      <div className="flex flex-col items-center gap-8 text-center px-6">

        {/* 404 */}
        <div className="relative select-none">
          <span className="text-[9rem] font-extrabold leading-none tracking-tight text-slate-100">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-[4rem] font-extrabold text-slate-800">
            404
          </span>
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-600">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Under Construction
        </span>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Great things take time.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-slate-500">
            This page is currently being crafted with care — our team is busy
            turning ideas into something remarkable. Check back soon, it&apos;ll
            be worth the wait.
          </p>
        </div>

        {/* Divider dots */}
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span className="h-1.5 w-6 rounded-full bg-slate-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 active:bg-slate-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Take me home
        </Link>
      </div>
    </div>
  );
}
