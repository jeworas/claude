'use client';

import { useT } from '@/components/i18n';

/**
 * Print / Save-as-PDF trigger. Marked `no-print` so it doesn't appear in the
 * printed output. Pairs with the print styles in globals.css.
 */
export default function PrintButton() {
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-300"
    >
      🖨 {t('guideline.print')}
    </button>
  );
}
