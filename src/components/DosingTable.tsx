import type { DoseEntry } from '@/lib/types';
import { T } from '@/components/i18n';

/**
 * Standard dosing quick-reference for a guideline. Deliberately framed as
 * reference-only, since dosing is the most safety-sensitive content.
 */
export default function DosingTable({ doses }: { doses: DoseEntry[] }) {
  if (doses.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-slate-900"><T k="guideline.dosing.title" /></h2>
      <p className="mt-1 text-sm text-slate-500"><T k="guideline.dosing.subtitle" /></p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="border-b border-slate-200 px-3 py-2"><T k="guideline.dosing.drug" /></th>
              <th className="border-b border-slate-200 px-3 py-2"><T k="guideline.dosing.indication" /></th>
              <th className="border-b border-slate-200 px-3 py-2"><T k="guideline.dosing.regimen" /></th>
            </tr>
          </thead>
          <tbody>
            {doses.map((d, i) => (
              <tr key={`${d.drug}-${i}`} className="align-top">
                <td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-800">
                  {d.drug}
                </td>
                <td className="border-b border-slate-100 px-3 py-2 text-slate-600">
                  {d.indication ?? '—'}
                </td>
                <td className="border-b border-slate-100 px-3 py-2 font-mono text-[13px] text-slate-700">
                  {d.regimen}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
