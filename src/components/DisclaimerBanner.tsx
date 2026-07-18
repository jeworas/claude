import { T } from '@/components/i18n';

/**
 * Persistent professional-use disclaimer. Rendered in the root layout so it
 * appears on every page — this is a reference index, not medical advice.
 */
export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900">
      <div className="mx-auto max-w-6xl px-4 py-2 text-xs sm:text-[13px] leading-snug">
        <T k="disclaimer.text" />
      </div>
    </div>
  );
}
