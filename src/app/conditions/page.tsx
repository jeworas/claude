import { Suspense } from 'react';
import type { Metadata } from 'next';
import ConditionsDirectory from '@/components/ConditionsDirectory';
import { T } from '@/components/i18n';

export const metadata: Metadata = { title: 'Conditions — GuidelineAtlas' };

export default function ConditionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900"><T k="conditions.title" /></h1>
      <p className="mt-1 text-sm text-slate-500"><T k="conditions.subtitle" /></p>
      {/* useSearchParams (inside ConditionsDirectory) needs a Suspense boundary
          so the page can still be statically prerendered. */}
      <Suspense>
        <ConditionsDirectory />
      </Suspense>
    </div>
  );
}
