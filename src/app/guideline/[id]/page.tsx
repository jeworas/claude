import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  guidelines,
  getGuideline,
  getSociety,
  countryOf,
  conditionsForGuideline,
  guidelinesForCondition,
} from '@/lib/data';
import { CountryBadge, SocietyBadge, SpecialtyBadge, FreshnessBadge } from '@/components/badges';
import RecommendationList from '@/components/RecommendationList';

export function generateStaticParams() {
  return guidelines.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const g = getGuideline(id);
  return { title: g ? `${g.title} — GuidelineAtlas` : 'Guideline — GuidelineAtlas' };
}

export default async function GuidelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guideline = getGuideline(id);
  if (!guideline) notFound();

  const society = getSociety(guideline.societyId);
  const country = countryOf(guideline);
  const conditions = conditionsForGuideline(guideline);

  // "Related" = other guidelines that share a condition (the cross-country comparison hook).
  const related = Array.from(
    new Map(
      guideline.conditionIds
        .flatMap((cid) => guidelinesForCondition(cid))
        .filter((g) => g.id !== guideline.id)
        .map((g) => [g.id, g]),
    ).values(),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <nav className="text-sm text-slate-500">
        <Link href="/search" className="hover:text-teal-700">Search</Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700">{society?.abbreviation}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CountryBadge country={country} />
        {society && <SocietyBadge abbreviation={society.abbreviation} />}
        <SpecialtyBadge specialty={guideline.specialty} />
        <FreshnessBadge year={guideline.year} status={guideline.status} />
      </div>

      <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-900">{guideline.title}</h1>
      {guideline.titleLocal && (
        <p className="mt-1 text-lg italic text-slate-500">{guideline.titleLocal}</p>
      )}

      <div className="mt-2 text-sm text-slate-600">
        {society && (
          <Link href={`/societies/${society.id}`} className="hover:text-teal-700">
            {society.name}
          </Link>
        )}
        {' · '}
        {guideline.year}
        {guideline.citation && <span className="block text-slate-400">{guideline.citation}</span>}
      </div>

      {/* Conditions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {conditions.map((c) => (
          <Link
            key={c.id}
            href={`/condition/${c.id}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover:border-teal-300 hover:text-teal-700"
          >
            {c.nameEn}
            <span className="text-slate-400"> · {c.namePl}</span>
          </Link>
        ))}
      </div>

      {/* Summary */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Overview</h2>
        <p className="mt-2 text-slate-700">{guideline.summary}</p>
      </section>

      {/* Key recommendations */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Key treatment recommendations</h2>
        <p className="mt-1 text-sm text-slate-500">
          Condensed for quick reference — consult the full guideline for complete criteria, dosing,
          and caveats.
        </p>
        <div className="mt-4">
          <RecommendationList recommendations={guideline.keyRecommendations} />
        </div>
      </section>

      {/* Source / provenance */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={guideline.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Read the full guideline ↗
          </a>
          {guideline.pdfUrl && (
            <a
              href={guideline.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-300"
            >
              PDF ↗
            </a>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Last verified {guideline.lastVerified} · Source of record:{' '}
          <span className="break-all">{guideline.sourceUrl}</span>
        </p>
        <p className="mt-2 text-xs text-amber-700">
          ⚠ Hand-curated demo summary. Verify every recommendation against the original publication
          before clinical use.
        </p>
      </section>

      {/* Related / comparison */}
      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Other guidelines for the same condition
          </h2>
          <ul className="mt-3 space-y-2">
            {related.map((g) => {
              const gc = countryOf(g);
              const gs = getSociety(g.societyId);
              return (
                <li key={g.id}>
                  <Link
                    href={`/guideline/${g.id}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 hover:border-teal-300"
                  >
                    <CountryBadge country={gc} />
                    {gs && <SocietyBadge abbreviation={gs.abbreviation} />}
                    <span className="text-sm text-slate-700">{g.title}</span>
                    <span className="ml-auto text-xs text-slate-400">{g.year}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
