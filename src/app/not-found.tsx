"use client";

import Link from "next/link";
import { Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { pickRandomWebsitePath } from "@/lib/websites";

const REVEALED_WEBSITES_KEY = "random-webs-revealed-websites";

function readRevealedWebsites() {
  try {
    const savedWebsites = window.localStorage.getItem(REVEALED_WEBSITES_KEY);
    const parsedWebsites: unknown = savedWebsites
      ? JSON.parse(savedWebsites)
      : [];

    return Array.isArray(parsedWebsites)
      ? parsedWebsites.filter(
          (savedPath): savedPath is string => typeof savedPath === "string",
        )
      : [];
  } catch {
    return [];
  }
}

function revealWebsite(revealedWebsites: string[], path: string) {
  try {
    window.localStorage.setItem(
      REVEALED_WEBSITES_KEY,
      JSON.stringify(Array.from(new Set([...revealedWebsites, path]))),
    );
  } catch {
    // Navigation still works when browser storage is unavailable.
  }
}

export default function NotFound() {
  const router = useRouter();
  const isNavigating = useRef(false);
  const [loading, setLoading] = useState(false);

  const exploreRandomWebsite = () => {
    if (isNavigating.current) {
      return;
    }

    isNavigating.current = true;
    setLoading(true);

    const revealedWebsites = readRevealedWebsites();
    const randomPage = pickRandomWebsitePath(revealedWebsites);

    revealWebsite(revealedWebsites, randomPage);

    window.setTimeout(() => {
      router.push(randomPage);
    }, 500);
  };

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center bg-black px-6 text-center text-white"
      style={{
        fontFamily:
          'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      }}
    >
      <div>
        <h1 className="m-[0_20px_0_0] inline-block border-r border-white/30 pr-5.75 align-top text-3xl font-medium leading-14 sm:m-[0_24px_0_0] sm:pr-6 sm:text-[2.375rem] sm:leading-16">
          404
        </h1>
        <div className="inline-block">
          <h2 className="m-0 text-sm font-normal leading-14 sm:text-base sm:leading-16">
            This page could not be found.
          </h2>
        </div>
      </div>

      <div className="mt-8 flex w-full max-w-3xl flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={exploreRandomWebsite}
          disabled={loading}
          className="group inline-flex min-h-16 items-center justify-center gap-4 rounded-full border border-white/12 bg-zinc-100 px-6 py-5 text-sm font-black uppercase tracking-[0.18em] text-black transition-opacity duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:translate-y-px disabled:cursor-wait disabled:opacity-70 sm:px-10 sm:text-base sm:tracking-[0.28em]"
        >
          <Shuffle
            aria-hidden="true"
            className="h-5 w-5 shrink-0 transition-transform duration-500 group-hover:rotate-180"
          />
          <span aria-live="polite">
            {loading ? "Finding a website" : "Explore Random Website"}
          </span>
        </button>

        <Link
          href="/"
          className="inline-flex min-h-16 items-center justify-center rounded-full border border-white/20 px-6 py-5 text-sm font-black uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:translate-y-px sm:px-10 sm:text-base sm:tracking-[0.28em]"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
}
