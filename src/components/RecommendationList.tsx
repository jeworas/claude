import type { Recommendation } from '@/lib/types';
import { EvidenceBadge } from '@/components/badges';

const LINE_LABEL: Record<string, string> = {
  diagnosis: 'Diagnosis',
  screening: 'Screening',
  'first-line': 'First-line',
  'second-line': 'Second-line',
  escalation: 'Escalation',
  maintenance: 'Maintenance',
  refractory: 'Refractory',
  prevention: 'Prevention',
  supportive: 'Supportive',
};

const LINE_STYLE: Record<string, string> = {
  diagnosis: 'bg-slate-100 text-slate-700',
  screening: 'bg-slate-100 text-slate-700',
  'first-line': 'bg-emerald-100 text-emerald-800',
  'second-line': 'bg-sky-100 text-sky-800',
  escalation: 'bg-violet-100 text-violet-800',
  maintenance: 'bg-teal-100 text-teal-800',
  refractory: 'bg-rose-100 text-rose-800',
  prevention: 'bg-slate-100 text-slate-700',
  supportive: 'bg-amber-100 text-amber-800',
};

/** Structured "key recommendations" for a single guideline. */
export default function RecommendationList({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <ol className="space-y-4">
      {recommendations.map((r, i) => (
        <li key={i} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            {r.lineOfTherapy && (
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  LINE_STYLE[r.lineOfTherapy] ?? 'bg-slate-100 text-slate-700'
                }`}
              >
                {LINE_LABEL[r.lineOfTherapy] ?? r.lineOfTherapy}
              </span>
            )}
            <span className="text-sm font-semibold text-slate-800">{r.topic}</span>
          </div>

          <p className="mt-2 text-sm text-slate-700">{r.text}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {r.drugs?.map((d) => (
              <span
                key={d}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                {d}
              </span>
            ))}
            {r.evidenceGrade && (
              <span className="ml-auto">
                <EvidenceBadge grade={r.evidenceGrade} />
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
