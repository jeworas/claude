'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/components/i18n';

/**
 * Query input. Submitting navigates to /search?q=… so results are shareable
 * via URL. Used on the home page and atop the search page.
 */
export default function SearchBar({
  initialQuery = '',
  autoFocus = false,
  size = 'md',
}: {
  initialQuery?: string;
  autoFocus?: boolean;
  size?: 'md' | 'lg';
}) {
  const router = useRouter();
  const t = useT();
  const [value, setValue] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Press "/" anywhere to jump to the search box — unless the user is already
  // typing in a field. A daily-driver nicety for a reference tool.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  const big = size === 'lg';

  return (
    <form onSubmit={submit} className="w-full" role="search">
      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            ⌕
          </span>
          <input
            ref={inputRef}
            autoFocus={autoFocus}
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('searchbar.placeholder')}
            aria-label={t('searchbar.aria')}
            className={`w-full rounded-lg border border-slate-300 bg-white pl-9 text-slate-900 shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 ${
              value ? 'pr-3' : 'pr-9'
            } ${big ? 'py-3 text-base' : 'py-2 text-sm'}`}
          />
          {!value && (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs font-sans text-slate-400 sm:block">
              /
            </kbd>
          )}
        </div>
        <button
          type="submit"
          className={`rounded-lg bg-teal-600 font-medium text-white shadow-sm transition hover:bg-teal-700 ${
            big ? 'px-6 text-base' : 'px-4 text-sm'
          }`}
        >
          {t('searchbar.button')}
        </button>
      </div>
    </form>
  );
}
