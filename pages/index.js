import Head from "next/head";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { NotebookPen, ListChecks, Eraser } from "lucide-react";
import CalendarHeader from "@/components/Calendar/CalendarHeader";
import CalendarGrid from "@/components/Calendar/CalendarGrid";
import HeroImagePanel from "@/components/Calendar/HeroImagePanel";
import NotesPanel from "@/components/Notes/NotesPanel";
import ThemeSwitcher from "@/components/Theme/ThemeSwitcher";
import { useTheme } from "@/components/Theme/ThemeContext";
import {
  MONTH_NAMES,
  MONTH_ABBR,
  dateKey,
  monthKey,
  compareKeys,
  diffDaysInclusive,
  iterateDateKeys,
} from "@/lib/dateUtils";
import { migrateNotes, getNoteText } from "@/lib/noteTags";

const NOTES_KEY = "wallcal:notes";

const initialSelection = { startKey: null, endKey: null, phase: "idle" };
function selectionReducer(state, action) {
  switch (action.type) {
    case "click": {
      const { key } = action;
      if (state.phase === "idle" || state.phase === "complete") {
        return { startKey: key, endKey: null, phase: "selecting" };
      }
      // selecting → set end (allow same-day = single)
      return { startKey: state.startKey, endKey: key, phase: "complete" };
    }
    case "reset":
      return initialSelection;
    default:
      return state;
  }
}

