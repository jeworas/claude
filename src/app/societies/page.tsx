import Link from 'next/link';
import type { Metadata } from 'next';
import type { Country } from '@/lib/types';
import { societies, currentGuidelinesForSociety } from '@/lib/data';
import { CountryBadge, SpecialtyBadge } from '@/components/badges';
import { T } from '@/components/i18n';

export const metadata: Metadata = { title: 'Societies — GuidelineAtlas' };

const COUNTRY_GROUPS: { country: Country; flag: string }[] = [
  { country: 'US', flag: '🇺🇸' },
  { country: 'EU', flag: '🇪🇺' },
  { country: 'UK', flag: '🇬🇧' },
  { country: 'PL', flag: '🇵🇱' },
  { country: 'INT', flag: '🌍' },
];

export default function SocietiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900"><T k="societies.title" /></h1>
      <p className="mt-1 text-sm text-slate-500"><T k="societies.subtitle" /></p>

      {COUNTRY_GROUPS.map(({ country, flag }) => {
        const group = societies.filter((s) => s.country === country);
        return (
          <section key={country} className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span aria-hidden>{flag}</span> <T k={`region.${country}`} />
              <span className="text-sm font-normal text-slate-400">({group.length})</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {group.map((s) => {
                const count = currentGuidelinesForSociety(s.id).length;
                return (
                  <div
                    key={s.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CountryBadge country={s.country} />
                      {s.specialties.map((sp) => (
                        <SpecialtyBadge key={sp} specialty={sp} />
                      ))}
                      <span className="ml-auto text-xs text-slate-400">{count} <T k="societies.guidelines" /></span>
                    </div>
                    <h3 className="mt-2 font-semibold text-slate-900">
                      <Link href={`/societies/${s.id}`} className="hover:text-teal-700">
                        {s.abbreviation} — {s.name}
                      </Link>
                    </h3>
                    {s.nameLocal && <p className="text-sm italic text-slate-500">{s.nameLocal}</p>}
                    {s.description && <p className="mt-2 text-sm text-slate-600">{s.description}</p>}
                    <div className="mt-3 flex gap-4 text-sm">
                      <Link href={`/societies/${s.id}`} className="font-medium text-teal-700 hover:text-teal-900">
                        <T k="societies.viewguidelines" /> →
                      </Link>
                      <a
                        href={s.guidelinesIndexUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-teal-700"
                      >
                        <T k="societies.site" /> ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
