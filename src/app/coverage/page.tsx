import Link from 'next/link';
import type { Metadata } from 'next';
import type { Country } from '@/lib/types';
import {
  guidelines,
  conditions,
  countryOf,
  getSociety,
  isAging,
  AGING_THRESHOLD_YEARS,
} from '@/lib/data';
import { CountryBadge } from '@/components/badges';
import { T } from '@/components/i18n';

export const metadata: Metadata = { title: 'Coverage — GuidelineAtlas' };

const REGIONS: Country[] = ['US', 'EU', 'UK', 'PL', 'INT'];
const NOW = 2026;
const AGING_LIST_LIMIT = 15;
const RECENT_LIST_LIMIT = 12;

/** Light teal heat tint scaled by cell count — kept pale so text stays legible. */
function tint(count: number): string {
  if (count === 0) return '';
  if (count >= 6) return 'bg-teal-200';
  if (count >= 3) return 'bg-teal-100';
  return 'bg-teal-50';
}

export default function CoveragePage() {
  const current = guidelines.filter((g) => g.status === 'current');

  // Rows = every specialty that appears in a guideline OR a condition, so a
  // discipline we have conditions for but no guidelines yet shows up as a gap.
  const specialties = [
    ...new Set([...current.map((g) => g.specialty), ...conditions.map((c) => c.specialty)]),
  ].sort();

  const conditionCount = (sp: string) => conditions.filter((c) => c.specialty === sp).length;
  const cell = (sp: string, region: Country) =>
    current.filter((g) => g.specialty === sp && countryOf(g) === region).length;
  const rowTotal = (sp: string) => current.filter((g) => g.specialty === sp).length;
  const agingCount = (sp: string) => current.filter((g) => g.specialty === sp && isAging(g)).length;

  const regionTotal = (region: Country) => current.filter((g) => countryOf(g) === region).length;
  const grandTotal = current.length;
  const totalAging = current.filter((g) => isAging(g)).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900"><T k="coverage.title" /></h1>
      <p className="mt-1 max-w-3xl text-sm text-slate-500"><T k="coverage.subtitle" /></p>

      {/* Headline stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={grandTotal} labelKey="coverage.stat.guidelines" />
        <Stat value={specialties.length} labelKey="coverage.stat.specialties" />
        <Stat value={REGIONS.filter((r) => regionTotal(r) > 0).length} labelKey="coverage.stat.regions" />
        <Stat value={conditions.length} labelKey="coverage.stat.conditions" />
      </div>

      {/* Matrix */}
      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left font-semibold">
                <T k="coverage.col.specialty" />
              </th>
              {REGIONS.map((r) => (
                <th key={r} className="px-3 py-2 text-center font-semibold" title={r}>
                  <div className="flex justify-center">
                    <CountryBadge country={r} />
                  </div>
                </th>
              ))}
              <th className="px-3 py-2 text-center font-semibold"><T k="coverage.col.total" /></th>
              <th className="px-3 py-2 text-center font-semibold"><T k="coverage.col.conditions" /></th>
              <th className="px-3 py-2 text-center font-semibold" title={`Older than ${AGING_THRESHOLD_YEARS} years`}>
                <T k="coverage.col.aging" />
              </th>
            </tr>
          </thead>
          <tbody>
            {specialties.map((sp) => {
              const aging = agingCount(sp);
              return (
                <tr key={sp} className="border-t border-slate-100">
                  <th scope="row" className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-medium">
                    <Link
                      href={`/conditions?specialty=${encodeURIComponent(sp)}`}
                      className="capitalize text-slate-800 hover:text-teal-700"
                    >
                      {sp.replace(/-/g, ' ')}
                    </Link>
                  </th>
                  {REGIONS.map((r) => {
                    const n = cell(sp, r);
                    return (
                      <td key={r} className={`px-3 py-2 text-center tabular-nums ${tint(n)}`}>
                        {n > 0 ? (
                          <span className="font-semibold text-teal-900">{n}</span>
                        ) : (
                          <span className="text-slate-300">·</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center font-semibold tabular-nums text-slate-900">
                    {rowTotal(sp)}
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums text-slate-500">{conditionCount(sp)}</td>
                  <td className="px-3 py-2 text-center tabular-nums">
                    {aging > 0 ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {aging}
                      </span>
                    ) : (
                      <span className="text-slate-300">·</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
              <th scope="row" className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left">
                <T k="coverage.row.total" />
              </th>
              {REGIONS.map((r) => (
                <td key={r} className="px-3 py-2 text-center tabular-nums">{regionTotal(r)}</td>
              ))}
              <td className="px-3 py-2 text-center tabular-nums">{grandTotal}</td>
              <td className="px-3 py-2 text-center tabular-nums text-slate-500">{conditions.length}</td>
              <td className="px-3 py-2 text-center tabular-nums">{totalAging}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400"><T k="coverage.note" /></p>

      {/* Recently published — newest current guidelines, the other end of the
          freshness scale from the aging worklist below. */}
      {(() => {
        const recent = current.slice().sort((a, b) => b.year - a.year).slice(0, RECENT_LIST_LIMIT);
        if (recent.length === 0) return null;
        return (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900"><T k="coverage.recent.title" /></h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500"><T k="coverage.recent.subtitle" /></p>
            <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {recent.map((g) => {
                const society = getSociety(g.societyId);
                return (
                  <li key={g.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium tabular-nums text-emerald-800">
                      {g.year}
                    </span>
                    <Link
                      href={`/guideline/${g.id}`}
                      className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 hover:text-teal-700"
                      title={g.title}
                    >
                      {g.title}
                    </Link>
                    <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">
                      {society?.abbreviation ?? g.societyId}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })()}

      {/* Aging worklist — the "Aging" column made actionable: the oldest current
          guidelines, oldest first, each a prompt to re-check the source. */}
      {(() => {
        const aging = current.filter((g) => isAging(g)).sort((a, b) => a.year - b.year);
        if (aging.length === 0) return null;
        const shown = aging.slice(0, AGING_LIST_LIMIT);
        return (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900">
              <T k="coverage.aging.title" />
              <span className="ml-2 text-sm font-normal text-slate-400">({aging.length})</span>
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500"><T k="coverage.aging.subtitle" /></p>
            <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {shown.map((g) => {
                const society = getSociety(g.societyId);
                const age = NOW - g.year;
                return (
                  <li key={g.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium tabular-nums text-amber-800">
                      {age}y
                    </span>
                    <Link
                      href={`/guideline/${g.id}`}
                      className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 hover:text-teal-700"
                      title={g.title}
                    >
                      {g.title}
                    </Link>
                    <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">
                      {society?.abbreviation ?? g.societyId} · {g.year}
                    </span>
                  </li>
                );
              })}
            </ul>
            {aging.length > shown.length && (
              <p className="mt-2 text-xs text-slate-400">
                + {aging.length - shown.length} <T k="coverage.aging.more" />
              </p>
            )}
          </section>
        );
      })()}
    </div>
  );
}

function Stat({ value, labelKey }: { value: number; labelKey: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-500"><T k={labelKey} /></div>
    </div>
  );
}
