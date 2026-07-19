import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { allDrugs, getDrugBySlug } from '@/lib/drugs';
import { getSociety } from '@/lib/data';
import { CountryBadge, SocietyBadge } from '@/components/badges';
import { T } from '@/components/i18n';

export function generateStaticParams() {
  return allDrugs().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const drug = getDrugBySlug(slug);
  return { title: drug ? `${drug.name} — GuidelineAtlas` : 'Medicine — GuidelineAtlas' };
}

export default async function DrugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const drug = getDrugBySlug(slug);
  if (!drug) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <nav className="text-sm text-slate-500">
        <Link href="/drugs" className="hover:text-teal-700"><T k="nav.drugs" /></Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700"><T k="drug.crumb" /></span>
      </nav>

      <header className="mt-3">
        <h1 className="text-2xl font-bold text-slate-900">{drug.name}</h1>
        {drug.aliases.length > 0 && (
          <p className="mt-1 text-sm text-slate-500">
            <span className="text-slate-400"><T k="drug.alsoknown" />: </span>
            {drug.aliases.join(' · ')}
          </p>
        )}
        <p className="mt-3 text-sm text-slate-600">
          <T k="drug.usedacross" /> <span className="font-semibold">{drug.conditionCount}</span>{' '}
          <T k={drug.conditionCount === 1 ? 'drug.condition.one' : 'drug.condition.many'} />{' '}
          <T k="drug.in" /> <span className="font-semibold">{drug.guidelineCount}</span>{' '}
          <T k={drug.guidelineCount === 1 ? 'drug.guideline.one' : 'drug.guideline.many'} />.
        </p>
      </header>

      <div className="mt-6 space-y-3">
        {drug.conditions.map(({ condition, guidelines }) => (
          <details key={condition.id} className="group rounded-xl border border-slate-200 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3">
              <svg
                aria-hidden
                className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-90"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 5l6 5-6 5" />
              </svg>
              <span className="font-semibold text-slate-900">{condition.nameEn}</span>
              <span className="text-sm italic text-slate-500">{condition.namePl}</span>
              <span className="ml-auto flex items-center gap-2">
                <span className="hidden text-xs capitalize text-slate-400 sm:inline">
                  {condition.specialty.replace(/-/g, ' ')}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {guidelines.length}{' '}
                  <T k={guidelines.length === 1 ? 'drug.guideline.one' : 'drug.guideline.many'} />
                </span>
              </span>
            </summary>

            <div className="border-t border-slate-100 px-4 pb-4">
              <div className="flex justify-end py-2">
                <Link
                  href={`/condition/${condition.id}`}
                  className="text-xs font-medium text-teal-700 hover:text-teal-900"
                >
                  <T k="drug.viewcondition" /> →
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
              {guidelines.map((u) => {
                const society = getSociety(u.guideline.societyId);
                return (
                  <div key={u.guideline.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CountryBadge country={u.country} />
                      {society && <SocietyBadge abbreviation={society.abbreviation} />}
                      <Link
                        href={`/guideline/${u.guideline.id}`}
                        className="text-sm font-medium text-slate-800 hover:text-teal-700"
                      >
                        {u.guideline.title}
                      </Link>
                      <span className="ml-auto text-xs text-slate-400">{u.guideline.year}</span>
                    </div>

                    {(u.lines.length > 0 || u.grades.length > 0) && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        {u.lines.map((l) => (
                          <span
                            key={l}
                            className="rounded-full bg-teal-50 px-2 py-0.5 font-medium text-teal-700"
                          >
                            <T k={`line.${l}`} />
                          </span>
                        ))}
                        {u.grades.map((gr) => (
                          <span
                            key={gr}
                            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-slate-500"
                          >
                            {gr}
                          </span>
                        ))}
                      </div>
                    )}

                    {u.doses.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {u.doses.map((d, j) => (
                          <li key={j} className="text-sm text-slate-700">
                            {d.indication && <span className="text-slate-400">{d.indication}: </span>}
                            <span className="font-mono text-[13px] text-slate-700">{d.regimen}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          </details>
        ))}
      </div>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <T k="drug.dosing.note" />
      </p>
    </div>
  );
}
