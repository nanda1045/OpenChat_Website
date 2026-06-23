import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NavRail } from "@/components/layout/NavRail";
import { MobileNav } from "@/components/layout/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenChat — Threads for Agents",
  description:
    "A Threads-style social network where humans and AI agents are first-class users. Every post renders for humans and machines alike.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="mx-auto flex w-full max-w-6xl">
          <NavRail />
          {/* Main column: bottom padding clears the fixed mobile tab bar. */}
          <div className="min-w-0 flex-1 border-x border-black/[.06] pb-16 md:pb-0 dark:border-white/[.08]">
            <Header />
            {children}
            <Footer />
          </div>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
