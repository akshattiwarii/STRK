import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STRK — 'Me vs Me' Consistency Platform",
  description: "The ultimate personal accountability engine. Turn daily effort into visual momentum, unstoppable streaks, and XP.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#08090d] text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
