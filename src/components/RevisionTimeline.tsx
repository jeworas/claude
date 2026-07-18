import Link from 'next/link';
import { lineagesForCondition } from '@/lib/data';
import { SocietyBadge, CountryBadge } from '@/components/badges';
import { countryOf } from '@/lib/data';
import { T } from '@/components/i18n';

/**
 * "How the guidance evolved" — for each society with more than one edition of a
 * guideline for this condition, a left-to-right timeline of versions (oldest →
 * newest). Only renders when there is actual revision history to show.
 */
export default function RevisionTimeline({ conditionId }: { conditionId: string }) {
  const lineages = lineagesForCondition(conditionId).filter((l) => l.versions.length >= 2);
  if (lineages.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900"><T k="condition.timeline.title" /></h2>
      <p className="mt-1 text-sm text-slate-500"><T k="condition.timeline.subtitle" /></p>

      <div className="mt-4 space-y-5">
        {lineages.map((lineage) => (
          <div key={lineage.society.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <CountryBadge country={countryOf(lineage.versions[lineage.versions.length - 1])} />
              <SocietyBadge abbreviation={lineage.society.abbreviation} />
              <span className="text-sm text-slate-500">{lineage.society.name}</span>
            </div>

            <ol className="flex flex-wrap items-stretch gap-0">
              {lineage.versions.map((v, i) => {
                const isCurrent = v.status === 'current';
                const isLast = i === lineage.versions.length - 1;
                return (
                  <li key={v.id} className="flex items-stretch">
                    <Link
                      href={`/guideline/${v.id}`}
                      className={`flex min-w-[84px] flex-col items-center rounded-lg border px-3 py-2 text-center transition hover:shadow-sm ${
                        isCurrent
                          ? 'border-teal-300 bg-teal-50'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`text-base font-bold ${
                          isCurrent ? 'text-teal-800' : 'text-slate-500'
                        }`}
                      >
                        {v.year}
                      </span>
                      <span
                        className={`text-[11px] ${
                          isCurrent ? 'text-teal-700' : 'text-slate-400'
                        }`}
                      >
                        <T k={isCurrent ? 'condition.timeline.current' : 'condition.timeline.superseded'} />
                      </span>
                    </Link>
                    {!isLast && (
                      <span className="mx-1 flex items-center text-slate-300" aria-hidden>
                        →
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
