'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Country } from '@/lib/types';
import { conditions, currentGuidelinesForCondition, countryOf } from '@/lib/data';
import { CountryBadge } from '@/components/badges';
import { T, useT } from '@/components/i18n';

const REGION_ORDER: Country[] = ['US', 'EU', 'UK', 'PL', 'INT'];

/**
 * The conditions index, grouped by specialty and filterable by specialty chips —
 * mirroring the societies registry so both browse the same way. The active
 * specialty lives in the URL (?specialty=…), so the coverage dashboard can deep
 * link straight to a filtered view and the selection is shareable. Client-side +
 * in-memory: filtering is instant with no server round-trip.
 */
export default function ConditionsDirectory() {
  const t = useT();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Specialty → condition count, alphabetical. Drives both the chips and the
  // set of valid filter values.
  const specialtyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of conditions) counts.set(c.specialty, (counts.get(c.specialty) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const requested = params.get('specialty');
  // Ignore an unknown ?specialty= value rather than showing an empty page.
  const active = requested && specialtyCounts.some(([sp]) => sp === requested) ? requested : null;

  const select = (sp: string | null) => {
    const q = new URLSearchParams(Array.from(params.entries()));
    if (sp) q.set('specialty', sp);
    else q.delete('specialty');
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const shownSpecialties = active ? [active] : specialtyCounts.map(([sp]) => sp);

  return (
    <div>
      {/* Specialty filter */}
      <div className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          <T k="conditions.filter.title" />
        </h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <FilterChip
            label={t('conditions.filter.all')}
            count={conditions.length}
            active={active === null}
            onClick={() => select(null)}
          />
          {specialtyCounts.map(([sp, count]) => (
            <FilterChip
              key={sp}
              label={sp.replace(/-/g, ' ')}
              count={count}
              active={active === sp}
              onClick={() => select(sp)}
            />
          ))}
        </div>
      </div>

      {shownSpecialties.map((specialty) => {
        const list = conditions
          .filter((c) => c.specialty === specialty)
          .sort((a, b) => a.nameEn.localeCompare(b.nameEn));
        if (list.length === 0) return null;
        return (
          <section key={specialty} className="mt-8">
            <h2 className="text-lg font-semibold capitalize text-slate-900">
              {specialty.replace(/-/g, ' ')}
              <span className="ml-2 text-sm font-normal text-slate-400">({list.length})</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => {
                const gs = currentGuidelinesForCondition(c.id);
                const regions = REGION_ORDER.filter((r) => gs.some((g) => countryOf(g) === r));
                return (
                  <Link
                    key={c.id}
                    href={`/condition/${c.id}`}
                    className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-teal-300 hover:shadow"
                  >
                    <div className="flex items-center gap-1.5">
                      {regions.map((r) => (
                        <CountryBadge key={r} country={r} />
                      ))}
                      <span className="ml-auto text-xs text-slate-400">{gs.length}</span>
                    </div>
                    <h3 className="mt-1.5 font-semibold leading-snug text-slate-900 group-hover:text-teal-700">
                      {c.nameEn}
                    </h3>
                    <p className="text-sm italic text-slate-500">{c.namePl}</p>
                    {c.abbreviations.length > 0 && (
                      <p className="mt-1 text-xs text-slate-400">{c.abbreviations.join(' · ')}</p>
                    )}
                  </Link>
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
