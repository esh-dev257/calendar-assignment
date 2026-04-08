import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  NotebookPen,
} from "lucide-react";
import { MONTH_NAMES } from "@/lib/dateUtils";

export default function CalendarHeader({
  year,
  month,
  onPrev,
  onNext,
  onToday,
  hasMonthNote,
  onOpenMonthNote,
}) {
  return (
    <div className="cal-header">
      <div className="cal-header__title">
        <h1 className="cal-header__month">{MONTH_NAMES[month]}</h1>
        <span className="cal-header__year">{year}</span>
        {hasMonthNote && (
          <button
            type="button"
            className="cal-header__month-note"
            onClick={onOpenMonthNote}
            aria-label={`Open ${MONTH_NAMES[month]} ${year} month note`}
            title="Month note saved - click to view"
          >
            <NotebookPen size={12} />
            <span>Month note</span>
          </button>
        )}
      </div>

      <div className="cal-header__nav">
        <button
          type="button"
          className="cal-nav-btn"
          onClick={onPrev}
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          className="cal-nav-btn cal-nav-btn--today"
          onClick={onToday}
          aria-label="Jump to today"
        >
          <CalendarDays size={14} />
          <span>Today</span>
        </button>
        <button
          type="button"
          className="cal-nav-btn"
          onClick={onNext}
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