export default function HomePage() {
  const { theme, mounted } = useTheme();

  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [transitionKey, setTransitionKey] = useState(`${year}-${month}`);
  const [flipDir, setFlipDir] = useState("next"); // 'next' | 'prev'

  const [selection, dispatchSelection] = useReducer(
    selectionReducer,
    initialSelection,
  );
  const [hoveredKey, setHoveredKey] = useState(null);

  const [notes, setNotes] = useState({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeNote, setActiveNote] = useState(null);

  const [notesLoaded, setNotesLoaded] = useState(false);

  // Load notes from localStorage on mount (with migration from legacy string shape).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTES_KEY);
      if (raw) setNotes(migrateNotes(JSON.parse(raw)));
    } catch (_) {}
    setNotesLoaded(true);
  }, []);

  // Persist notes - but only AFTER initial load, so we never overwrite saved
  // data with the empty initial state on first render.
  useEffect(() => {
    if (!notesLoaded) return;
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (_) {}
  }, [notes, notesLoaded]);

  // Trigger month-transition CSS class
  useEffect(() => {
    setTransitionKey(`${year}-${month}-${Date.now()}`);
  }, [year, month]);

  const goPrev = () => {
    setFlipDir("prev");
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
    dispatchSelection({ type: "reset" });
  };
  const goNext = () => {
    setFlipDir("next");
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
    dispatchSelection({ type: "reset" });
  };
  const goToday = () => {
    const ty = today.getFullYear(),
      tm = today.getMonth();
    setFlipDir(ty > year || (ty === year && tm >= month) ? "next" : "prev");
    setMonth(tm);
    setYear(ty);
    dispatchSelection({ type: "reset" });
  };

  // Map: date key -> { rangeKey, isStart, isEnd } for cells covered by a saved range note.
  const rangeIndex = useMemo(() => {
    const map = new Map();
    Object.keys(notes).forEach((k) => {
      if (!k.includes(":")) return;
      const [s, e] = k.split(":");
      const days = iterateDateKeys(s, e);
      days.forEach((d) => {
        // Last write wins if a date is in multiple ranges.
        map.set(d, {
          rangeKey: k,
          startKey: s,
          endKey: e,
          isStart: d === s,
          isEnd: d === e,
        });
      });
    });
    return map;
  }, [notes]);

  const handleClickDate = useCallback(
    (key, cell) => {
      if (!cell.inMonth) {
        setYear(cell.year);
        setMonth(cell.month);
        dispatchSelection({ type: "reset" });
        return;
      }

      // If this date already has a saved single-date note → open it for editing.
      if (getNoteText(notes, key)) {
        dispatchSelection({ type: "reset" });
        openNoteFor({ kind: "date", key });
        return;
      }
      // If this date is the START or END of a saved range → open that range note.
      // Middle dates of a range fall through to normal selection so the user can
      // create a separate single-day note that lives "inside" the range.
      const inRange = rangeIndex.get(key);
      if (
        inRange &&
        (inRange.isStart || inRange.isEnd) &&
        selection.phase !== "selecting"
      ) {
        dispatchSelection({ type: "reset" });
        openNoteFor({
          kind: "range",
          startKey: inRange.startKey,
          endKey: inRange.endKey,
        });
        return;
      }

      if (selection.phase === "complete") {
        // third click → start a fresh selection
        dispatchSelection({ type: "reset" });
        dispatchSelection({ type: "click", key });
        return;
      }

      if (selection.phase === "idle") {
        // first click - DO NOT open the panel; wait for the second click.
        dispatchSelection({ type: "click", key });
        return;
      }

      // selection.phase === 'selecting' → this is the second click
      dispatchSelection({ type: "click", key });
      const startKey = selection.startKey;
      let s = startKey,
        e = key;
      if (s && e && compareKeys(s, e) > 0) [s, e] = [e, s];
      if (s === e) {
        openNoteFor({ kind: "date", key: s });
      } else {
        openNoteFor({ kind: "range", startKey: s, endKey: e });
      }
    },
    [selection, notes, rangeIndex],
  );

  const handleHoverDate = useCallback((key) => setHoveredKey(key), []);
  const handleLeaveGrid = useCallback(() => setHoveredKey(null), []);

  function openNoteFor(target) {
    if (target.kind === "date") {
      const [y, m, d] = target.key.split("-").map((n) => parseInt(n, 10));
      setActiveNote({
        kind: "date",
        key: target.key,
        title: `${MONTH_NAMES[m - 1]} ${d}, ${y}`,
        subtitle: "Single date note",
      });
    } else if (target.kind === "range") {
      const [sy, sm, sd] = target.startKey
        .split("-")
        .map((n) => parseInt(n, 10));
      const [, em, ed] = target.endKey.split("-").map((n) => parseInt(n, 10));
      const days = diffDaysInclusive(target.startKey, target.endKey);
      setActiveNote({
        kind: "range",
        key: `${target.startKey}:${target.endKey}`,
        title: `${MONTH_ABBR[sm - 1].charAt(0) + MONTH_ABBR[sm - 1].slice(1).toLowerCase()} ${sd} – ${MONTH_ABBR[em - 1].charAt(0) + MONTH_ABBR[em - 1].slice(1).toLowerCase()} ${ed}`,
        subtitle: `${days} days · ${sy}`,
      });
    } else if (target.kind === "month") {
      setActiveNote({
        kind: "month",
        key: monthKey(year, month),
        title: `${MONTH_NAMES[month]} ${year}`,
        subtitle: "Month note",
      });
    }
    setPanelOpen(true);
  }

  const openNoteByKey = useCallback((key) => {
    dispatchSelection({ type: "reset" });
    if (key.includes(":")) {
      const [s, e] = key.split(":");
      const [sy, sm] = s.split("-").map((n) => parseInt(n, 10));
      setYear(sy);
      setMonth(sm - 1);
      openNoteFor({ kind: "range", startKey: s, endKey: e });
    } else if (key.length === 7) {
      const [y, m] = key.split("-").map((n) => parseInt(n, 10));
      setYear(y);
      setMonth(m - 1);
      setActiveNote({
        kind: "month",
        key,
        title: `${MONTH_NAMES[m - 1]} ${y}`,
        subtitle: "Month note",
      });
      setPanelOpen(true);
    } else {
      const [y, m] = key.split("-").map((n) => parseInt(n, 10));
      setYear(y);
      setMonth(m - 1);
      openNoteFor({ kind: "date", key });
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
    dispatchSelection({ type: "reset" });
  }, []);

  const handleOpenNotesList = () => {
    setActiveNote({
      kind: "list",
      key: "__list__",
      title: "All Notes",
      subtitle: `${Object.keys(notes).length} saved`,
    });
    setPanelOpen(true);
  };

  const handleSaveNote = (key, text, tag = null) => {
    setNotes((prev) => {
      const next = { ...prev };
      if (!text || !text.trim()) delete next[key];
      else next[key] = { text, tag: tag || null };
      return next;
    });
  };
  const handleDeleteNote = (key) => {
    setNotes((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Wipe every note that touches the currently displayed month: the month
  // note itself, every single-date note in the month, and every range note
  // whose start date falls in the month.
  const handleClearMonth = () => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const candidates = Object.keys(notes).filter((k) => {
      if (k === monthPrefix) return true; // month note
      if (k.length === 10 && k.startsWith(monthPrefix)) return true; // single date
      if (k.includes(":") && k.startsWith(monthPrefix)) return true; // range starting this month
      return false;
    });
    if (candidates.length === 0) return;
    const ok = window.confirm(
      `Clear ${candidates.length} note${candidates.length === 1 ? "" : "s"} for ${MONTH_NAMES[month]} ${year}? This cannot be undone.`,
    );
    if (!ok) return;
    setNotes((prev) => {
      const next = { ...prev };
      candidates.forEach((k) => {
        delete next[k];
      });
      return next;
    });
    if (panelOpen) setPanelOpen(false);
  };

  // Avoid SSR theme flash
  if (!mounted) {
    return <div style={{ minHeight: "100vh", background: "#F5F0E8" }} />;
  }

  return (
    <>
      <Head>
        <title>
          Wall Calendar - {MONTH_NAMES[month]} {year}
        </title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta
          name="description"
          content="An interactive wall calendar with rich themes and notes."
        />
      </Head>

      <main className={`page page--${theme}`}>
        <div className="page__topbar">
          <div className="brand">
            <NotebookPen size={18} />
            <span>WALL · CALENDAR</span>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="notes-list-btn"
              onClick={handleOpenNotesList}
            >
              <ListChecks size={14} />
              <span>My Notes ({Object.keys(notes).length})</span>
            </button>
            <ThemeSwitcher />
          </div>
        </div>

        <section
          className={`calendar-shell flip-${flipDir}`}
          key={transitionKey}
        >
          {/* Funky theme uses a vertical month spine in CSS pseudo elements */}
          <div className="month-spine" aria-hidden="true">
            {MONTH_NAMES[month]}
          </div>

          <div className="calendar-shell__left">
            <div className="month-block">
              <span className="month-block__abbr">{MONTH_ABBR[month]}</span>
              <span className="month-block__year">{year}</span>
            </div>

            <HeroImagePanel month={month} year={year} />

            <div className="left-foot">
              <button
                type="button"
                className="month-note-btn"
                onClick={() => openNoteFor({ kind: "month" })}
              >
                <NotebookPen size={14} />
                <span>
                  {getNoteText(notes, monthKey(year, month))
                    ? "Edit Month Note"
                    : "Add Month Note"}
                </span>
              </button>
              <button
                type="button"
                className="month-note-btn month-note-btn--danger"
                onClick={handleClearMonth}
              >
                <Eraser size={14} />
                <span>Clear Month Notes</span>
              </button>
            </div>
          </div>

          <div className="calendar-shell__right">
            <CalendarHeader
              year={year}
              month={month}
              onPrev={goPrev}
              onNext={goNext}
              onToday={goToday}
            />
            <CalendarGrid
              year={year}
              month={month}
              todayKey={todayKey}
              selection={selection}
              hoveredKey={hoveredKey}
              notes={notes}
              rangeIndex={rangeIndex}
              onClickDate={handleClickDate}
              onHoverDate={handleHoverDate}
              onLeaveGrid={handleLeaveGrid}
            />
            <p className="cal-hint">
              {selection.phase === "selecting"
                ? "Now click an end date to create a range - or click the same date again for a single-day note."
                : "Click a date to start a selection · Click a second date to create a range · Click a saved note to edit it"}
            </p>
          </div>
        </section>

        <NotesPanel
          open={panelOpen}
          onClose={handleClosePanel}
          activeNote={activeNote}
          monthYear={{ year, month }}
          notes={notes}
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
          onOpenNote={openNoteByKey}
        />
      </main>
    </>
  );
}
