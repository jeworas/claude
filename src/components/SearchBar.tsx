'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
  const [value, setValue] = useState(initialQuery);

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
            autoFocus={autoFocus}
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search a condition, drug, or society — e.g. colitis, WZJG, H. pylori"
            aria-label="Search guidelines"
            className={`w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-slate-900 shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 ${
              big ? 'py-3 text-base' : 'py-2 text-sm'
            }`}
          />
        </div>
        <button
          type="submit"
          className={`rounded-lg bg-teal-600 font-medium text-white shadow-sm transition hover:bg-teal-700 ${
            big ? 'px-6 text-base' : 'px-4 text-sm'
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
}
