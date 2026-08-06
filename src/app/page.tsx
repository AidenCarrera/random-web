"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { pickRandomWebsitePath, WEBSITES } from "@/lib/websites";

const REVEALED_WEBSITES_KEY = "random-webs-revealed-websites";

function maskText(value: string) {
  return value.replace(/\S/g, "?");
}

export default function Home() {
  const router = useRouter();
  const isNavigating = useRef(false);
  const [loading, setLoading] = useState(false);
  const [revealedWebsites, setRevealedWebsites] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      setIsMounted(true);
      const savedWebsites = window.localStorage.getItem(REVEALED_WEBSITES_KEY);

      if (!savedWebsites) {
        return;
      }

      try {
        const parsedWebsites = JSON.parse(savedWebsites);

        if (Array.isArray(parsedWebsites)) {
          setRevealedWebsites(parsedWebsites);
        }
      } catch {
        window.localStorage.removeItem(REVEALED_WEBSITES_KEY);
      }
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const visitRandomWebsite = () => {
    if (isNavigating.current) {
      return;
    }

    isNavigating.current = true;
    setLoading(true);
    const randomPage = pickRandomWebsitePath(revealedWebsites);
    const nextRevealedWebsites = Array.from(
      new Set([...revealedWebsites, randomPage]),
    );

    setRevealedWebsites(nextRevealedWebsites);
    window.localStorage.setItem(
      REVEALED_WEBSITES_KEY,
      JSON.stringify(nextRevealedWebsites),
    );

    setTimeout(() => {
      router.push(randomPage);
    }, 500);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-black via-zinc-950 to-zinc-950 text-white">
      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-20 sm:px-8 lg:px-12">
        <div className="flex w-full flex-col items-center justify-center gap-8">
          <h1 className="text-center text-xl font-black uppercase tracking-[0.32em] text-white sm:text-2xl">
            Random Webs
          </h1>
          <button
            type="button"
            onClick={visitRandomWebsite}
            disabled={loading}
            aria-busy={loading}
            className="group inline-flex items-center justify-center gap-4 rounded-full border border-white/12 bg-zinc-100 px-10 py-6 text-base font-black uppercase tracking-[0.28em] text-black transition-opacity duration-300 disabled:opacity-70"
          >
            <Shuffle
              aria-hidden="true"
              className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180"
            />
            <span>Explore Random Website</span>
          </button>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-10 text-center text-2xl text-white/35">
          ↓
        </div>
      </section>

      <section className="relative mx-auto flex min-h-screen max-w-7xl items-start px-3 pb-10 sm:px-8 lg:px-12">
        <div className="relative w-full pt-8">
          <div className="relative rounded-4xl border border-white/6 bg-white/1.5 p-2 shadow-[0_12px_28px_rgba(0,0,0,0.2)] sm:p-4">
            <div
              className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4"
              data-website-grid
            >
              {WEBSITES.map((website, index) => {
                const isRevealed =
                  isMounted && revealedWebsites.includes(website.path);
                const isRevealedClient =
                  isMounted && revealedWebsites.includes(website.path);

                const cardClassName = isRevealedClient
                  ? "group relative overflow-hidden rounded-[1.25rem] border border-white/8 bg-zinc-950 p-2 text-left text-zinc-100 shadow-[0_8px_18px_rgba(0,0,0,0.22)] transition-colors duration-300 sm:rounded-[1.6rem] sm:p-4"
                  : "relative overflow-hidden rounded-[1.25rem] border border-white/7 bg-black p-2 text-left text-white/90 shadow-[0_8px_18px_rgba(0,0,0,0.2)] sm:rounded-[1.6rem] sm:p-4";
                const innerClassName = isRevealedClient
                  ? "relative min-h-28 rounded-[0.95rem] bg-zinc-950 p-2.5 sm:min-h-32 sm:rounded-[1.2rem] sm:p-4"
                  : "relative min-h-28 rounded-[0.95rem] bg-black p-2.5 sm:min-h-32 sm:rounded-[1.2rem] sm:p-4";

                const cardContent = (
                  <div className={innerClassName}>
                    <h2
                      className={
                        isRevealedClient
                          ? "text-sm font-black uppercase tracking-[0.04em] text-zinc-100 sm:text-xl sm:tracking-[0.08em]"
                          : "text-sm font-black uppercase tracking-widest text-white/95 sm:text-xl sm:tracking-[0.22em]"
                      }
                    >
                      {isRevealed ? website.title : maskText(website.title)}
                    </h2>
                    <p
                      className={
                        isRevealed
                          ? "mt-2 max-w-56 text-xs leading-5 text-zinc-400 sm:mt-3 sm:text-sm sm:leading-6"
                          : "mt-2 max-w-56 text-xs leading-5 text-white/55 sm:mt-3 sm:text-sm sm:leading-6"
                      }
                    >
                      {isRevealed ? website.blurb : maskText(website.blurb)}
                    </p>
                  </div>
                );

                if (!isRevealed) {
                  return (
                    <div
                      key={website.path}
                      className={cardClassName}
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      {cardContent}
                    </div>
                  );
                }

                return (
                  <Link
                    key={website.path}
                    href={website.path}
                    aria-label={website.title}
                    className={cardClassName}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <footer className="relative mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 pb-10 text-center sm:flex-row sm:justify-between sm:px-8 lg:px-12">
        <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/35">
          © {new Date().getFullYear()} Random Webs
        </p>
        <Link
          href="/privacy"
          className="text-[0.65rem] uppercase tracking-[0.22em] text-white/45 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Privacy
        </Link>
      </footer>
    </main>
  );
}
