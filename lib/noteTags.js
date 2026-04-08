// Tag system for notes. Notes are persisted as { text, tag } where tag is one
// of the IDs below or null. Old string-only notes are migrated transparently.

export const TAGS = [
  { id: 'work',     label: 'Work',     color: '#3B82F6' },
  { id: 'personal', label: 'Personal', color: '#EC4899' },
  { id: 'travel',   label: 'Travel',   color: '#10B981' },
  { id: 'other',    label: 'Other',    color: '#F59E0B' },
];

const TAG_BY_ID = TAGS.reduce((acc, t) => { acc[t.id] = t; return acc; }, {});

export function getTag(tagId) {
  return tagId ? TAG_BY_ID[tagId] || null : null;
}

export function tagColor(tagId, fallback = 'var(--accent)') {
  const t = getTag(tagId);
  return t ? t.color : fallback;
}

// Normalize a stored value into { text, tag }. Accepts legacy strings.
export function normalizeNote(raw) {
  if (raw == null) return { text: '', tag: null };
  if (typeof raw === 'string') return { text: raw, tag: null };
  return { text: raw.text || '', tag: raw.tag || null };
}

export function getNoteText(notes, key) {
  return normalizeNote(notes[key]).text;
}

export function getNoteTag(notes, key) {
  return normalizeNote(notes[key]).tag;
}

// Return all storage keys belonging to a single calendar date.
// A date can have one base note ("YYYY-MM-DD") plus any number of
// additional notes keyed "YYYY-MM-DD#1", "YYYY-MM-DD#2", ... (sorted naturally).
export function getDateNoteKeys(notes, dateKey) {
  const keys = [];
  if (notes[dateKey]) keys.push(dateKey);
  Object.keys(notes).forEach((k) => {
    if (k.startsWith(`${dateKey}#`)) keys.push(k);
  });
  return keys.sort((a, b) => {
    const an = a.includes('#') ? parseInt(a.split('#')[1], 10) : 0;
    const bn = b.includes('#') ? parseInt(b.split('#')[1], 10) : 0;
    return an - bn;
  });
}

// Find a fresh suffix key for a brand-new note on this date.
export function nextDateNoteKey(notes, dateKey) {
  if (!notes[dateKey]) return dateKey;
  let n = 1;
  while (notes[`${dateKey}#${n}`]) n += 1;
  return `${dateKey}#${n}`;
}

// Migrate the entire notes map (one-time on load) to the canonical shape.
export function migrateNotes(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  Object.keys(raw).forEach((k) => {
    const n = normalizeNote(raw[k]);
    if (n.text && n.text.trim()) out[k] = n;
  });
  return out;
}
