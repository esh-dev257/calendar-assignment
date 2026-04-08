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
  const rangeNote = rangeIndex && rangeIndex.get(key);
  const rangeNoteData = rangeNote ? normalizeNote(notes[rangeNote.rangeKey]) : null;
  const noteColor = hasNote
    ? tagColor(firstNote.tag)
    : rangeNoteData
      ? tagColor(rangeNoteData.tag)
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
    rangeNote ? 'has-range-note' : '',
    rangeNote && rangeNote.isStart ? 'has-range-note-start' : '',
    rangeNote && rangeNote.isEnd ? 'has-range-note-end' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      style={{ '--i': index, '--note-color': noteColor }}
      onClick={() => onClickDate(key, cell)}
      onMouseEnter={() => onHoverDate(key)}
      onFocus={() => onHoverDate(key)}
      aria-label={`${cell.year}-${cell.month + 1}-${cell.day}${hasNote ? `, ${noteCount} note${noteCount === 1 ? '' : 's'}` : ''}${rangeNote ? ', part of saved range' : ''}`}
      title={rangeNote ? 'Part of a saved range note' : undefined}
    >
      <span className="cal-cell__bg" aria-hidden="true" />
      {rangeNote && <span className="cal-cell__range-strip" aria-hidden="true" />}
      <span className="cal-cell__num">{cell.day}</span>
      {noteCount > 1 && <span className="cal-cell__count" aria-hidden="true">{noteCount}</span>}
    </button>
  );
}
