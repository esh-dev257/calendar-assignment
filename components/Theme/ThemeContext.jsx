import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export const THEMES = [
  { id: 'minimalistic-light', label: 'Minimalistic Light', swatch: '#E8402A' },
  { id: 'minimalistic-dark',  label: 'Minimalistic Dark',  swatch: '#F5A623' },
  { id: 'funky',              label: 'Funky',              swatch: '#FF2D87' },
  { id: 'retro',              label: 'Retro',              swatch: '#C0392B' },
];

const STORAGE_KEY = 'wallcal:theme';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('minimalistic-light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && THEMES.find((t) => t.id === stored)) {
        setTheme(stored);
      }
    } catch (_) { /* ignore */ }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }, [theme, mounted]);

  const changeTheme = useCallback((id) => setTheme(id), []);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, themes: THEMES, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
