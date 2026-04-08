# Interactive Wall Calendar

A polished, frontend-only React + Next.js wall calendar application with four hand-crafted visual themes, a date-range selector, persistent notes per date / range / month, color-coded tags, a saved-notes library, and a one-click postcard exporter. Everything persists in `localStorage`; there is no backend.

## Tech Stack

- **Next.js 14** (Pages Router) + **React 18**
- Vanilla **CSS** with CSS variables driven by a `data-theme` attribute on `<html>`
- **lucide-react** for all UI icons
- **html2canvas** for the postcard image export (with a native Canvas fallback)
- Google Fonts: DM Serif Display, DM Sans, Bebas Neue, Space Mono, Playfair Display, Courier Prime

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Features

- **4 fully distinct themes** - Minimalistic Light, Minimalistic Dark, Funky, Retro. Each owns its own typography, palette, layout personality, animation language, and notes panel style. The active theme persists in `localStorage`.
- **Wall calendar layout** - Two-panel desktop layout: hero image + month identity on the left, calendar grid on the right. The calendar is sized to fit a single viewport (no scrolling needed at 100% zoom). Stacks vertically on tablet and mobile, with a larger hero image on phones.
- **Date range selector** - Click once to set the start, hover to preview, click a second date to set the end. A floating tooltip shows the day count. Clicking the same date twice creates a single-day note. The third click resets. Range visuals are theme-specific.
- **Notes system** - Three kinds of notes, all in one panel:
  - Single-date notes keyed by `YYYY-MM-DD`
  - Range notes keyed by `YYYY-MM-DD:YYYY-MM-DD`
  - Month notes keyed by `YYYY-MM`
- **Color-coded tags** - Each note can be tagged Work / Personal / Travel / Other (or none). The tag color drives the dotted ring around dates, the range strip, and the left border of entries in the saved-notes library.
- **Visual indicators** - Single-date notes show a dotted ring around the date number; range notes show a striped strip with rounded pill caps at the start and end. Today gets its own animated pulse ring.
- **Saved-notes library** - A "My Notes" button in the topbar opens a sortable list of every saved note with kind, title, tag, and a 90-char preview. Click any entry to jump to that month and edit; trash icon to delete. The same list also appears at the bottom of the panel while editing, so users can hop between notes without closing.
- **Notes-inside-a-range** - Clicking the start or end of a saved range opens its note for editing; clicking a middle date leaves the range intact and starts a fresh selection, so users can attach a separate single-day note inside an existing range.
- **Clear month notes** - A one-click "Clear Month Notes" button on the left panel wipes the month note plus every single-date and range-starting-this-month note, gated by a confirm dialog.
- **Postcard export** - Any saved note can be exported as a styled PNG card via `html2canvas`. The card is rendered with theme-appropriate colors and typography, then downloaded directly. A native Canvas fallback ensures it still works if `html2canvas` is unavailable.
- **Page-flip month transition** - Each month change triggers a direction-aware 3D flip animation (top hinge for next, bottom hinge for prev). Honors `prefers-reduced-motion`.
- **Cell stagger animation** - Date cells fade in with a tiny per-cell delay on month change, plus a slow accent pulse on today's cell.
- **Print stylesheet** - `@media print` hides the topbar, notes panel, hint text, and animations; switches to landscape; and converts indicators to monochrome so the calendar prints cleanly.
- **Responsive** - Two-panel desktop, single-column tablet, full bottom-sheet mobile.
- **Accessibility** - `aria-label`s on every date cell with full date and any context (has-note, part of saved range), labeled textareas, focusable controls, and `prefers-reduced-motion` support throughout.
- **SVG favicon** - A small wall-calendar glyph in the brand palette, served from `/favicon.svg`.

## Theme Design Rationale

| Theme                  | Vision                               | Defining Move                                                                                                                           |
| ---------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Minimalistic Light** | Swiss editorial / luxury stationery  | The silence between elements; oversized serif month abbreviation in the corner; coral capsule range marker                              |
| **Minimalistic Dark**  | Architect's desk at midnight         | Same Swiss restraint inverted into deep charcoal with luminous amber accents                                                            |
| **Funky**              | Tokyo record store × Risograph print | Vertical Bebas Neue month spine, hard black borders, monochrome flood-fill range, hanging-note paper card with binder-ring clip         |
| **Retro**              | 1960s European travel poster         | Outlined poster frame, italic Playfair Display headlines, mustard-yellow circle range markers, hand-drawn underline for in-between days |

## Architectural Decisions

- **State**: `useState` + `useReducer` are sufficient. The selection state machine (`idle → selecting → complete`) lives in a small reducer; the rest is local state hoisted into the page component. No Redux, no Zustand, no SWR.
- **Theme system**: a single `ThemeContext` writes the current theme name to `data-theme` on the root `<html>`. Each theme is a CSS file scoped under `[data-theme='...']` that overrides CSS variables defined in `globals.css`. Swapping themes is one attribute change with no remount.
- **Persistence**: `notes` is a single map serialised to `localStorage` on every change. Date-keyed, range-keyed, and month-keyed notes share the same map because their key formats are unambiguous (`YYYY-MM-DD`, `YYYY-MM-DD:YYYY-MM-DD`, `YYYY-MM`). A `notesLoaded` guard prevents the empty initial state from clobbering stored data on first render. Notes are stored as `{text, tag}`; legacy string-only notes auto-migrate on load via `lib/noteTags.js#migrateNotes`.
- **Tag colors as CSS variables**: each cell exposes its note's tag color via a `--note-color` custom property; the dotted ring and range strip just read that variable, so no per-tag CSS class explosion is needed.
- **Range index**: a memoized `Map<dateKey, {rangeKey, isStart, isEnd}>` is built once per `notes` change so cells can answer "am I inside a saved range?" in O(1) without re-scanning the notes map on every render.
- **Export**: a dynamic `import('html2canvas')` lets the bundler tree-shake it if it's never invoked, and a native Canvas drawing fallback guarantees export still works in environments where the package fails to load.

## File Layout

```
components/
  Calendar/    CalendarHeader, CalendarGrid, CalendarCell, HeroImagePanel
  Notes/       NotesPanel, NoteEditor
  Theme/       ThemeContext, ThemeSwitcher
  Export/      exportNote.js
lib/
  dateUtils.js, heroImages.js, noteTags.js
pages/
  _app.js, _document.js, index.js
public/
  favicon.svg
styles/
  globals.css, themes/{minimalistic-light, minimalistic-dark, funky, retro}.css
```
