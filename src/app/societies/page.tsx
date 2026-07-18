import type { Metadata } from 'next';
import SocietiesDirectory from '@/components/SocietiesDirectory';
import { T } from '@/components/i18n';

export const metadata: Metadata = { title: 'Societies — GuidelineAtlas' };

export default function SocietiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900"><T k="societies.title" /></h1>
      <p className="mt-1 text-sm text-slate-500"><T k="societies.subtitle" /></p>
      <SocietiesDirectory />
    </div>
  );
}
