import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { societies, getSociety, currentGuidelinesForSociety } from '@/lib/data';
import { CountryBadge, SpecialtyBadge } from '@/components/badges';
import GuidelineCard from '@/components/GuidelineCard';

export function generateStaticParams() {
  return societies.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const s = getSociety(id);
  return { title: s ? `${s.abbreviation} — GuidelineAtlas` : 'Society — GuidelineAtlas' };
}

export default async function SocietyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const society = getSociety(id);
  if (!society) notFound();

  const list = currentGuidelinesForSociety(society.id).sort((a, b) => b.year - a.year);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <nav className="text-sm text-slate-500">
        <Link href="/societies" className="hover:text-teal-700">Societies</Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700">{society.abbreviation}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CountryBadge country={society.country} />
        {society.specialties.map((sp) => (
          <SpecialtyBadge key={sp} specialty={sp} />
        ))}
      </div>

      <h1 className="mt-3 text-2xl font-bold text-slate-900">{society.name}</h1>
      {society.nameLocal && <p className="text-lg italic text-slate-500">{society.nameLocal}</p>}
      {society.description && <p className="mt-3 text-slate-600">{society.description}</p>}

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <a
          href={society.homepage}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-teal-700 hover:text-teal-900"
        >
          Homepage ↗
        </a>
        <a
          href={society.guidelinesIndexUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-teal-700"
        >
          Guidelines index ↗
        </a>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">
        Guidelines ({list.length})
      </h2>
      <div className="mt-4 space-y-4">
        {list.map((g) => (
          <GuidelineCard key={g.id} guideline={g} />
        ))}
      </div>
    </div>
  );
}
