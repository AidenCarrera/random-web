import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";

const geistSans = localFont({
  src: "../../public/fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "../../public/fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const silkscreen = localFont({
  src: [
    {
      path: "../../public/fonts/silkscreen-400-latin.woff2",
      weight: "400",
    },
    {
      path: "../../public/fonts/silkscreen-700-latin.woff2",
      weight: "700",
    },
  ],
  variable: "--font-silkscreen",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
  },
  title: {
    default: "Random Webs",
    template: "%s | Random Webs",
  },
  description:
    "A creative sandbox of interactive, unique mini web applications. Features physics engines, sound generators, digital art tools, coding mini-games, and other creative frontend experiments.",
  keywords: [
    "creative coding",
    "web design",
    "next.js",
    "generative art",
    "react",
    "tailwindcss",
    "frontend experiments",
  ],
  authors: [{ name: "Aiden" }],
  creator: "Aiden",
  publisher: "Aiden",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "Random Webs",
    description:
      "A creative sandbox of interactive, unique mini web applications and frontend experiments.",
    siteName: "Random Webs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Random Webs Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Webs | Creative Coding",
    description:
      "A creative sandbox of interactive, unique mini web applications and frontend experiments.",
    images: ["/og-image.png"],
    creator: "@randomwebs",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${silkscreen.variable} antialiased`}
      >
        {children}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
