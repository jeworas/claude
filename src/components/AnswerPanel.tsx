import Link from 'next/link';
import type { Answer } from '@/lib/answer';
import { getSociety, countryOf } from '@/lib/data';
import { CountryBadge, SocietyBadge } from '@/components/badges';
import { T } from '@/components/i18n';

/**
 * "Quick reference" panel shown above search results for a specific query
 * (e.g. "celiac dosage"). Surfaces the most relevant recommendation and/or
 * dosing directly, so the answer is visible without opening the guideline.
 */
export default function AnswerPanel({ answer }: { answer: Answer }) {
  return (
    <section className="mt-4 rounded-xl border border-teal-200 bg-teal-50/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-teal-600 px-2 py-0.5 text-xs font-semibold text-white">
          <T k="answer.quickref" />
        </span>
        <span className="text-sm font-semibold text-slate-800">
          {answer.conditionName}
        </span>
        <span className="text-xs text-slate-500">· <T k={`answer.intent.${answer.intent}`} /></span>
      </div>

      <div className="mt-3 space-y-3">
        {answer.entries.map((e, i) => {
          const society = getSociety(e.guideline.societyId);
          return (
            <div key={`${e.guideline.id}-${i}`} className="rounded-lg border border-teal-100 bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <CountryBadge country={countryOf(e.guideline)} />
                {society && <SocietyBadge abbreviation={society.abbreviation} />}
                <Link
                  href={`/guideline/${e.guideline.id}`}
                  className="text-sm font-medium text-slate-800 hover:text-teal-700"
                >
                  {e.guideline.title}
                </Link>
                <span className="ml-auto text-xs text-slate-400">{e.guideline.year}</span>
              </div>

              {e.rec && (
                <p className="mt-2 text-sm text-slate-700">
                  <span className="font-medium">{e.rec.topic}: </span>
                  {e.rec.text}
                </p>
              )}

              {e.doses && e.doses.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {e.doses.map((d, j) => (
                    <li key={j} className="text-sm text-slate-700">
                      <span className="font-medium text-slate-800">{d.drug}</span>
                      {d.indication && <span className="text-slate-400"> · {d.indication}</span>}
                      <span className="block font-mono text-[13px] text-slate-600">{d.regimen}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        <T k="answer.note" />
      </p>
    </section>
  );
}
