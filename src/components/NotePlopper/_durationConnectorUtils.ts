import type { PlacedNote } from '../../contexts/ScoreContext/ScoreContext.types';
import type { GhostNote } from './NotePlopper.types';

/**
 * Represents a vertical connector between two aligned duration lines
 */
export interface DurationConnector {
  x: number;
  y1: number;
  y2: number;
  color: string;
}

/**
 * Duration indicator colors matching NoteHead
 */
const DURATION_COLORS = {
  whole: '#4A90E2',
  half: '#50C878',
  quarter: '#F5A623',
  eighth: '#FF6B35',
  sixteenth: '#E83F6F',
} as const;

/**
 * Beat durations in grid steps
 * Notes snap to a 15-division grid (16 positions including start)
 * For 4/4 time: 4 beats across 16 positions = 4 steps per beat
 */
const DURATION_IN_STEPS = {
  whole: 15,      // Full measure (15 divisions)
  half: 8,        // Half measure (2 beats = 8 steps)
  quarter: 4,     // Quarter note (1 beat = 4 steps)
  eighth: 2,      // Eighth note (0.5 beats = 2 steps)
  sixteenth: 1,   // Sixteenth note (0.25 beats = 1 step)
} as const;

/**
 * Epsilon for floating point comparison
 * First measure uses 34.666... step size which causes precision issues
 */
const EPSILON = 0.0001;

/**
 * Creates vertical connectors between notes when the spacing
 * matches the previous note's duration
 */
export function calculateDurationConnectors(
  placedNotes: PlacedNote[],
  ghostNote: GhostNote | null
): DurationConnector[] {
  const connectors: DurationConnector[] = [];

  /**
   * Combine placed notes and ghost note
   */
  const allNotes = [...placedNotes];
  if (ghostNote) {
    allNotes.push(ghostNote as any);
  }

  if (allNotes.length === 0) return connectors;

  /**
   * Sort notes by X position (left to right)
   */
  allNotes.sort((a, b) => a.x - b.x);

  const firstX = allNotes[0].x;

  /**
   * For each note, check if it's the correct distance from the immediately previous note
   */
  allNotes.forEach((currentNote, index) => {
    if (index === 0) return; // Skip first note, no previous note

    /**
     * Only check the immediately previous note (not all previous notes)
     * This creates a simple chain: note connects to its left neighbor if spacing matches
     */
    const previousNote = allNotes[index - 1];

    /**
     * Skip if notes are at same Y position (horizontally aligned)
     */
    if (currentNote.y === previousNote.y) {
      return;
    }

    /**
     * Calculate actual distance between notes
     */
    const actualDistance = currentNote.x - previousNote.x;
    
    /**
     * Calculate expected distance based on previous note's duration in steps
     */
    const stepsInDuration = DURATION_IN_STEPS[previousNote.duration as keyof typeof DURATION_IN_STEPS] || 4;
    
    /**
     * Calculate step size based on first note position
     * First measure: (760-240)/15, Other measures: (760-40)/15
     */
    const minX = firstX === 240 ? 240 : 40;
    const stepSize = (760 - minX) / 15;
    const expectedDistance = stepsInDuration * stepSize;
    
    /**
     * Check for match using epsilon tolerance for floating point precision
     * First measure (34.666... step size) requires this tolerance
     */
    if (Math.abs(actualDistance - expectedDistance) < EPSILON) {
      const color = DURATION_COLORS[previousNote.duration as keyof typeof DURATION_COLORS] || '#FFFFFF';

      connectors.push({
        x: currentNote.x,
        y1: previousNote.y,
        y2: currentNote.y,
        color,
      });
    }
  });

  return connectors;
}
