import { useMemo } from 'react';
import { buildMonthGrid, DAY_LABELS_MON_FIRST, dateKey, compareKeys, diffDaysInclusive } from '@/lib/dateUtils';
import CalendarCell from './CalendarCell';

export default function CalendarGrid({
  year,
  month,
  todayKey,
  selection,
  hoveredKey,
  notes,
  rangeIndex,
  onClickDate,
  onHoverDate,
  onLeaveGrid,
}) {
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  // Tooltip showing # of days in selection
  let count = 0;
  if (selection.startKey && selection.endKey) {
    count = diffDaysInclusive(selection.startKey, selection.endKey);
  } else if (selection.startKey && hoveredKey && selection.phase === 'selecting') {
    count = diffDaysInclusive(selection.startKey, hoveredKey);
  }

  return (
    <div className="cal-grid-wrap" onMouseLeave={onLeaveGrid}>
      <div className="cal-day-labels" aria-hidden="true">
        {DAY_LABELS_MON_FIRST.map((d) => (
          <div key={d} className="cal-day-label">{d}</div>
        ))}
      </div>

      <div className="cal-grid" role="grid">
        {cells.map((cell, i) => (
          <CalendarCell
            key={`${cell.year}-${cell.month}-${cell.day}-${i}`}
            cell={cell}
            index={i}
            todayKey={todayKey}
            selection={selection}
            hoveredKey={hoveredKey}
            notes={notes}
            rangeIndex={rangeIndex}
            onClickDate={onClickDate}
            onHoverDate={onHoverDate}
          />
        ))}
      </div>

      {count > 1 && (
        <div className="cal-range-tooltip" role="status">{count} days</div>
      )}
    </div>
  );
}
