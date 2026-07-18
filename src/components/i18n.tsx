'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_LANG, LANG_STORAGE_KEY, translate, type Lang } from '@/lib/i18n';

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<Ctx>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => translate(DEFAULT_LANG, key),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start at the default so server and first client render match (no hydration
  // mismatch); adopt the stored preference on mount.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    // Adopt the stored preference after mount. This must run in an effect (not a
    // lazy initializer) so server and first client render match — localStorage
    // is unavailable during SSR, and reading it eagerly would cause a hydration
    // mismatch when the stored language differs from the default.
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'en' || stored === 'pl') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(stored);
    } else if (window.navigator.language?.toLowerCase().startsWith('pl')) {
      // No saved choice yet: default to Polish for Polish-locale browsers.
      setLangState('pl');
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch {
      /* ignore storage errors */
    }
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

/** Translation function hook for client components. */
export function useT() {
  return useContext(LanguageContext).t;
}

/** Inline translated string, usable inside Server Components. */
export function T({ k }: { k: string }) {
  const { t } = useContext(LanguageContext);
  return <>{t(k)}</>;
}

/** EN / PL toggle for the header. */
export function LangToggle() {
  const { lang, setLang, t } = useContext(LanguageContext);
  return (
    <div
      className="inline-flex overflow-hidden rounded-md border border-slate-200 text-xs"
      role="group"
      aria-label={t('lang.toggle.aria')}
    >
      {(['en', 'pl'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2 py-1 font-medium uppercase transition ${
            lang === l ? 'bg-teal-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
