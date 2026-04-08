import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function ThemeSwitcher() {
  const { theme, changeTheme, themes } = useTheme();
  const idx = Math.max(0, themes.findIndex((t) => t.id === theme));
  const current = themes[idx];

  const step = (delta) => {
    const next = (idx + delta + themes.length) % themes.length;
    changeTheme(themes[next].id);
  };

  return (
    <div className="theme-switcher" role="group" aria-label="Theme selector">
      <button
        type="button"
        className="theme-switcher__arrow"
        onClick={() => step(-1)}
        aria-label="Previous theme"
      >
        <ChevronLeft size={16} />
      </button>

      <button
        type="button"
        className="theme-switcher__current"
        onClick={() => step(1)}
        aria-live="polite"
        title={`${current.label} — click to cycle`}
      >
        <span className="theme-switcher__dot" style={{ background: current.swatch }} />
        <span className="theme-switcher__label">{current.label}</span>
      </button>

      <button
        type="button"
        className="theme-switcher__arrow"
        onClick={() => step(1)}
        aria-label="Next theme"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
