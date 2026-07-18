import type { ThesaurusMatch } from '@/lib/thesaurus';
import { T } from '@/components/i18n';

/**
 * Explains *why* a result surfaced when it was reached through the bilingual
 * thesaurus — e.g. "matched via WZJG (abbreviation) → Ulcerative colitis".
 * This is what makes the cross-language behavior legible to the user.
 */
export default function LanguageHint({ match }: { match: ThesaurusMatch }) {
  const canonical = match.condition.nameEn;
  const showArrow = match.matchedTerm.toLowerCase() !== canonical.toLowerCase();
  return (
    <p className="text-xs text-slate-500">
      <T k="langhint.via" />{' '}
      <span className="font-medium text-slate-700">{match.matchedTerm}</span>{' '}
      <span className="text-slate-400">(<T k={`langhint.src.${match.matchSource}`} />)</span>
      {showArrow && (
        <>
          {' → '}
          <span className="font-medium text-teal-700">{canonical}</span>
        </>
      )}
    </p>
  );
}
