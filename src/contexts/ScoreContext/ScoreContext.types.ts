/**
 * Note duration types
 */
export type NoteDuration = 'whole' | 'half' | 'quarter' | 'eighth';

/**
 * Time signature types
 */
export type TimeSignature = '4/4' | '3/4' | '6/8' | '2/4';

/**
 * Clef types
 */
export type Clef = 'treble' | 'bass' | 'alto';

/**
 * A single note placed on the staff
 * X coordinate is relative to the measure's start position
 */
export interface PlacedNote {
  id: string;
  x: number;
  y: number;
  duration: NoteDuration;
}

/**
 * A measure contains notes and has a time signature
 */
export interface Measure {
  id: string;
  number: number;
  timeSignature: TimeSignature;
  clef?: Clef;
  notes: PlacedNote[];
}

/**
 * A track represents one instrument/voice
 */
export interface Track {
  id: string;
  name: string; // "Piano", "Violin", etc.
  instrument?: string;
  clef: Clef;
  measures: Measure[];
}

/**
 * Top level - a complete musical score
 */
export interface Score {
  id: string;
  title: string;
  composer?: string;
  tempo?: number;
  tracks: Track[];
}
