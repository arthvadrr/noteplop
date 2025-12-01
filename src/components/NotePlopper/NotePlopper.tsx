import { useState } from 'react';
import ToolPalette from './_ToolPalette';
import Staff from './_Staff';
import type { ReactNode } from 'react';
import type {
  NoteDuration,
  PlacedNote,
  GhostNote
} from './NotePlopper.types';

/**
 * Staff configuration constants
 */
const LINE_SPACING = 75; // Distance between staff lines and ledger lines
const STAFF_LINE_POSITIONS = [
  250,  // Line 1 (top staff line)
  325,  // Line 2
  400,  // Line 3 (middle - centered in 800px height)
  475,  // Line 4
  550,  // Line 5 (bottom staff line)
];

// Ledger line positions (4 above, 4 below)
const LEDGER_LINE_POSITIONS_ABOVE = [
  250 - LINE_SPACING,     // 175 - 1st ledger above
  250 - LINE_SPACING * 2, // 100 - 2nd ledger above
  250 - LINE_SPACING * 3, // 25 - 3rd ledger above
  250 - LINE_SPACING * 4, // -50 - 4th ledger above
];

const LEDGER_LINE_POSITIONS_BELOW = [
  550 + LINE_SPACING,     // 625 - 1st ledger below
  550 + LINE_SPACING * 2, // 700 - 2nd ledger below
  550 + LINE_SPACING * 3, // 775 - 3rd ledger below
  550 + LINE_SPACING * 4, // 850 - 4th ledger below (outside viewbox, but we'll expand)
];

const STAFF_SPACE_POSITIONS = [
  212.5,  // Space above top staff line
  287.5,  // Space between lines 1 & 2
  362.5,  // Space between lines 2 & 3
  437.5,  // Space between lines 3 & 4
  512.5,  // Space between lines 4 & 5
  587.5,  // Space below bottom staff line
];

// Ledger space positions
const LEDGER_SPACE_POSITIONS = [
  212.5,  // Space between 1st ledger above and top staff line
  137.5,  // Space between 1st and 2nd ledger above
  62.5,   // Space between 2nd and 3rd ledger above
  -12.5,  // Space between 3rd and 4th ledger above
  587.5,  // Space between bottom staff line and 1st ledger below
  662.5,  // Space between 1st and 2nd ledger below
  737.5,  // Space between 2nd and 3rd ledger below
  812.5,  // Space between 3rd and 4th ledger below
];
const SNAP_POINTS = [
  ...STAFF_LINE_POSITIONS,
  ...LEDGER_LINE_POSITIONS_ABOVE,
  ...LEDGER_LINE_POSITIONS_BELOW,
  ...STAFF_SPACE_POSITIONS,
  ...LEDGER_SPACE_POSITIONS,
].sort((a, b) => a - b);
const GRID_SIZE = 30;

/**
 * Snaps a Y coordinate to the nearest staff line or space
 */
function snapToStaff(y: number): number {
  return SNAP_POINTS.reduce((prev, curr) =>
    Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev
  );
}

/**
 * Snaps an X coordinate to the grid
 */
function snapToGrid(x: number): number {
  return Math.round(x / GRID_SIZE) * GRID_SIZE;
}

/**
 * Generates a unique ID for a note (simple counter-based approach)
 */
let noteIdCounter = 0;

function generateNoteId(): string {
  return `note-${++noteIdCounter}`;
}

