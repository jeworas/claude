import type { Metadata } from 'next';
import { guidelines, societies, conditions } from '@/lib/data';

export const metadata: Metadata = { title: 'About — GuidelineAtlas' };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">About GuidelineAtlas</h1>
      <p className="mt-3 text-slate-600">
        GuidelineAtlas is a proof-of-concept for a bilingual index of clinical practice guidelines.
        It gathers treatment recommendations from medical societies in the United States and Poland
        into one searchable place, so a clinician can find the current guidance for a condition — in
        English or Polish — in seconds instead of hunting across dozens of society websites.
      </p>

      <Section title="What this demo contains">
        <p>
          A hand-curated sample of {guidelines.length} guidelines from {societies.length} societies,
          covering {conditions.length} conditions (gastroenterology in depth, plus diabetes and
          hypertension for breadth). It is deliberately small and is <strong>not</strong> a complete
          or authoritative catalogue.
        </p>
      </Section>

      <Section title="How search works">
        <p>
          Every condition carries its English and Polish names, common synonyms, and abbreviations.
          A query is first resolved against this bilingual thesaurus — so “colitis”, “UC”, “WZJG” and
          “wrzodziejące zapalenie jelita grubego” all find ulcerative colitis — and then run through a
          fuzzy full-text index that also matches drug names and society names. Results show which
          term matched, so the cross-language behaviour is transparent.
        </p>
      </Section>

      <Section title="Keeping data current">
        <p>
          Guidelines are updated on irregular schedules, so freshness is a first-class feature: each
          record shows its publication year and a currency badge, and can be marked as superseded by a
          newer version. The repository also ships a demonstration update-checker script that reads a
          society’s public guidelines index and reports guidelines it does not yet know about — a
          sketch of the monitoring pipeline a production version would run automatically.
        </p>
      </Section>

      <Section title="Data, sources and copyright">
        <p>
          Summaries are original short paraphrases written for quick reference, each linking to the
          original publication for the full text. The app stores only metadata, brief summaries and
          links — it does not reproduce or host the full guidelines or their PDFs. In a production
          system, content would be maintained by qualified editors with a documented review cadence,
          and publisher terms for each source would be reviewed.
        </p>
      </Section>

      <Section title="Important limitations">
        <ul className="list-disc space-y-1 pl-5">
          <li>This is demonstration data and may contain errors, omissions or out-of-date content.</li>
          <li>Summaries are condensed and omit criteria, dosing detail, contraindications and caveats.</li>
          <li>Always read the original guideline before making any clinical decision.</li>
        </ul>
      </Section>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="font-semibold">Not a medical device · not medical advice</h2>
        <p className="mt-2">
          GuidelineAtlas is an informational reference index for healthcare professionals. It does
          not diagnose, does not recommend treatment for any individual patient, and is not intended
          to be clinical decision support within the meaning of applicable medical-device regulation
          (for example, the EU Medical Device Regulation, or the clinical-decision-support provisions
          of the US 21st Century Cures Act). It is not a substitute for professional judgement. Any
          real-world clinical deployment would require formal regulatory and legal review.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-2 text-slate-600">{children}</div>
    </section>
  );
}
