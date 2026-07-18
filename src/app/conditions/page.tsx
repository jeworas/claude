import Link from 'next/link';
import type { Metadata } from 'next';
import type { Country } from '@/lib/types';
import { conditions, currentGuidelinesForCondition, countryOf } from '@/lib/data';
import { CountryBadge } from '@/components/badges';
import { T } from '@/components/i18n';

export const metadata: Metadata = { title: 'Conditions — GuidelineAtlas' };

const REGION_ORDER: Country[] = ['US', 'EU', 'UK', 'PL', 'INT'];

export default function ConditionsPage() {
  // Group conditions by specialty, sorted; conditions alphabetical within each.
  const bySpecialty = new Map<string, typeof conditions>();
  for (const c of conditions) {
    const list = bySpecialty.get(c.specialty) ?? [];
    list.push(c);
    bySpecialty.set(c.specialty, list);
  }
  const specialties = [...bySpecialty.keys()].sort();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900"><T k="conditions.title" /></h1>
      <p className="mt-1 text-sm text-slate-500"><T k="conditions.subtitle" /></p>

      {specialties.map((specialty) => {
        const list = [...bySpecialty.get(specialty)!].sort((a, b) => a.nameEn.localeCompare(b.nameEn));
        return (
          <section key={specialty} className="mt-8">
            <h2 className="text-lg font-semibold capitalize text-slate-900">
              {specialty.replace(/-/g, ' ')}
              <span className="ml-2 text-sm font-normal text-slate-400">({list.length})</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => {
                const gs = currentGuidelinesForCondition(c.id);
                const regions = REGION_ORDER.filter((r) => gs.some((g) => countryOf(g) === r));
                return (
                  <Link
                    key={c.id}
                    href={`/condition/${c.id}`}
                    className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-teal-300 hover:shadow"
                  >
                    <div className="flex items-center gap-1.5">
                      {regions.map((r) => (
                        <CountryBadge key={r} country={r} />
                      ))}
                      <span className="ml-auto text-xs text-slate-400">{gs.length}</span>
                    </div>
                    <h3 className="mt-1.5 font-semibold leading-snug text-slate-900 group-hover:text-teal-700">
                      {c.nameEn}
                    </h3>
                    <p className="text-sm italic text-slate-500">{c.namePl}</p>
                    {c.abbreviations.length > 0 && (
                      <p className="mt-1 text-xs text-slate-400">{c.abbreviations.join(' · ')}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