function NotePlopper(): ReactNode {
  const [selectedDuration, setSelectedDuration] = useState<NoteDuration | null>(null);
  const [notes, setNotes] = useState<PlacedNote[]>([]);
  const [ghostNote, setGhostNote] = useState<GhostNote | null>(null);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);

  /**
   * Active noteDuration is either the existing hovered note's noteDuration or the selected noteDuration
   */
  let activeDuration = selectedDuration;

  if (hoveredNoteId) {
    const hoveredNote = notes.find(n => n.id === hoveredNoteId);

    if (hoveredNote) {
      activeDuration = hoveredNote.duration;
    }
  }

  /**
   * Handles selection of a note duration from the tool palette
   */
  function handleSelectDuration(duration: NoteDuration): void {
    setSelectedDuration(duration);
  }

  /**
   * Handles pointer entering a note
   */
  function handleNotePointerEnter(noteId: string): void {
    setHoveredNoteId(noteId);
  }

  /**
   * Handles pointer leaving a note as long as we aren't dragging
   */
  function handleNotePointerLeave(): void {
    if (!draggedNoteId) {
      setHoveredNoteId(null);
    }
  }

  /**
   * Handles pointer down on an existing note to start dragging
   */
  function handleNotePointerDown(noteId: string): void {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    setDraggedNoteId(noteId);
    setHoveredNoteId(noteId);
    setGhostNote({
      x: note.x,
      y: note.y,
      duration: note.duration,
    });
  }

  /**
   * Handles pointer movement over the staff, updating ghost note position
   */
  function handlePointerMove(svgPoint: { x: number; y: number }): void {
    const snappedX = snapToGrid(svgPoint.x);
    const snappedY = snapToStaff(svgPoint.y);

    /**
     * If dragging an existing note, update its ghost position
     */
    if (draggedNoteId) {
      const draggedNote = notes.find((n) => n.id === draggedNoteId);

      if (draggedNote) {
        setGhostNote({
          x: snappedX,
          y: snappedY,
          duration: draggedNote.duration,
        });
      }

      return;
    }

    /**
     * If hovering over an existing note, don't show a ghost
     */
    if (hoveredNoteId) {
      setGhostNote(null);
      return;
    }

    /**
     * Otherwise, show ghost for new note placement if tool is selected
     */
    if (!activeDuration) {
      setGhostNote(null);

      return;
    }

    /**
     * Check if there's already a note at this snapped position
     */
    const existingNoteAtPosition = notes.find(n => n.x === snappedX && n.y === snappedY);
    if (existingNoteAtPosition) {
      setGhostNote(null);
      return;
    }

    setGhostNote({
      x: snappedX,
      y: snappedY,
      duration: activeDuration,
    });
  }

  /**
   * Handles pointer leaving the staff area, clears the ghost note
   */
  function handlePointerLeave(): void {
    setGhostNote(null);
    setDraggedNoteId(null);
    setHoveredNoteId(null);
  }

  /**
   * Handles pointer up event - either places new note or finishes dragging
   */
  function handlePointerDown(): void {
    if (draggedNoteId && ghostNote) {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === draggedNoteId
            ? { ...note, x: ghostNote.x, y: ghostNote.y }
            : note
        )
      );
      setDraggedNoteId(null);
      setGhostNote(null);
      setHoveredNoteId(null);

      return;
    }

    // Otherwise, place a new note
    if (!ghostNote || !activeDuration) {
      return;
    }

    const newNote: PlacedNote = {
      id: generateNoteId(),
      x: ghostNote.x,
      y: ghostNote.y,
      duration: activeDuration,
    };

    setNotes((prevNotes) => [...prevNotes, newNote]);
  }

  return (
    <div className="note-plopper utility__container">
      <div className="utility__content">
        <h2>Note Plopper</h2>
        <ToolPalette
          selectedDuration={selectedDuration}
          onSelect={handleSelectDuration}
        />
        <Staff
          notes={notes}
          ghostNote={ghostNote}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onNotePointerDown={handleNotePointerDown}
          onNotePointerEnter={handleNotePointerEnter}
          onNotePointerLeave={handleNotePointerLeave}
        />
        {/* Debug info */}
        <p>Selected: {selectedDuration || 'none'}</p>
        <p>Notes placed: {notes.length}</p>
        <p>Ghost note: {ghostNote ? `x:${ghostNote.x}, y:${ghostNote.y}` : 'none'}</p>
      </div>
    </div>
  );
}

export default NotePlopper;
