import { useState } from 'react';
import { useScore } from '../../contexts/ScoreContext/ScoreContext';
import MeasureNavigation, { MeasureIndicator } from './_MeasureNavigation';
import MeasureControls from './_MeasureControls';
import MeasureCarousel from './_MeasureCarousel';
import NoteRotary from './NoteRotary';
import ToolPalette from './_ToolPalette';
import Toggle from '../common/Toggle';
import Staff from './_Staff';
import type { NoteDuration, TimeSignature, Clef } from '../../contexts/ScoreContext/ScoreContext.types';
import type { ReactNode } from 'react';
import type { GhostNote, DeletingNote } from './NotePlopper.types';

/**
 * Staff configuration constants
 * LINE_SPACING: Distance between staff lines and ledger lines
 * STAFF_LINE_POSITIONS: Y coordinates for the 5 staff lines
 *   - Line 1 (top staff line): 250
 *   - Line 2: 325
 *   - Line 3 (middle - centered in 800px height): 400
 *   - Line 4: 475
 *   - Line 5 (bottom staff line): 550
 */
const LINE_SPACING = 75;
const STAFF_LINE_POSITIONS = [
  250,
  325,
  400,
  475,
  550,
];

/**
 * Ledger line positions above the staff (limited to 3 ledger lines)
 * 1st ledger above: 175
 * 2nd ledger above: 100
 * 3rd ledger above: 25
 */
const LEDGER_LINE_POSITIONS_ABOVE = [
  250 - LINE_SPACING,     // 175
  250 - LINE_SPACING * 2, // 100
  250 - LINE_SPACING * 3, // 25
];

/**
 * Ledger line positions below the staff (limited to 3 ledger lines)
 * 1st ledger below: 625
 * 2nd ledger below: 700
 * 3rd ledger below: 775
 */
const LEDGER_LINE_POSITIONS_BELOW = [
  550 + LINE_SPACING,     // 625
  550 + LINE_SPACING * 2, // 700
  550 + LINE_SPACING * 3, // 775
];

/**
 * Staff space positions (spaces between lines)
 * Space above top staff line: 212.5
 * Space between lines 1 & 2: 287.5
 * Space between lines 2 & 3: 362.5
 * Space between lines 3 & 4: 437.5
 * Space between lines 4 & 5: 512.5
 * Space below bottom staff line: 587.5
 */
const STAFF_SPACE_POSITIONS = [
  212.5,
  287.5,
  362.5,
  437.5,
  512.5,
  587.5,
];

/**
 * Ledger space positions (spaces between ledger lines)
 */
const LEDGER_SPACE_POSITIONS = [
  212.5, // Space between 1st ledger above and top staff line
  137.5, // Space between 1st and 2nd ledger above
  62.5,  // Space between 2nd and 3rd ledger above
  587.5, // Space between bottom staff line and 1st ledger below
  662.5, // Space between 1st and 2nd ledger below
  737.5, // Space between 2nd and 3rd ledger below
];

/**
 * Note head radius
 */
const NOTE_HEAD_RADIUS = 24;

/**
 * Y-axis bounds for note placement
 * Min: 3rd ledger line above (25) - half note head radius (12) - 1px = 12
 * Max: 3rd ledger line below (775) + half note head radius (12) + 1px = 788
 */
const MIN_Y = 25 - NOTE_HEAD_RADIUS / 2 - 1;  // 12
const MAX_Y = 775 + NOTE_HEAD_RADIUS / 2 + 1; // 788

const SNAP_POINTS = [
  ...STAFF_LINE_POSITIONS,
  ...LEDGER_LINE_POSITIONS_ABOVE,
  ...LEDGER_LINE_POSITIONS_BELOW,
  ...STAFF_SPACE_POSITIONS,
  ...LEDGER_SPACE_POSITIONS,
].sort((a, b) => a - b);

