import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Scriptorium",
  description: "A living reading platform. Year 2250.",
  keywords: ["scriptorium", "reading", "biography", "Robi Draco Rosa", "interactive"],
  openGraph: {
    title: "The Scriptorium",
    description: "Books are living entities. Reading is not receiving.",
    type: "website",
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
