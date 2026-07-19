'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LangToggle, T } from '@/components/i18n';

const LINKS = [
  { href: '/search', k: 'nav.search' },
  { href: '/conditions', k: 'nav.conditions' },
  { href: '/drugs', k: 'nav.drugs' },
  { href: '/societies', k: 'nav.societies' },
  { href: '/coverage', k: 'nav.coverage' },
  { href: '/about', k: 'nav.about' },
];

/**
 * Primary navigation. On desktop the links sit inline; on a phone they collapse
 * behind a hamburger so the header stays usable at the bedside (six links + the
 * language toggle would otherwise overflow a narrow screen).
 */
export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-4 text-sm text-slate-600 sm:flex">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-teal-700">
            <T k={l.k} />
          </Link>
        ))}
        <LangToggle />
      </nav>

      {/* Mobile: language toggle + hamburger */}
      <div className="flex items-center gap-2 sm:hidden">
        <LangToggle />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-700"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M5 5l10 10M15 5l-10 10" /> : <path d="M3 5h14M3 10h14M3 15h14" />}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-slate-200 bg-white shadow-sm sm:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-1 text-sm">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-slate-100 py-3 text-slate-700 last:border-b-0 hover:text-teal-700"
              >
                <T k={l.k} />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