/**
 * Minimum X coordinates for note placement
 * MIN_X_FIRST_MEASURE: Minimum X coordinate for first measure (after clef/time signature)
 * MIN_X_OTHER_MEASURES: Minimum X coordinate for other measures (no clef/time signature)
 */
const MIN_X_FIRST_MEASURE = 240;
const MIN_X_OTHER_MEASURES = 40;

/**
 * Gets the minimum X coordinate based on whether it's the first measure
 */
function getMinX(isFirstMeasure: boolean): number {
  return isFirstMeasure ? MIN_X_FIRST_MEASURE : MIN_X_OTHER_MEASURES;
}

/**
 * Calculates the maximum X coordinate for note placement
 * Returns 760 to prevent notes from clipping at the right bar line
 * This leaves 40px of space for the note head and stem before the bar line at 800
 */
function getMaxX(): number {
  return 760;
}

/**
 * Snaps a Y coordinate to the nearest staff line or space
 * Clamps to valid range (3 ledger lines above/below)
 */
function snapToStaff(y: number): number {
  // Clamp Y to valid bounds
  const clampedY = Math.max(MIN_Y, Math.min(y, MAX_Y));

  // Find closest snap point
  return SNAP_POINTS.reduce((prev, curr) =>
    Math.abs(curr - clampedY) < Math.abs(prev - clampedY) ? curr : prev
  );
}

/**
 * Snaps an X coordinate to the grid
 * Creates 16 evenly-spaced snap points (positions 0-15) for 16th note resolution
 * Uses 15 divisions to create 16 positions; position 16 at maxX is the bar line endpoint
 */
function snapToGrid(x: number, isFirstMeasure: boolean): number {
  const minX = getMinX(isFirstMeasure);
  const maxX = getMaxX();
  const range = maxX - minX;
  const divisions = 15;
  const stepSize = range / divisions;

  // Calculate which snap point is closest (0-15)
  const relativeX = x - minX;
  const snapIndex = Math.round(relativeX / stepSize);

  // Clamp snapIndex to 0-15 (16 valid note placement positions)
  const clampedIndex = Math.max(0, Math.min(snapIndex, 15));
  const snappedX = minX + (clampedIndex * stepSize);

  return snappedX;
}

