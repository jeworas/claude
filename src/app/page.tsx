import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { guidelines, societies, conditions, currentGuidelinesForCondition } from '@/lib/data';
import { CountryBadge } from '@/components/badges';

const EXAMPLE_QUERIES = ['colitis', 'WZJG', 'ulcerative colitis', 'H. pylori', 'refluks', 'budesonide', 'cukrzyca'];

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
            Find current treatment guidelines,{' '}
            <span className="text-teal-600">in English or Polish</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            One search across US, European and Polish medical societies. Type a condition, drug, or
            abbreviation in either language — see a treatment summary and jump straight to the
            source guideline.
          </p>

          <div className="mx-auto mt-7 max-w-2xl">
            <SearchBar autoFocus size="lg" />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-slate-400">Try:</span>
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
            <Stat value={currentCount} label="Guidelines" />
            <Stat value={societies.length} label="Societies" />
            <Stat value={countries.size} label="Regions" />
            <Stat value={conditions.length} label="Conditions" />
          </div>
        </div>
      </section>

      {/* Featured conditions */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-lg font-semibold text-slate-900">Browse common conditions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Each condition gathers the matching guidelines from every mapped society, side by side.
        </p>
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
                    <CountryBadge key={country} country={country as 'US' | 'PL'} />
                  ))}
                  <span className="ml-auto text-xs text-slate-400">
                    {gs.length} {gs.length === 1 ? 'guideline' : 'guidelines'}
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
          <h2 className="text-lg font-semibold text-slate-900">Why GuidelineAtlas</h2>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Feature
              title="Bilingual by design"
              body="Search in English or Polish. “WZJG”, “wrzodziejące zapalenie jelita grubego”, “UC” and “ulcerative colitis” all resolve to the same condition — and we show you which term matched."
            />
            <Feature
              title="Freshness at a glance"
              body="Every guideline shows its publication year and a currency badge, so an out-of-date recommendation is obvious before you rely on it."
            />
            <Feature
              title="Straight to the source"
              body="Structured treatment summaries are attributed to one guideline and link directly to the original publication for the full text."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </div>
  );
}
