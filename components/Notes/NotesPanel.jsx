import { X, Trash2, ChevronRight } from 'lucide-react';
import NoteEditor from './NoteEditor';
import { MONTH_NAMES, MONTH_ABBR } from '@/lib/dateUtils';
import { normalizeNote, getTag } from '@/lib/noteTags';

function formatNoteKey(key) {
  if (key.includes(':')) {
    const [s, e] = key.split(':');
    const [sy, sm, sd] = s.split('-').map((n) => parseInt(n, 10));
    const [ey, em, ed] = e.split('-').map((n) => parseInt(n, 10));
    return { eyebrow: 'Range', title: `${MONTH_ABBR[sm - 1]} ${sd} – ${MONTH_ABBR[em - 1]} ${ed}, ${ey}` };
  }
  if (key.length === 7) {
    const [y, m] = key.split('-').map((n) => parseInt(n, 10));
    return { eyebrow: 'Month', title: `${MONTH_NAMES[m - 1]} ${y}` };
  }
  const [y, m, d] = key.split('-').map((n) => parseInt(n, 10));
  return { eyebrow: 'Date', title: `${MONTH_NAMES[m - 1]} ${d}, ${y}` };
}

function sortKey(key) {
  if (key.includes(':')) return key.split(':')[0];
  if (key.length === 7) return `${key}-00`;
  return key;
}

export default function NotesPanel({
  open,
  onClose,
  activeNote,
  monthYear,
  notes,
  onSaveNote,
  onDeleteNote,
  onOpenNote,
}) {
  if (!activeNote) return null;

  const monthNoteKey = `${monthYear.year}-${String(monthYear.month + 1).padStart(2, '0')}`;
  const monthNote = normalizeNote(notes[monthNoteKey]);
  const activeNoteData = normalizeNote(notes[activeNote.key]);

  const sortedKeys = Object.keys(notes).sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  const isList = activeNote.kind === 'list';

  return (
    <>
      <div
        className={`notes-backdrop ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`notes-panel ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-label="Notes panel"
      >
        <div className="notes-panel__clip" aria-hidden="true">
          <span /><span />
        </div>

        <header className="notes-panel__header">
          <div>
            <p className="notes-panel__eyebrow">
              {isList ? 'Library' : activeNote.kind === 'range' ? 'Date Range' : activeNote.kind === 'month' ? 'Month Note' : 'Single Date'}
            </p>
            <h2 className="notes-panel__title">{activeNote.title}</h2>
            {activeNote.subtitle && <p className="notes-panel__sub">{activeNote.subtitle}</p>}
          </div>
          <button type="button" className="notes-panel__close" onClick={onClose} aria-label="Close notes panel">
            <X size={18} />
          </button>
        </header>

        <div className="notes-panel__body">
          {!isList && (
            <NoteEditor
              noteKey={activeNote.key}
              title={activeNote.title}
              subtitle={activeNote.subtitle || ''}
              value={activeNoteData.text}
              tag={activeNoteData.tag}
              onSave={(text, tag) => onSaveNote(activeNote.key, text, tag)}
              onDelete={() => onDeleteNote(activeNote.key)}
            />
          )}

          {!isList && activeNote.kind !== 'month' && (
            <div className="notes-panel__month-block">
              <p className="notes-panel__divider-label">Or jot a note for the entire month</p>
              <NoteEditor
                noteKey={monthNoteKey}
                title={`${MONTH_NAMES[monthYear.month]} ${monthYear.year}`}
                subtitle="Month note"
                value={monthNote.text}
                tag={monthNote.tag}
                onSave={(text, tag) => onSaveNote(monthNoteKey, text, tag)}
                onDelete={() => onDeleteNote(monthNoteKey)}
              />
            </div>
          )}

          {sortedKeys.length > 0 && (
            <div className="saved-notes">
              <p className="notes-panel__divider-label">
                {isList ? 'All saved notes' : 'Saved notes'}
              </p>
              <ul className="saved-notes__list">
                {sortedKeys.map((k) => {
                  const meta = formatNoteKey(k);
                  const n = normalizeNote(notes[k]);
                  const t = getTag(n.tag);
                  const preview = (n.text || '').replace(/\s+/g, ' ').trim().slice(0, 90);
                  const isActive = !isList && k === activeNote.key;
                  return (
                    <li
                      key={k}
                      className={`saved-note ${isActive ? 'is-active' : ''}`}
                      style={t ? { '--tag-color': t.color } : undefined}
                    >
                      <button
                        type="button"
                        className="saved-note__open"
                        onClick={() => onOpenNote(k)}
                      >
                        <span className="saved-note__eyebrow">
                          {t && <span className="saved-note__tag-dot" style={{ background: t.color }} />}
                          {meta.eyebrow}{t ? ` · ${t.label}` : ''}
                        </span>
                        <span className="saved-note__title">{meta.title}</span>
                        {preview && <span className="saved-note__preview">{preview}</span>}
                        <ChevronRight size={14} className="saved-note__chev" />
                      </button>
                      <button
                        type="button"
                        className="saved-note__delete"
                        onClick={(e) => { e.stopPropagation(); onDeleteNote(k); }}
                        aria-label={`Delete note for ${meta.title}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {isList && sortedKeys.length === 0 && (
            <p className="saved-notes__empty">No notes yet. Click any date on the calendar to add one.</p>
          )}
        </div>
      </aside>
    </>
  );
}
