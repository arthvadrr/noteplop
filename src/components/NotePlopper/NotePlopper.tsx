import { useState } from 'react';
import { useScore } from '../../contexts/ScoreContext/ScoreContext';
import MeasureNavigation, { MeasureIndicator } from './_MeasureNavigation';
import MeasureControls from './_MeasureControls';
import MeasureCarousel from './_MeasureCarousel';
import ToolPalette from './_ToolPalette';
import Staff from './_Staff';
import type { NoteDuration, TimeSignature, Clef } from '../../contexts/ScoreContext/ScoreContext.types';
import type { ReactNode } from 'react';
import type { GhostNote } from './NotePlopper.types';

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
const MIN_X_FIRST_MEASURE = 240; // Minimum X coordinate for first measure (after clef/time signature)
const MIN_X_OTHER_MEASURES = 30; // Minimum X coordinate for other measures (no clef/time signature)

/**
 * Gets the minimum X coordinate based on whether it's the first measure
 */
function getMinX(isFirstMeasure: boolean): number {
  return isFirstMeasure ? MIN_X_FIRST_MEASURE : MIN_X_OTHER_MEASURES;
}

/**
 * Calculates the maximum X coordinate based on time signature
 * Each beat gets a certain amount of horizontal space
 * Note: Returns consistent width for all measures regardless of isFirstMeasure
 */
function getMaxX(timeSignature: TimeSignature): number {
  const beats = parseInt(timeSignature.split('/')[0]);
  const spacePerBeat = 120; // Horizontal space allocated per beat
  // Use MIN_X_FIRST_MEASURE for consistent measure width across all measures
  return MIN_X_FIRST_MEASURE + (beats * spacePerBeat);
}

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
function snapToGrid(x: number, timeSignature: TimeSignature, isFirstMeasure: boolean): number {
  const snapped = Math.round(x / GRID_SIZE) * GRID_SIZE;
  const minX = getMinX(isFirstMeasure);
  const maxX = getMaxX(timeSignature);
  return Math.max(minX, Math.min(snapped, maxX));
}

function NotePlopper(): ReactNode {
  const {
    activeMeasure,
    activeTrack,
    updateMeasureTimeSignature,
    updateMeasureClef,
    addNote,
    updateNote,
    addMeasure,
    deleteMeasure,
    setActiveMeasure,
  } = useScore();

  const [selectedDuration, setSelectedDuration] = useState<NoteDuration | null>(null);
  const [ghostNote, setGhostNote] = useState<GhostNote | null>(null);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);


  if (!activeMeasure || !activeTrack) {
    return <div>No active measure</div>;
  }

  // Extract from context (activeMeasure and activeTrack are guaranteed non-null here)
  const measures = activeTrack.measures;
  const measureId = activeMeasure.id;
  const notes = activeMeasure.notes;
  const selectedTimeSignature = activeMeasure.timeSignature;
  const selectedClef = activeMeasure.clef || 'treble';

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
   * Handles selection of time signature
   */
  function handleSelectTimeSignature(timeSignature: TimeSignature): void {
    updateMeasureTimeSignature(measureId, timeSignature);
  }

  /**
   * Handles selection of clef
   */
  function handleSelectClef(clef: Clef): void {
    updateMeasureClef(measureId, clef);
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
    const snappedX = snapToGrid(svgPoint.x, selectedTimeSignature, isFirstMeasure);
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
      // Update existing note position
      updateNote(measureId, draggedNoteId, { x: ghostNote.x, y: ghostNote.y });
      setDraggedNoteId(null);
      setGhostNote(null);
      setHoveredNoteId(null);

      return;
    }

    // Otherwise, place a new note
    if (!ghostNote || !activeDuration) {
      return;
    }

    addNote(measureId, {
      x: ghostNote.x,
      y: ghostNote.y,
      duration: activeDuration,
    });
  }

  /**
   * Navigate to previous measure
   */
  function handlePreviousMeasure(): void {
    if (!activeTrack) return;
    const currentIndex = activeTrack.measures.findIndex(m => m.id === measureId);
    if (currentIndex > 0) {
      setActiveMeasure(activeTrack.measures[currentIndex - 1].id);
    }
  }

  /**
   * Navigate to next measure
   */
  function handleNextMeasure(): void {
    if (!activeTrack) return;
    const currentIndex = activeTrack.measures.findIndex(m => m.id === measureId);
    if (currentIndex < activeTrack.measures.length - 1) {
      setActiveMeasure(activeTrack.measures[currentIndex + 1].id);
    }
  }

  /**
   * Insert a new measure after the current one and navigate to it
   */
  function handleAddMeasure(): void {
    if (!activeTrack || !activeMeasure) return;
    const newMeasureId = addMeasure(activeTrack.id, selectedTimeSignature, activeMeasure.id);
    setActiveMeasure(newMeasureId);
  }

  /**
   * Delete the current measure
   */
  function handleDeleteMeasure(): void {
    if (!activeTrack || !activeMeasure || activeMeasure.number === 1) return;

    // Find previous measure to navigate to after deletion
    const currentIndex = activeTrack.measures.findIndex(m => m.id === measureId);
    const previousMeasureId = currentIndex > 0 ? activeTrack.measures[currentIndex - 1].id : null;

    // Delete the measure first
    deleteMeasure(activeTrack.id, measureId);
    
    // Then navigate to previous measure
    if (previousMeasureId) {
      setActiveMeasure(previousMeasureId);
    }
  }

  const totalMeasures = activeTrack?.measures.length || 0;
  const isFirstMeasure = activeMeasure.number === 1;

  return (
    <div className="note-plopper utility__container">
      <div className="utility__content">
        <h2>Note Plopper</h2>
        <ToolPalette
          selectedDuration={selectedDuration}
          selectedTimeSignature={selectedTimeSignature}
          selectedClef={selectedClef}
          onSelectDuration={handleSelectDuration}
          onSelectTimeSignature={handleSelectTimeSignature}
          onSelectClef={handleSelectClef}
        />
        <MeasureIndicator
          currentMeasureNumber={activeMeasure.number}
          totalMeasures={totalMeasures}
        />
        <MeasureCarousel measures={measures} activeMeasureId={activeMeasure.id}>
          {(measure, isActive) => (
            <Staff
              notes={measure.notes}
              ghostNote={isActive ? ghostNote : null}
              timeSignature={measure.timeSignature}
              clef={measure.clef || 'treble'}
              showTimeSignature={measure.number === 1}
              showClef={measure.number === 1}
              isActive={isActive}
              onPointerMove={isActive ? handlePointerMove : () => { }}
              onPointerLeave={isActive ? handlePointerLeave : () => { }}
              onPointerDown={isActive ? handlePointerDown : () => { }}
              onNotePointerDown={isActive ? handleNotePointerDown : () => { }}
              onNotePointerEnter={isActive ? handleNotePointerEnter : () => { }}
              onNotePointerLeave={isActive ? handleNotePointerLeave : () => { }}
            />
          )}
        </MeasureCarousel>
        <MeasureNavigation
          currentMeasureNumber={activeMeasure.number}
          totalMeasures={totalMeasures}
          onPrevious={handlePreviousMeasure}
          onNext={handleNextMeasure}
        />
        <MeasureControls
          isFirstMeasure={isFirstMeasure}
          onAddMeasure={handleAddMeasure}
          onDeleteMeasure={handleDeleteMeasure}
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
