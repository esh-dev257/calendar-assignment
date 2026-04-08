// Date helpers - Monday-first calendar grid

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_ABBR = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

export const DAY_LABELS_MON_FIRST = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function dateKey(year, month, day) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

export function monthKey(year, month) {
  return `${year}-${pad2(month + 1)}`;
}

export function rangeKey(startKey, endKey) {
  return `${startKey}:${endKey}`;
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Returns 0=Mon ... 6=Sun (offset for Monday-first grid)
export function mondayIndex(year, month, day = 1) {
  const js = new Date(year, month, day).getDay(); // 0=Sun
  return (js + 6) % 7;
}

// Build the month grid: leading days from previous month (to align the
// first row to Monday) + current month days. No trailing next-month days.
export function buildMonthGrid(year, month) {
  const cells = [];
  const firstOffset = mondayIndex(year, month, 1);
  const total = daysInMonth(year, month);
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevTotal = daysInMonth(prevYear, prevMonth);

  // leading days
  for (let i = firstOffset - 1; i >= 0; i--) {
    const d = prevTotal - i;
    cells.push({ year: prevYear, month: prevMonth, day: d, inMonth: false });
  }
  // current month
  for (let d = 1; d <= total; d++) {
    cells.push({ year, month, day: d, inMonth: true });
  }
  return cells;
}

export function compareKeys(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function isBetween(key, startKey, endKey) {
  if (!startKey || !endKey) return false;
  const [s, e] = compareKeys(startKey, endKey) <= 0 ? [startKey, endKey] : [endKey, startKey];
  return key > s && key < e;
}

// Yields each YYYY-MM-DD key from startKey to endKey inclusive.
export function iterateDateKeys(startKey, endKey) {
  const [s, e] = compareKeys(startKey, endKey) <= 0 ? [startKey, endKey] : [endKey, startKey];
  const [sy, sm, sd] = s.split('-').map((n) => parseInt(n, 10));
  const [ey, em, ed] = e.split('-').map((n) => parseInt(n, 10));
  const out = [];
  const cur = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  while (cur <= end) {
    out.push(dateKey(cur.getFullYear(), cur.getMonth(), cur.getDate()));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function diffDaysInclusive(startKey, endKey) {
  const [s, e] = compareKeys(startKey, endKey) <= 0 ? [startKey, endKey] : [endKey, startKey];
  const sd = new Date(s);
  const ed = new Date(e);
  return Math.round((ed - sd) / 86400000) + 1;
}

export function formatDateLong(year, month, day) {
  return `${MONTH_NAMES[month]} ${day}, ${year}`;
}

export function formatDateShort(year, month, day) {
  return `${MONTH_ABBR[month].slice(0, 3).charAt(0) + MONTH_ABBR[month].slice(1).toLowerCase()} ${day}`;
}
