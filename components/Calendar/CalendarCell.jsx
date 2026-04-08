import { dateKey, compareKeys, isBetween } from '@/lib/dateUtils';
import { normalizeNote, tagColor, getDateNoteKeys } from '@/lib/noteTags';

export default function CalendarCell({
  cell,
  index = 0,
  todayKey,
  selection,
  hoveredKey,
  notes,
  rangeIndex,
  onClickDate,
  onHoverDate,
}) {
  const key = dateKey(cell.year, cell.month, cell.day);
  const isToday = key === todayKey;
  const dateNoteKeys = getDateNoteKeys(notes, key);
  const noteCount = dateNoteKeys.length;
  const hasNote = noteCount > 0;
  const firstNote = hasNote ? normalizeNote(notes[dateNoteKeys[0]]) : { text: '', tag: null };

  // rangeIndex now stores an array of overlapping ranges per date
  const rangesRaw = rangeIndex && rangeIndex.get(key);
  const ranges = Array.isArray(rangesRaw) ? rangesRaw : rangesRaw ? [rangesRaw] : [];
  const hasRangeNote = ranges.length > 0;
  const firstRangeData = hasRangeNote ? normalizeNote(notes[ranges[0].rangeKey]) : null;
  const noteColor = hasNote
    ? tagColor(firstNote.tag)
    : firstRangeData
      ? tagColor(firstRangeData.tag)
      : 'var(--accent)';

  // Determine selection state (including in-progress hover preview)
  let liveStart = selection.startKey;
  let liveEnd = selection.endKey;
  if (selection.phase === 'selecting' && hoveredKey && !liveEnd) {
    liveEnd = hoveredKey;
  }

  let normStart = liveStart;
  let normEnd = liveEnd;
  if (normStart && normEnd && compareKeys(normStart, normEnd) > 0) {
    [normStart, normEnd] = [normEnd, normStart];
  }

  const isStart = normStart && key === normStart;
  const isEnd = normEnd && key === normEnd && normStart !== normEnd;
  const inRange = isBetween(key, normStart, normEnd);
  const isSinglePick = normStart && normEnd && normStart === normEnd && key === normStart;

  const classes = [
    'cal-cell',
    cell.inMonth ? 'is-in-month' : 'is-out-month',
    isToday ? 'is-today' : '',
    isStart ? 'is-range-start' : '',
    isEnd ? 'is-range-end' : '',
    inRange ? 'is-in-range' : '',
    isSinglePick ? 'is-single' : '',
    hasNote ? 'has-note' : '',
    hasRangeNote ? 'has-range-note' : '',
    ranges.some((r) => r.isStart) ? 'has-range-note-start' : '',
    ranges.some((r) => r.isEnd) ? 'has-range-note-end' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      style={{ '--i': index, '--note-color': noteColor }}
      onClick={() => onClickDate(key, cell)}
      onMouseEnter={() => onHoverDate(key)}
      onFocus={() => onHoverDate(key)}
      aria-label={`${cell.year}-${cell.month + 1}-${cell.day}${hasNote ? `, ${noteCount} note${noteCount === 1 ? '' : 's'}` : ''}${hasRangeNote ? `, in ${ranges.length} saved range${ranges.length === 1 ? '' : 's'}` : ''}`}
      title={hasRangeNote ? `Part of ${ranges.length} saved range note${ranges.length === 1 ? '' : 's'}` : undefined}
    >
      <span className="cal-cell__bg" aria-hidden="true" />

      {ranges.map((r, i) => {
        const rd = normalizeNote(notes[r.rangeKey]);
        const rc = tagColor(rd.tag);
        const stripClass = [
          'cal-cell__range-strip',
          r.isStart ? 'is-start' : '',
          r.isEnd ? 'is-end' : '',
        ].filter(Boolean).join(' ');
        return (
          <span
            key={r.rangeKey}
            className={stripClass}
            style={{ '--strip-color': rc, '--strip-i': i }}
            aria-hidden="true"
          />
        );
      })}

      <span className="cal-cell__num-wrap">
        {dateNoteKeys.slice(0, 4).map((k, i) => {
          const n = normalizeNote(notes[k]);
          return (
            <span
              key={k}
              className="cal-cell__note-ring"
              style={{ '--ring-i': i, '--ring-color': tagColor(n.tag) }}
              aria-hidden="true"
            />
          );
        })}
        <span className="cal-cell__num">{cell.day}</span>
      </span>
      {noteCount > 4 && (
        <span className="cal-cell__count" aria-hidden="true">+{noteCount - 4}</span>
      )}
    </button>
  );
}
