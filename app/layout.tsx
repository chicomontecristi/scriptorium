import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://tintaxis.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Tintaxis",
    template: "%s — Tintaxis",
  },
  description: "A living reading platform. The biography of Robi Draco Rosa. Year 2250.",
  keywords: ["tintaxis", "reading", "biography", "Robi Draco Rosa", "interactive", "annotation"],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "Tintaxis",
    description: "Books are living entities. Reading is not receiving.",
    type: "website",
    url: BASE_URL,
    siteName: "Tintaxis",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tintaxis",
    description: "A living reading platform. The biography of Robi Draco Rosa.",
    creator: "@chicomontecristi",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Favicon — brass sigil */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg" sizes="any" />
      </head>
      <body className="vault-noise antialiased">
        {children}
      </body>
    </html>
  );
}
