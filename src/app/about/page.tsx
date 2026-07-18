import type { Metadata } from 'next';
import { guidelines, societies, conditions } from '@/lib/data';
import { T } from '@/components/i18n';

export const metadata: Metadata = { title: 'About — GuidelineAtlas' };

export default function AboutPage() {
  const currentCount = guidelines.filter((g) => g.status === 'current').length;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900"><T k="about.title" /></h1>
      <p className="mt-3 text-slate-600"><T k="about.intro" /></p>

      <Section titleKey="about.contains.title">
        <p className="flex flex-wrap gap-x-4 gap-y-1 font-medium text-slate-700">
          <span>{currentCount} <T k="home.stat.guidelines" /></span>
          <span>{societies.length} <T k="home.stat.societies" /></span>
          <span>{conditions.length} <T k="home.stat.conditions" /></span>
        </p>
        <p><T k="about.contains.note" /></p>
      </Section>

      <Section titleKey="about.search.title">
        <p><T k="about.search.body" /></p>
      </Section>

      <Section titleKey="about.fresh.title">
        <p><T k="about.fresh.body" /></p>
      </Section>

      <Section titleKey="about.data.title">
        <p><T k="about.data.body" /></p>
      </Section>

      <Section titleKey="about.limits.title">
        <ul className="list-disc space-y-1 pl-5">
          <li><T k="about.limits.1" /></li>
          <li><T k="about.limits.2" /></li>
          <li><T k="about.limits.3" /></li>
        </ul>
      </Section>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="font-semibold"><T k="about.reg.title" /></h2>
        <p className="mt-2"><T k="about.reg.body" /></p>
      </div>
    </div>
  );
}

function Section({ titleKey, children }: { titleKey: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-slate-900"><T k={titleKey} /></h2>
      <div className="mt-2 space-y-2 text-slate-600">{children}</div>
    </section>
  );
}
