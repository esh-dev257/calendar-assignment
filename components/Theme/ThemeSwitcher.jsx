import { useTheme } from './ThemeContext';

export default function ThemeSwitcher() {
  const { theme, changeTheme, themes } = useTheme();

  return (
    <div className="theme-switcher" role="group" aria-label="Theme selector">
      {themes.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => changeTheme(t.id)}
          className={`theme-swatch ${theme === t.id ? 'is-active' : ''}`}
          aria-pressed={theme === t.id}
          aria-label={t.label}
          title={t.label}
        >
          <span className="theme-swatch__dot" style={{ background: t.swatch }} />
          <span className="theme-swatch__label">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
