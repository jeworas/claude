import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { guidelines, societies, conditions, currentGuidelinesForCondition } from '@/lib/data';
import type { Country } from '@/lib/types';
import { CountryBadge } from '@/components/badges';
import { T } from '@/components/i18n';

const EXAMPLE_QUERIES = ['colitis', 'WZJG', 'H. pylori dosing', 'infliximab', 'celiac dosage', 'refluks', 'cukrzyca'];

const FEATURED_CONDITION_IDS = [
  'ulcerative-colitis',
  'crohns-disease',
  'c-difficile-infection',
  'gerd',
  'h-pylori-infection',
  'irritable-bowel-syndrome',
];

export default function Home() {
  const countries = new Set(societies.map((s) => s.country));
  const currentCount = guidelines.filter((g) => g.status === 'current').length;
  const featured = FEATURED_CONDITION_IDS.map((id) => conditions.find((c) => c.id === id)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c),
  );

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            <T k="home.hero.title1" />{' '}
            <span className="text-teal-600"><T k="home.hero.title2" /></span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            <T k="home.hero.subtitle" />
          </p>

          <div className="mx-auto mt-7 max-w-2xl">
            <SearchBar autoFocus size="lg" />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-slate-400"><T k="home.try" /></span>
            {EXAMPLE_QUERIES.map((q) => (
              <Link
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-teal-700 transition hover:border-teal-300"
              >
                {q}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-center">
            <Stat value={currentCount} labelKey="home.stat.guidelines" />
            <Stat value={societies.length} labelKey="home.stat.societies" />
            <Stat value={countries.size} labelKey="home.stat.regions" />
            <Stat value={conditions.length} labelKey="home.stat.conditions" />
          </div>
        </div>
      </section>

      {/* Featured conditions */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-lg font-semibold text-slate-900"><T k="home.browse.title" /></h2>
        <p className="mt-1 text-sm text-slate-500"><T k="home.browse.subtitle" /></p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => {
            const gs = currentGuidelinesForCondition(c.id);
            const cardCountries = new Set(
              gs.map((g) => societies.find((s) => s.id === g.societyId)?.country).filter(Boolean),
            );
            return (
              <Link
                key={c.id}
                href={`/condition/${c.id}`}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300 hover:shadow"
              >
                <div className="flex items-center gap-2">
                  {[...cardCountries].map((country) => (
                    <CountryBadge key={country} country={country as Country} />
                  ))}
                  <span className="ml-auto text-xs text-slate-400">
                    {gs.length}{' '}
                    <T k={gs.length === 1 ? 'home.card.guideline' : 'home.card.guidelines'} />
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-teal-700">
                  {c.nameEn}
                </h3>
                <p className="text-sm italic text-slate-500">{c.namePl}</p>
                {c.abbreviations.length > 0 && (
                  <p className="mt-2 text-xs text-slate-400">{c.abbreviations.join(' · ')}</p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-lg font-semibold text-slate-900"><T k="home.why.title" /></h2>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Feature titleKey="home.feature.bilingual.title" bodyKey="home.feature.bilingual.body" />
            <Feature titleKey="home.feature.freshness.title" bodyKey="home.feature.freshness.body" />
            <Feature titleKey="home.feature.source.title" bodyKey="home.feature.source.body" />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, labelKey }: { value: number; labelKey: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-500"><T k={labelKey} /></div>
    </div>
  );
}

function Feature({ titleKey, bodyKey }: { titleKey: string; bodyKey: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-900"><T k={titleKey} /></h3>
      <p className="mt-1 text-sm text-slate-600"><T k={bodyKey} /></p>
    </div>
  );
}
