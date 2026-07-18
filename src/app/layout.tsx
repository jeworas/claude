import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { LanguageProvider, LangToggle, T } from "@/components/i18n";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Guideline Atlas — bilingual clinical guideline finder",
  description:
    "Search current US, European and Polish medical society treatment guidelines in English or Polish. A reference index for healthcare professionals.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-teal-600 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
          >
            <T k="a11y.skip" />
          </a>
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
                <Link href="/search" className="hover:text-teal-700"><T k="nav.search" /></Link>
                <Link href="/conditions" className="hover:text-teal-700"><T k="nav.conditions" /></Link>
                <Link href="/drugs" className="hover:text-teal-700"><T k="nav.drugs" /></Link>
                <Link href="/societies" className="hover:text-teal-700"><T k="nav.societies" /></Link>
                <Link href="/coverage" className="hover:text-teal-700"><T k="nav.coverage" /></Link>
                <Link href="/about" className="hover:text-teal-700"><T k="nav.about" /></Link>
                <LangToggle />
              </nav>
            </div>
          </header>
          <main id="main" className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
              <p className="font-medium text-slate-600">
                <T k="footer.poc" />
              </p>
              <p className="mt-1 max-w-3xl">
                <T k="footer.note" />
              </p>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
