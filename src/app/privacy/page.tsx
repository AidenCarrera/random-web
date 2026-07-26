import type { Metadata } from "next";
import Link from "next/link";

const LAST_UPDATED = "July 26, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Random Webs uses anonymous analytics, browser storage, and third-party services.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Random Webs",
    description:
      "How Random Webs uses anonymous analytics, browser storage, and third-party services.",
    url: "/privacy",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <section className="mt-12">
      <h2 className="text-sm font-black uppercase tracking-[0.22em] text-white">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:px-8 sm:py-24">
        <Link
          href="/"
          className="text-xs font-black uppercase tracking-[0.22em] text-white/50 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          ← Random Webs
        </Link>

        <h1 className="mt-10 text-xl font-black uppercase tracking-[0.28em] text-white sm:text-2xl">
          Privacy Policy
        </h1>

        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-white/40">
          Last updated {LAST_UPDATED}
        </p>

        <p className="mt-8 text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
          Random Webs is a personal collection of interactive web experiments.
          There are no accounts, sign-ups, or newsletters. This policy explains
          the limited data involved when you use the site.
        </p>

        <Section title="Information you provide">
          <p>
            Random Webs does not ask you to provide your name, email address, or
            other identifying information. Content you create within experiments
            is generally processed locally in your browser.
          </p>
        </Section>

        <Section title="Analytics">
          <p>
            Random Webs uses{" "}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-4 transition-colors duration-300 hover:text-white/70"
            >
              Vercel Web Analytics
            </a>{" "}
            to understand which pages are visited. Vercel Web Analytics does not
            use third-party cookies or track visitors across different websites.
          </p>

          <p>
            It provides aggregated information such as page views, referring
            sites, browsers, devices, and approximate locations. Random Webs
            does not use analytics to identify individual visitors.
          </p>
        </Section>

        <Section title="Browser storage">
          <p>
            Some experiments use local storage to save settings and progress.
            This information remains in your browser and can be removed by
            clearing the site&apos;s stored data.
          </p>
        </Section>

        <Section title="Files">
          <p>
            Experiments that let you open images or other files process them
            locally in your browser. These files are not uploaded to Random
            Webs.
          </p>
        </Section>

        <Section title="Third-party services">
          <p>
            The Repo Visualizer requests public repository information from the
            GitHub API when you choose to load a repository. Because this
            request is sent directly from your browser, GitHub may receive
            standard technical information associated with the request.
          </p>

          <p>
            A few experiments load fonts or background textures hosted
            elsewhere, such as Google Fonts and Transparent Textures. Your
            browser requests these files as the page loads, so those providers
            may receive standard technical information associated with the
            request.
          </p>

          <p>
            Random Webs is hosted by Vercel, which processes standard request
            and technical information needed to deliver the site, maintain
            security, and prevent abuse.
          </p>
        </Section>

        <Section title="Cookies">
          <p>Random Webs does not intentionally set cookies.</p>
        </Section>

        <Section title="Children">
          <p>
            Random Webs does not knowingly collect personal information from children.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            This policy may be updated if the site or its data practices change.
            The date at the top will show when it was last revised.
          </p>
        </Section>
      </div>
    </main>
  );
}
