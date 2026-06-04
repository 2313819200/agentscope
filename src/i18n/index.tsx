import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import { T, type Lang } from './translations';

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'zh',
  setLang: () => {},
  t: (k) => k,
});

function loadLang(): Lang {
  try {
    const saved = localStorage.getItem('agentscope_lang');
    if (saved === 'en' || saved === 'zh') return saved;
    return navigator.language.startsWith('zh') ? 'zh' : 'en';
  } catch {
    return 'zh';
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('agentscope_lang', l);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const entry = T[key];
      if (!entry) return key;
      return entry[lang];
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
