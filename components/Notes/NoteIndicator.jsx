// Hand-drawn looking "scribble" mark for cells with a single-date note.
// Two short ink-like strokes that imitate a wax pencil tick on a paper calendar.
export default function NoteIndicator() {
  return (
    <span className="note-indicator" aria-hidden="true">
      <svg
        viewBox="0 0 22 14"
        width="18"
        height="11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* main wavy underline */}
        <path d="M2 9 C 5 4, 9 13, 12 7 S 18 4, 20 8" />
        {/* tiny accent dash */}
        <path d="M16 2 L 19 1.2" opacity="0.7" />
      </svg>
    </span>
  );
}
