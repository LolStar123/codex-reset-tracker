import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reset Monitor · Codex",
  description: "Codex reset announcements, replies and the updates in between. A quiet monitor with reset history and source context.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
