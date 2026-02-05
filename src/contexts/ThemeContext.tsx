import * as React from 'react';

const STORAGE_KEY = 'plc-theme-dark';

type ThemeContextValue = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getInitialDark(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = React.useState(getInitialDark);

  React.useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(STORAGE_KEY, String(isDark));
  }, [isDark]);

  const toggleTheme = React.useCallback(() => setIsDark((v) => !v), []);

  const value = React.useMemo(
    () => ({ isDark, toggleTheme }),
    [isDark, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
