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

  /**
   * Calculate step size from first two notes (if available)
   * Or derive from the note positions
   */
  const firstX = allNotes[0].x;
  const secondX = allNotes.length > 1 ? allNotes[1].x : null;
  
  /**
   * Log all note positions for analysis
   */
  console.log('=== ALL NOTES IN MEASURE ===');
  allNotes.forEach((note, index) => {
    console.log(`Note ${index}: x=${note.x}, y=${note.y}, duration=${note.duration}`);
  });
  if (secondX) {
    const stepSize = secondX - firstX;
    console.log(`Calculated step size: ${stepSize}px`);
  }
  console.log('============================\n');

  /**
   * For each note, check if it's the correct distance from the previous note
   */
  allNotes.forEach((currentNote, index) => {
    if (index === 0) return; // Skip first note, no previous note

    /**
     * Check all previous notes to see if any are the right distance away
     */
    for (let i = 0; i < index; i++) {
      const previousNote = allNotes[i];

      /**
       * Skip if notes are at same Y position (horizontally aligned)
       */
      if (currentNote.y === previousNote.y) {
        continue;
      }

      /**
       * Calculate actual distance between notes
       */
      const actualDistance = currentNote.x - previousNote.x;
      
      /**
       * Calculate expected distance based on previous note's duration in steps
       */
      const stepsInDuration = DURATION_IN_STEPS[previousNote.duration as keyof typeof DURATION_IN_STEPS] || 3.75;
      
      /**
       * Calculate step size based on first note position
       * First measure: (760-240)/15, Other measures: (760-40)/15
       */
      const minX = firstX === 240 ? 240 : 40;
      const stepSize = (760 - minX) / 15;
      const expectedDistance = stepsInDuration * stepSize;
      
      console.log(`Comparing: prev note at ${previousNote.x} (${previousNote.duration}) to current at ${currentNote.x}`);
      console.log(`  Steps: ${stepsInDuration}, StepSize: ${stepSize}px`);
      console.log(`  Expected distance: ${expectedDistance}, Actual: ${actualDistance}`);
      
      /**
       * Round both to nearest 0.1 for comparison (handle floating point)
       */
      const actualRounded = Math.round(actualDistance * 10) / 10;
      const expectedRounded = Math.round(expectedDistance * 10) / 10;
      
      console.log(`  Rounded - Expected: ${expectedRounded}, Actual: ${actualRounded}, Match: ${actualRounded === expectedRounded}`);
      
      if (actualRounded === expectedRounded) {
        console.log(`  ✅ MATCH! Drawing connector`);
        const color = DURATION_COLORS[previousNote.duration as keyof typeof DURATION_COLORS] || '#FFFFFF';

        connectors.push({
          x: currentNote.x,
          y1: previousNote.y,
          y2: currentNote.y,
          color,
        });
      }
    }
  });

  return connectors;
}
