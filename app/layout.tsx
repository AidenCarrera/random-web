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
    default: "Random Web",
    template: "%s | Random Web",
  },
  description:
    "A sandbox for coding and UI experiments. Interfaces, rainbow circles, glass morphism,and other visual experiments.",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://random-webs.vercel.app",
    title: "Random Web",
    description: "A bunch of random websites and visual experiments.",
    siteName: "Random Web",
    images: [
      {
        url: "/thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "Random Web Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Web | Creative Coding",
    description: "A bunch of weird websites and code experiments.",
    images: ["/thumbnail.jpg"],
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
