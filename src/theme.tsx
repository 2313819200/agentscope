import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem('agentscope_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(loadTheme);

  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.classList.toggle('theme-light', t === 'light');
    localStorage.setItem('agentscope_theme', t);
  }, []);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      applyTheme(t);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
