'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Country } from '@/lib/types';
import { societies, currentGuidelinesForSociety } from '@/lib/data';
import { CountryBadge, SpecialtyBadge } from '@/components/badges';
import { T, useT } from '@/components/i18n';

const COUNTRY_GROUPS: { country: Country; flag: string }[] = [
  { country: 'US', flag: '🇺🇸' },
  { country: 'EU', flag: '🇪🇺' },
  { country: 'UK', flag: '🇬🇧' },
  { country: 'PL', flag: '🇵🇱' },
  { country: 'INT', flag: '🌍' },
];

/**
 * The societies registry, browsable two ways: grouped by region, and filterable
 * by specialty. Doctors think by discipline ("show me the cardiology bodies"),
 * so the specialty chips are the primary navigation over a registry this wide.
 * Client-side + local state — the whole registry is in-memory, so filtering is
 * instant and needs no server round-trip.
 */
export default function SocietiesDirectory() {
  const t = useT();
  const [specialty, setSpecialty] = useState<string | null>(null);

  // Specialty → society count, across the whole registry (alphabetical to scan).
  const specialtyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of societies) {
      for (const sp of s.specialties) counts.set(sp, (counts.get(sp) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const visible = useMemo(
    () => (specialty ? societies.filter((s) => s.specialties.includes(specialty)) : societies),
    [specialty],
  );

  return (
    <div>
      {/* Specialty filter */}
      <div className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          <T k="societies.filter.title" />
        </h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <FilterChip
            label={t('societies.filter.all')}
            count={societies.length}
            active={specialty === null}
            onClick={() => setSpecialty(null)}
          />
          {specialtyCounts.map(([sp, count]) => (
            <FilterChip
              key={sp}
              label={sp.replace(/-/g, ' ')}
              count={count}
              active={specialty === sp}
              onClick={() => setSpecialty(sp)}
            />
          ))}
        </div>
      </div>

      {COUNTRY_GROUPS.map(({ country, flag }) => {
        const group = visible.filter((s) => s.country === country);
        if (group.length === 0) return null;
        return (
          <section key={country} className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span aria-hidden>{flag}</span> <T k={`region.${country}`} />
              <span className="text-sm font-normal text-slate-400">({group.length})</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {group.map((s) => {
                const count = currentGuidelinesForSociety(s.id).length;
                return (
                  <div
                    key={s.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CountryBadge country={s.country} />
                      {s.specialties.map((sp) => (
                        <SpecialtyBadge key={sp} specialty={sp} />
                      ))}
                      <span className="ml-auto text-xs text-slate-400">
                        {count} <T k="societies.guidelines" />
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold text-slate-900">
                      <Link href={`/societies/${s.id}`} className="hover:text-teal-700">
                        {s.abbreviation} — {s.name}
                      </Link>
                    </h3>
                    {s.nameLocal && <p className="text-sm italic text-slate-500">{s.nameLocal}</p>}
                    {s.description && <p className="mt-2 text-sm text-slate-600">{s.description}</p>}
                    <div className="mt-3 flex gap-4 text-sm">
                      <Link
                        href={`/societies/${s.id}`}
                        className="font-medium text-teal-700 hover:text-teal-900"
                      >
                        <T k="societies.viewguidelines" /> →
                      </Link>
                      <a
                        href={s.guidelinesIndexUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-teal-700"
                      >
                        <T k="societies.site" /> ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm capitalize transition ${
        active
          ? 'border-teal-600 bg-teal-600 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
      }`}
    >
      <span>{label}</span>
      <span className={active ? 'text-teal-100' : 'text-slate-400'}>{count}</span>
    </button>
  );
}
