import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchExperience from '@/components/SearchExperience';

export const metadata: Metadata = {
  title: 'Search — GuidelineAtlas',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 text-slate-500">Loading…</div>}>
      <SearchExperience />
    </Suspense>
  );
}
