'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { allDrugs } from '@/lib/drugs';
import { useT } from '@/components/i18n';

/**
 * Browsable index of every medicine in the atlas. A plain text filter matches
 * the display name and any cross-language alias, so "infliksymab" finds
 * Infliximab. In-memory data → instant, client-side.
 */
export default function DrugsDirectory() {
  const t = useT();
  const [q, setQ] = useState('');
  const drugs = useMemo(() => allDrugs(), []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return drugs;
    return drugs.filter(
      (d) =>
        d.name.toLowerCase().includes(needle) ||
        d.aliases.some((a) => a.toLowerCase().includes(needle)),
    );
  }, [drugs, q]);

  return (
    <div className="mt-6">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('drugs.search')}
        aria-label={t('drugs.search')}
        className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
      />

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">{t('drugs.none')}</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Link
              key={d.slug}
              href={`/drug/${d.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-teal-300 hover:shadow"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-semibold leading-snug text-slate-900 group-hover:text-teal-700">
                  {d.name}
                </h3>
                <span className="shrink-0 text-xs text-slate-400">
                  {d.conditionCount} {t('drugs.count.conditions')}
                </span>
              </div>
              {d.aliases.length > 0 && (
                <p className="mt-0.5 truncate text-xs italic text-slate-500">{d.aliases.join(' · ')}</p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                {d.guidelineCount} {t('drugs.count.guidelines')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
