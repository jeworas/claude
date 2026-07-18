import Link from 'next/link';
import type { Country } from '@/lib/types';
import { buildComparison, isConsensus, type CompareRow } from '@/lib/compare';
import { T } from '@/components/i18n';

const REGION_FLAG: Record<Country, string> = { US: '🇺🇸', EU: '🇪🇺', UK: '🇬🇧', PL: '🇵🇱', INT: '🌍' };

/**
 * Side-by-side comparison of how each region's societies approach a condition,
 * aligned by therapy line. Drug chips shared across ≥2 regions are highlighted
 * as consensus; the rest are region-specific — so agreement and divergence are
 * visible at a glance. Built from structured recommendations (see lib/compare).
 */
export default function RegionComparison({ conditionId }: { conditionId: string }) {
  const matrix = buildComparison(conditionId);
  if (!matrix.hasComparison || matrix.rows.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900"><T k="condition.compare.title" /></h2>
      <p className="mt-1 text-sm text-slate-500">
        <T k="condition.compare.subtitle.a" />{' '}
        <span className="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-medium text-teal-800">
          teal
        </span>{' '}
        <T k="condition.compare.subtitle.consensus" />{' '}
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">grey</span>{' '}
        <T k="condition.compare.subtitle.specific" />
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="w-28 border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-500">
                <T k="condition.compare.therapyline" />
              </th>
              {matrix.regions.map((r) => (
                <th
                  key={r}
                  className="border-b border-l border-slate-200 px-3 py-2 text-left font-semibold text-slate-700"
                >
                  <span aria-hidden className="mr-1">{REGION_FLAG[r]}</span>
                  <T k={`region.${r}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row) => (
              <tr key={row.line} className="align-top">
                <th className="border-b border-slate-100 px-3 py-3 text-left">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    <T k={`line.${row.line}`} />
                  </span>
                </th>
                {matrix.regions.map((region) => (
                  <td key={region} className="border-b border-l border-slate-100 px-3 py-3">
                    <RegionCell row={row} region={region} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RegionCell({ row, region }: { row: CompareRow; region: Country }) {
  const entries = row.byRegion.get(region);
  if (!entries || entries.length === 0) {
    return <span className="text-slate-300">—</span>;
  }
  return (
    <div className="space-y-2">
      {entries.map(({ guideline, rec }, i) => (
        <div key={`${guideline.id}-${i}`}>
          <p className="text-slate-700">{rec.text}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {(rec.drugs ?? []).map((d) => {
              const consensus = isConsensus(row, d);
              return (
                <span
                  key={d}
                  className={`rounded px-1.5 py-0.5 text-xs ${
                    consensus
                      ? 'bg-teal-100 font-medium text-teal-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  title={consensus ? 'Recommended in another region too' : 'Region-specific'}
                >
                  {d}
                </span>
              );
            })}
            <Link
              href={`/guideline/${guideline.id}`}
              className="ml-1 text-xs text-slate-400 hover:text-teal-700"
            >
              {guideline.title.split(':')[0].split(' ').slice(0, 2).join(' ')} ↗
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
