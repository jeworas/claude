import type { Country, GuidelineStatus } from '@/lib/types';

const countryStyles: Record<Country, string> = {
  US: 'bg-blue-100 text-blue-800 border-blue-200',
  PL: 'bg-red-100 text-red-800 border-red-200',
  EU: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const countryFlag: Record<Country, string> = { US: '🇺🇸', PL: '🇵🇱', EU: '🇪🇺' };

/** Full region label for a country/region code. */
export const REGION_LABEL: Record<Country, string> = {
  US: 'United States',
  PL: 'Poland',
  EU: 'Europe',
};

export function CountryBadge({ country }: { country: Country }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${countryStyles[country]}`}
    >
      <span aria-hidden>{countryFlag[country]}</span>
      {country}
    </span>
  );
}

export function SocietyBadge({ abbreviation }: { abbreviation: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
      {abbreviation}
    </span>
  );
}

export function SpecialtyBadge({ specialty }: { specialty: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 capitalize">
      {specialty.replace(/-/g, ' ')}
    </span>
  );
}

export function EvidenceBadge({ grade }: { grade: string }) {
  return (
    <span className="inline-flex items-center rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
      {grade}
    </span>
  );
}

/**
 * Freshness indicator driven by publication year + status. Superseded or aging
 * guidelines are flagged so a clinician immediately sees currency.
 */
export function FreshnessBadge({
  year,
  status,
  now = 2026,
  agingThreshold = 5,
}: {
  year: number;
  status: GuidelineStatus;
  now?: number;
  agingThreshold?: number;
}) {
  if (status === 'superseded') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800">
        ⚠ Superseded
      </span>
    );
  }
  const age = now - year;
  if (age > agingThreshold) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        ↻ {age} yrs old — check for update
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
      ✓ Current
    </span>
  );
}
