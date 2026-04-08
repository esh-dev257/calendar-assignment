import { useEffect, useState } from 'react';
import { Download, Save, Trash2, Check } from 'lucide-react';
import { exportNoteCard } from '@/components/Export/exportNote';
import { useTheme } from '@/components/Theme/ThemeContext';
import { TAGS } from '@/lib/noteTags';

export default function NoteEditor({ noteKey, title, subtitle, value, tag, onSave, onDelete }) {
  const [draft, setDraft] = useState(value || '');
  const [draftTag, setDraftTag] = useState(tag || null);
  const [savedFlash, setSavedFlash] = useState(false);
  const { theme } = useTheme();


  useEffect(() => {
    setDraft(value || '');
    setDraftTag(tag || null);
  }, [noteKey, value, tag]);

  const handleSave = () => {
    onSave(draft, draftTag);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1100);
  };

  const handleExport = async () => {
    if (!draft.trim()) return;
    await exportNoteCard({ title, subtitle, body: draft, themeId: theme });
  };

  return (
    <div className="note-editor">
      <label htmlFor={`note-${noteKey}`} className="note-editor__label">Your note</label>
      <textarea
        id={`note-${noteKey}`}
        className="note-editor__textarea"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write something worth remembering…"
        rows={8}
      />

      <div className="note-editor__tags">
        <span className="note-editor__label">Tag</span>
        <div className="tag-chips" role="radiogroup" aria-label="Note tag">
          <button
            type="button"
            role="radio"
            aria-checked={draftTag === null}
            className={`tag-chip tag-chip--none ${draftTag === null ? 'is-active' : ''}`}
            onClick={() => setDraftTag(null)}
          >
            <span className="tag-chip__dot tag-chip__dot--none" />
            None
          </button>
          {TAGS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={draftTag === t.id}
              className={`tag-chip ${draftTag === t.id ? 'is-active' : ''}`}
              style={{ '--chip-color': t.color }}
              onClick={() => setDraftTag(t.id)}
            >
              <span className="tag-chip__dot" style={{ background: t.color }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="note-editor__actions">
        <button type="button" className="note-btn note-btn--primary" onClick={handleSave}>
          {savedFlash ? <Check size={15} /> : <Save size={15} />}
          <span>{savedFlash ? 'Saved' : 'Save'}</span>
        </button>

        <button
          type="button"
          className="note-btn"
          onClick={handleExport}
          disabled={!draft.trim()}
          aria-label="Export note as image"
        >
          <Download size={15} />
          <span>Export</span>
        </button>

        {value && (
          <button
            type="button"
            className="note-btn note-btn--danger"
            onClick={() => { onDelete(); setDraft(''); setDraftTag(null); }}
            aria-label="Delete note"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

    </div>
  );
}
