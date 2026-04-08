import { heroFor } from '@/lib/heroImages';
import { MONTH_NAMES } from '@/lib/dateUtils';

export default function HeroImagePanel({ month, year }) {
  const src = heroFor(month);
  return (
    <div className="hero-panel">
      <div className="hero-panel__frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`${MONTH_NAMES[month]} ${year}`} className="hero-panel__img" />
        <div className="hero-panel__overlay" aria-hidden="true" />
      </div>
      <div className="hero-panel__caption">
        <span className="hero-panel__month">{MONTH_NAMES[month]}</span>
        <span className="hero-panel__year">{year}</span>
      </div>
    </div>
  );
}