function NotePlopper(): ReactNode {
  const {
    activeMeasure,
    activeTrack,
    updateMeasureTimeSignature,
    updateMeasureClef,
    addNote,
    updateNote,
    deleteNote,
    addMeasure,
    deleteMeasure,
    setActiveMeasure,
  } = useScore();

  const [selectedDuration, setSelectedDuration] = useState<NoteDuration | null>('quarter');
  const [ghostNote, setGhostNote] = useState<GhostNote | null>(null);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [showDurationIndicators, setShowDurationIndicators] = useState<boolean>(true);
  const [deletingNote, setDeletingNote] = useState<DeletingNote | null>(null);


  if (!activeMeasure || !activeTrack) {
    return <div>No active measure</div>;
  }

  /**
   * Extract from context (activeMeasure and activeTrack are guaranteed not null here)
   */
  const measures = activeTrack.measures;
  const measureId = activeMeasure.id;
  const notes = activeMeasure.notes;
  const selectedTimeSignature = activeMeasure.timeSignature;
  const selectedClef = activeMeasure.clef || 'treble';

  /**
   * Calculate beat width for duration indicators
   * Must align with the 15-division grid system (16 snap points)
   * A quarter note (1 beat) spans 4 grid positions
   * 
   * Note: This is calculated per measure in the carousel render
   */
  function calculateBeatWidth(measureNumber: number): number {
    const isFirst = measureNumber === 1;
    const minX = getMinX(isFirst);
    const maxX = getMaxX();
    const stepSize = (maxX - minX) / 15;

    return stepSize * 4;  // 4 grid steps per beat
  }

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
    const isFirstMeasure = activeMeasure!.number === 1;
    const snappedX = snapToGrid(svgPoint.x, isFirstMeasure);
    const snappedY = snapToStaff(svgPoint.y);

    /**
     * If dragging an existing note, update its ghost position
     * Delete immediately if dragged outside the plottable area
     */
    if (draggedNoteId) {
      const draggedNote = notes.find((n) => n.id === draggedNoteId);

      if (draggedNote) {
        // Check if dragged outside the plottable area (X or Y bounds)
        const minX = getMinX(isFirstMeasure);
        const maxX = getMaxX();
        const isOutsideBounds =
          svgPoint.y < MIN_Y ||
          svgPoint.y > MAX_Y ||
          svgPoint.x < minX ||
          svgPoint.x > maxX;

        if (isOutsideBounds) {
          /**
           * Delete the note immediately when dragged outside bounds
           * Show deletion animation at last valid position
           */
          if (ghostNote) {
            setDeletingNote({
              x: ghostNote.x,
              y: ghostNote.y,
              duration: draggedNote.duration,
            });
            setTimeout(() => setDeletingNote(null), 400);
          }
          deleteNote(measureId, draggedNoteId);
          setDraggedNoteId(null);
          setGhostNote(null);
          setHoveredNoteId(null);
        } else {
          // Show ghost at snapped position
          setGhostNote({
            x: snappedX,
            y: snappedY,
            duration: draggedNote.duration,
          });
        }
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
   * Reset the current measure by removing all notes
   */
  function handleResetMeasure(): void {
    if (!activeMeasure) return;

    // Delete all notes in the current measure
    activeMeasure.notes.forEach(note => {
      deleteNote(measureId, note.id);
    });
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

  return (
    <div className="note-plopper utility__container">
      <div className="utility__content">
        <div className="note-plopper-tool-panel">
          <ToolPalette
            selectedDuration={selectedDuration}
            selectedTimeSignature={selectedTimeSignature}
            selectedClef={selectedClef}
            onSelectDuration={handleSelectDuration}
            onSelectTimeSignature={handleSelectTimeSignature}
            onSelectClef={handleSelectClef}
          />
          <Toggle
            label="Show Duration Indicators"
            checked={showDurationIndicators}
            onChange={setShowDurationIndicators}
          />
        </div>
        <div className="measure-wrapper" style={{ position: 'relative' }}>
          <NoteRotary />
          <MeasureCarousel measures={measures} activeMeasureId={activeMeasure.id}>
            {(measure, isActive) => (
              <Staff
                notes={measure.notes}
                ghostNote={isActive ? ghostNote : null}
                deletingNote={isActive ? deletingNote : null}
                timeSignature={measure.timeSignature}
                clef={measure.clef || 'treble'}
                showTimeSignature={measure.number === 1}
                showClef={measure.number === 1}
                isActive={isActive}
                showDurationIndicators={showDurationIndicators}
                beatWidth={calculateBeatWidth(measure.number)}
                onPointerMove={isActive ? handlePointerMove : () => { }}
                onPointerLeave={isActive ? handlePointerLeave : () => { }}
                onPointerDown={isActive ? handlePointerDown : () => { }}
                onNotePointerDown={isActive ? handleNotePointerDown : () => { }}
                onNotePointerEnter={isActive ? handleNotePointerEnter : () => { }}
                onNotePointerLeave={isActive ? handleNotePointerLeave : () => { }}
              />
            )}
          </MeasureCarousel>
        </div>
        <MeasureIndicator
          currentMeasureNumber={activeMeasure.number}
          totalMeasures={totalMeasures}
        />
        <MeasureNavigation
          currentMeasureNumber={activeMeasure.number}
          totalMeasures={totalMeasures}
          onPrevious={handlePreviousMeasure}
          onNext={handleNextMeasure}
        />
        <MeasureControls
          isFirstMeasure={activeMeasure.number === 1}
          hasNotes={notes.length > 0}
          onAddMeasure={handleAddMeasure}
          onResetMeasure={handleResetMeasure}
          onDeleteMeasure={handleDeleteMeasure}
        />
      </div>
    </div>
  );
}

export default NotePlopper;
