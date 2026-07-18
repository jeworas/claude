import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Country } from '@/lib/types';
import { conditions, getCondition, countryOf, currentGuidelinesForCondition } from '@/lib/data';
import GuidelineCard from '@/components/GuidelineCard';
import RegionComparison from '@/components/RegionComparison';
import RevisionTimeline from '@/components/RevisionTimeline';
import { T } from '@/components/i18n';

export function generateStaticParams() {
  return conditions.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = getCondition(id);
  return { title: c ? `${c.nameEn} / ${c.namePl} — GuidelineAtlas` : 'Condition — GuidelineAtlas' };
}

const COLUMN: { country: Country; flag: string }[] = [
  { country: 'US', flag: '🇺🇸' },
  { country: 'EU', flag: '🇪🇺' },
  { country: 'UK', flag: '🇬🇧' },
  { country: 'PL', flag: '🇵🇱' },
  { country: 'INT', flag: '🌍' },
];

export default async function ConditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const condition = getCondition(id);
  if (!condition) notFound();

  const all = currentGuidelinesForCondition(condition.id).sort((a, b) => b.year - a.year);
  const presentColumns = COLUMN.filter(({ country }) => all.some((g) => countryOf(g) === country));

  const synonyms = [...condition.synonymsEn, ...condition.synonymsPl, ...condition.abbreviations];

  const gridCols =
    presentColumns.length >= 3
      ? 'lg:grid-cols-3'
      : presentColumns.length === 2
        ? 'md:grid-cols-2'
        : '';

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-teal-700"><T k="nav.home" /></Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700"><T k="condition.crumb" /></span>
      </nav>

      <header className="mt-3">
        <h1 className="text-2xl font-bold text-slate-900">{condition.nameEn}</h1>
        <p className="text-lg italic text-slate-500">{condition.namePl}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {condition.icd10.length > 0 && (
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-600">
              ICD-10: {condition.icd10.join(', ')}
            </span>
          )}
          <span className="capitalize">{condition.specialty.replace(/-/g, ' ')}</span>
        </div>
        {synonyms.length > 0 && (
          <p className="mt-2 text-sm text-slate-500">
            <span className="text-slate-400"><T k="condition.alsoknown" /> </span>
            {synonyms.join(' · ')}
          </p>
        )}
      </header>

      <p className="mt-4 text-sm text-slate-600">
        <span className="font-semibold">{all.length}</span>{' '}
        <T k="condition.summary.current" />{' '}
        <T k={all.length === 1 ? 'condition.summary.guideline' : 'condition.summary.guidelines'} />{' '}
        <T k="condition.summary.across" /> {presentColumns.length}{' '}
        <T k={presentColumns.length === 1 ? 'condition.summary.region' : 'condition.summary.regions'} />
        {' — '}
        <T k="condition.summary.tail" />
      </p>

      {/* Cross-region comparison + revision history */}
      <RegionComparison conditionId={condition.id} />
      <RevisionTimeline conditionId={condition.id} />

      {/* Current guidelines grouped by region */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900"><T k="condition.byregion.title" /></h2>
        <div className={`mt-4 grid grid-cols-1 gap-6 ${gridCols}`}>
          {presentColumns.map(({ country, flag }) => {
            const list = all.filter((g) => countryOf(g) === country);
            return (
              <section key={country}>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                  <span aria-hidden>{flag}</span> <T k={`region.${country}`} />
                  <span className="text-sm font-normal text-slate-400">({list.length})</span>
                </h3>
                <div className="space-y-4">
                  {list.map((g) => (
                    <GuidelineCard key={g.id} guideline={g} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
