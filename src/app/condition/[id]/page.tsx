import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Country, Guideline } from '@/lib/types';
import { conditions, getCondition, countryOf, guidelinesForCondition } from '@/lib/data';
import GuidelineCard from '@/components/GuidelineCard';

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

const COLUMN: { country: Country; label: string; flag: string }[] = [
  { country: 'US', label: 'United States', flag: '🇺🇸' },
  { country: 'PL', label: 'Poland', flag: '🇵🇱' },
];

export default async function ConditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const condition = getCondition(id);
  if (!condition) notFound();

  const all = guidelinesForCondition(condition.id).sort((a, b) => b.year - a.year);
  const byCountry = (country: Country): Guideline[] => all.filter((g) => countryOf(g) === country);

  const synonyms = [...condition.synonymsEn, ...condition.synonymsPl, ...condition.abbreviations];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-teal-700">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700">Condition</span>
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
            <span className="text-slate-400">Also known as: </span>
            {synonyms.join(' · ')}
          </p>
        )}
      </header>

      <p className="mt-4 text-sm text-slate-600">
        Comparing <span className="font-semibold">{all.length}</span> guidelines across countries.
        Use this to see how US and Polish societies approach the same condition.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {COLUMN.map(({ country, label, flag }) => {
          const list = byCountry(country);
          return (
            <section key={country}>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span aria-hidden>{flag}</span> {label}
                <span className="text-sm font-normal text-slate-400">({list.length})</span>
              </h2>
              {list.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  No guideline from this country in the current dataset.
                </p>
              ) : (
                <div className="space-y-4">
                  {list.map((g) => (
                    <GuidelineCard key={g.id} guideline={g} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
