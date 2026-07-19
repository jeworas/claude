'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { search, matchedConditions } from '@/lib/search';
import { answerFor } from '@/lib/answer';
import { drugsForQuery } from '@/lib/drugs';
import { getSociety, countryOf } from '@/lib/data';
import SearchBar from '@/components/SearchBar';
import GuidelineCard from '@/components/GuidelineCard';
import AnswerPanel from '@/components/AnswerPanel';
import { useT } from '@/components/i18n';

/**
 * Full client-side search page: reads the query and filters from the URL,
 * runs the bilingual search, derives contextual facets, and renders results.
 * Filters are kept in the URL so any result set is shareable.
 */
export default function SearchExperience() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const t = useT();

  const query = params.get('q') ?? '';
  const countryFilter = params.get('country') ?? '';
  const societyFilter = params.get('society') ?? '';
  const specialtyFilter = params.get('specialty') ?? '';

  const results = useMemo(() => search(query), [query]);
  const answer = useMemo(() => answerFor(query), [query]);
  const drugMatches = useMemo(() => (query ? drugsForQuery(query) : []), [query]);
  const conditionMatches = useMemo(() => (query ? matchedConditions(query) : []), [query]);

  // Facets derived from the unfiltered result set (so counts reflect this query).
  const facets = useMemo(() => {
    const countries = new Map<string, number>();
    const societies = new Map<string, number>();
    const specialties = new Map<string, number>();
    for (const r of results) {
      const c = countryOf(r.guideline);
      countries.set(c, (countries.get(c) ?? 0) + 1);
      societies.set(r.guideline.societyId, (societies.get(r.guideline.societyId) ?? 0) + 1);
      specialties.set(r.guideline.specialty, (specialties.get(r.guideline.specialty) ?? 0) + 1);
    }
    return { countries, societies, specialties };
  }, [results]);

  const filtered = useMemo(
    () =>
      results.filter((r) => {
        if (countryFilter && countryOf(r.guideline) !== countryFilter) return false;
        if (societyFilter && r.guideline.societyId !== societyFilter) return false;
        if (specialtyFilter && r.guideline.specialty !== specialtyFilter) return false;
        return true;
      }),
    [results, countryFilter, societyFilter, specialtyFilter],
  );

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`);
  }

  const hasFilters = Boolean(countryFilter || societyFilter || specialtyFilter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <SearchBar initialQuery={query} />

      {conditionMatches.length > 0 && (
        <div className="mt-4 space-y-2">
          {conditionMatches.map((c) => (
            <Link
              key={c.condition.id}
              href={`/condition/${c.condition.id}`}
              className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm transition hover:border-teal-400"
            >
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-semibold text-white">
                {t('search.condition')}
              </span>
              <span className="font-semibold text-slate-900">{c.condition.nameEn}</span>
              <span className="text-sm italic text-slate-500">{c.condition.namePl}</span>
              <span className="text-xs text-slate-400">
                · {t('langhint.via')} {c.matchedTerm}
              </span>
              <span className="ml-auto text-sm font-medium text-teal-700">
                {c.guidelineCount}{' '}
                {t(c.guidelineCount === 1 ? 'condition.summary.guideline' : 'condition.summary.guidelines')} →
              </span>
            </Link>
          ))}
        </div>
      )}

      {drugMatches.length > 0 && (
        <div className="mt-4 space-y-2">
          {drugMatches.map((d) => (
            <Link
              key={d.slug}
              href={`/drug/${d.slug}`}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3 transition hover:border-teal-300"
            >
              <span className="rounded-full bg-teal-600 px-2 py-0.5 text-xs font-semibold text-white">
                {t('search.medicine')}
              </span>
              <span className="font-semibold text-slate-800">{d.name}</span>
              <span className="text-sm text-slate-600">
                · {t('search.medicine.used')} {d.conditionCount}{' '}
                {t(d.conditionCount === 1 ? 'drug.condition.one' : 'drug.condition.many')}
              </span>
              <span className="ml-auto text-sm font-medium text-teal-700">
                {t('search.medicine.cta')} →
              </span>
            </Link>
          ))}
        </div>
      )}

      {answer && <AnswerPanel answer={answer} />}

      {query && (
        <p className="mt-4 text-sm text-slate-600">
          {filtered.length}{' '}
          {t(filtered.length === 1 ? 'search.results.guideline' : 'search.results.guidelines')}
          {hasFilters && ` ${t('search.results.of')} ${results.length}`} {t('search.results.for')}{' '}
          <span className="font-semibold text-slate-900">“{query}”</span>
        </p>
      )}

      {query && results.length === 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
          <p className="font-medium">{t('search.none.title')} “{query}”.</p>
          <p className="mt-1 text-sm">{t('search.none.hint')}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          {/* Filters */}
          <aside className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">{t('search.filters')}</h2>
              {hasFilters && (
                <button
                  onClick={() => router.replace(`${pathname}?q=${encodeURIComponent(query)}`)}
                  className="text-xs text-teal-700 hover:underline"
                >
                  {t('search.filters.clear')}
                </button>
              )}
            </div>

            <FacetGroup
              title={t('search.filter.country')}
              active={countryFilter}
              onSelect={(v) => setParam('country', v)}
              options={[...facets.countries.entries()].map(([id, count]) => ({
                id,
                label: t(`region.${id}`),
                count,
              }))}
            />

            <FacetGroup
              title={t('search.filter.society')}
              active={societyFilter}
              onSelect={(v) => setParam('society', v)}
              options={[...facets.societies.entries()].map(([id, count]) => ({
                id,
                label: getSociety(id)?.abbreviation ?? id,
                count,
              }))}
            />

            <FacetGroup
              title={t('search.filter.specialty')}
              active={specialtyFilter}
              onSelect={(v) => setParam('specialty', v)}
              options={[...facets.specialties.entries()].map(([id, count]) => ({
                id,
                label: id.replace(/-/g, ' '),
                count,
              }))}
            />
          </aside>

          {/* Results */}
          <div className="space-y-4">
            {filtered.map((r) => (
              <GuidelineCard key={r.guideline.id} guideline={r.guideline} matchedVia={r.matchedVia} />
            ))}
            {filtered.length === 0 && (
              <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
                {t('search.nofilter')}{' '}
                <button
                  onClick={() => router.replace(`${pathname}?q=${encodeURIComponent(query)}`)}
                  className="text-teal-700 hover:underline"
                >
                  {t('search.nofilter.clear')}
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {!query && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          <p className="font-medium text-slate-800">{t('search.start.title')}</p>
          <p className="mt-1 text-sm">
            {t('search.start.try')}{' '}
            {['colitis', 'WZJG', 'H. pylori dosing', 'refluks', 'budesonide', 'cukrzyca'].map((ex) => (
              <Link
                key={ex}
                href={`/search?q=${encodeURIComponent(ex)}`}
                className="mr-2 inline-block rounded-full border border-slate-200 px-2 py-0.5 text-sm text-teal-700 hover:border-teal-300"
              >
                {ex}
              </Link>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}

function FacetGroup({
  title,
  options,
  active,
  onSelect,
}: {
  title: string;
  options: { id: string; label: string; count: number }[];
  active: string;
  onSelect: (value: string) => void;
}) {
  if (options.length <= 1 && !active) return null;
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      <ul className="space-y-1">
        {options
          .sort((a, b) => b.count - a.count)
          .map((o) => {
            const isActive = active === o.id;
            return (
              <li key={o.id}>
                <button
                  onClick={() => onSelect(isActive ? '' : o.id)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm capitalize transition ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{o.label}</span>
                  <span className={isActive ? 'text-teal-100' : 'text-slate-400'}>{o.count}</span>
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
