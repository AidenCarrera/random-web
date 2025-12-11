import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Random Web | Creative Coding Experiments",
    template: "%s | Random Web",
  },
  description:
    "A collection of unique, interactive, and stylistically distinct web experiences. Explore digital rain, brutalist designs, neon cyberpunk interfaces, and more.",
  keywords: [
    "creative coding",
    "web design",
    "interactive",
    "next.js",
    "generative art",
    "react",
    "tailwindcss",
    "digital art",
  ],
  authors: [{ name: "Aiden" }],
  creator: "Aiden",
  publisher: "Aiden",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://random-web-experiments.vercel.app", // Placeholder for production URL
    title: "Random Web",
    description:
      "Dive into a universe of unique digital web experiences. From retro terminals to pastel dreams.",
    siteName: "Random Web",
    images: [
      {
        url: "/og-image.jpg", // Suggested asset
        width: 1200,
        height: 630,
        alt: "Random Web Showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Web | Creative Coding Experiments",
    description:
      "Dive into a universe of unique digital web experiences. From retro terminals to pastel dreams.",
    images: ["/og-image.jpg"],
    creator: "@randomweb",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
