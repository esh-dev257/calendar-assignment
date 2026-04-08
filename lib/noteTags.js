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
