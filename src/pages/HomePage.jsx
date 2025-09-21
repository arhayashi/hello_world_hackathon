import React from "react";
// If you're using React Router, swap <a> for <Link> and use `to="/..."`

export default function HomePage() {
  return (
    <main className="min-h-screen grid place-items-center px-4 bg-zinc-50">
      <div className="w-full max-w-sm sm:max-w-md text-center">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900">
          Welcome
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Start Session (light) */}
          <a
            href="/chat"
            className="inline-flex h-12 w-full items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200"
          >
            Start Session
          </a>

          {/* Join Session (matte dark grey) */}
          <a
            href="/join"
            className="inline-flex h-12 w-full items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-800/90 focus:outline-none focus:ring-4 focus:ring-zinc-300/30"
          >
            Join Session
          </a>
        </div>
      </div>
    </main>
  );
}
