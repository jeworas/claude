import type { Metadata } from 'next';
import DrugsDirectory from '@/components/DrugsDirectory';
import { T } from '@/components/i18n';

export const metadata: Metadata = { title: 'Medicines — GuidelineAtlas' };

export default function DrugsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900"><T k="drugs.title" /></h1>
      <p className="mt-1 text-sm text-slate-500"><T k="drugs.subtitle" /></p>
      <DrugsDirectory />
    </div>
  );
}
