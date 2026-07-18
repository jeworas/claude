import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Guideline Atlas — bilingual clinical guideline finder",
  description:
    "Search current US and Polish medical society treatment guidelines in English or Polish. A reference index for healthcare professionals.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <DisclaimerBanner />
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-600 text-white font-bold">
                Gx
              </span>
              <span className="font-semibold text-slate-900">
                Guideline<span className="text-teal-600">Atlas</span>
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-slate-600">
              <Link href="/search" className="hover:text-teal-700">Search</Link>
              <Link href="/societies" className="hover:text-teal-700">Societies</Link>
              <Link href="/about" className="hover:text-teal-700">About</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
            <p className="font-medium text-slate-600">
              GuidelineAtlas — proof of concept
            </p>
            <p className="mt-1 max-w-3xl">
              Demonstration project. Guideline summaries are hand-curated sample data for a limited
              set of US and Polish societies and are not a complete or authoritative source. Always
              consult the original publication. This tool does not provide medical advice.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
