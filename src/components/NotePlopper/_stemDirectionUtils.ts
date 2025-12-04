import type { PlacedNote } from '../../contexts/ScoreContext/ScoreContext.types';

/**
 * Middle staff line position (Line 3)
 * Notes above this line get stems going down
 * Notes on or below this line get stems going up
 */
const MIDDLE_STAFF_LINE_Y = 400;

/**
 * Calculate stem direction for a single note
 * Based on standard music notation rules:
 * 
 * Notes above the middle line: stem down
 * Notes on or below the middle line: stem up
 */
export function calculateStemDirection(noteY: number): 'up' | 'down' {
  return noteY < MIDDLE_STAFF_LINE_Y ? 'down' : 'up';
}

/**
 * Calculate stem direction for a group of beamed notes
 * Uses the average Y position of all notes in the group
 */
export function calculateBeamGroupStemDirection(notes: PlacedNote[]): 'up' | 'down' {
  if (notes.length === 0) return 'up';
  
  const averageY = notes.reduce((sum, note) => sum + note.y, 0) / notes.length;
  return calculateStemDirection(averageY);
}
