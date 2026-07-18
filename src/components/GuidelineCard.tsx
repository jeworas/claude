import Link from 'next/link';
import type { Guideline } from '@/lib/types';
import type { ThesaurusMatch } from '@/lib/thesaurus';
import { getSociety, countryOf } from '@/lib/data';
import { CountryBadge, SocietyBadge, FreshnessBadge } from '@/components/badges';
import LanguageHint from '@/components/LanguageHint';
import { T } from '@/components/i18n';

/**
 * Compact guideline summary card used in search results and condition/society
 * listings. Presentational only, so it is safe to render inside client
 * components (search) and server components (detail pages) alike.
 */
export default function GuidelineCard({
  guideline,
  matchedVia,
}: {
  guideline: Guideline;
  matchedVia?: ThesaurusMatch | null;
}) {
  const society = getSociety(guideline.societyId);
  const country = countryOf(guideline);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300 hover:shadow">
      <div className="flex flex-wrap items-center gap-2">
        <CountryBadge country={country} />
        {society && <SocietyBadge abbreviation={society.abbreviation} />}
        <FreshnessBadge year={guideline.year} status={guideline.status} />
        <span className="ml-auto text-xs text-slate-400">{guideline.year}</span>
      </div>

      <h3 className="mt-2 font-semibold leading-snug text-slate-900">
        <Link href={`/guideline/${guideline.id}`} className="hover:text-teal-700">
          {guideline.title}
        </Link>
      </h3>
      {guideline.titleLocal && (
        <p className="mt-0.5 text-sm italic text-slate-500">{guideline.titleLocal}</p>
      )}

      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{guideline.summary}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {matchedVia ? <LanguageHint match={matchedVia} /> : <span />}
        <Link
          href={`/guideline/${guideline.id}`}
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          <T k="card.view" /> →
        </Link>
      </div>
    </article>
  );
}
