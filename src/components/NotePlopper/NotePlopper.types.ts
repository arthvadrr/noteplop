import type { NoteDuration, TimeSignature, Clef, PlacedNote } from '../../contexts/ScoreContext/ScoreContext.types';

/**
 * Represents the ghost note that follows the pointer
 */
export interface GhostNote {
  x: number;
  y: number;
  duration: NoteDuration;
}

/**
 * Represents a note that is being deleted with animation
 */
export interface DeletingNote {
  x: number;
  y: number;
  duration: NoteDuration;
}

/**
 * Configuration for staff rendering and snapping
 */
export interface StaffConfig {
  viewBox: string;
  width: number;
  height: number;
  linePositions: number[];
  spacePositions: number[];
  snapPoints: number[];
}

/**
 * Props for the Staff component
 */
export interface StaffProps {
  notes: PlacedNote[];
  ghostNote: GhostNote | null;
  deletingNote: DeletingNote | null;
  timeSignature: TimeSignature;
  clef: Clef;
  showTimeSignature?: boolean;
  showClef?: boolean;
  isActive?: boolean;
  showDurationIndicators?: boolean;
  beatWidth?: number;
  onPointerMove: (svgPoint: { x: number; y: number }) => void;
  onPointerLeave: () => void;
  onPointerDown: () => void;
  onNotePointerDown: (noteId: string) => void;
  onNotePointerEnter: (noteId: string) => void;
  onNotePointerLeave: () => void;
}

/**
 * Props for the ToolPalette component
 */
export interface ToolPaletteProps {
  selectedDuration: NoteDuration | null;
  selectedTimeSignature: TimeSignature;
  selectedClef: Clef;
  onSelectDuration: (duration: NoteDuration) => void;
  onSelectTimeSignature: (timeSignature: TimeSignature) => void;
  onSelectClef: (clef: Clef) => void;
}

/**
 * Reusable Notation type for palette items (plottable elements)
 * `value` is currently a `NoteDuration` but this allows future extension
 */
export type Notation = {
  value: NoteDuration;
  label: string;
};

/**
 * Props for the NoteHead component
 */
export interface NoteHeadProps {
  x: number;
  y: number;
  duration: NoteDuration;
  isGhost?: boolean;
  hideFlag?: boolean;
  hideLedgerLines?: boolean;
  stemHeight?: number;
  stemDirection?: 'up' | 'down';
  showDurationIndicator?: boolean;
  beatWidth?: number;
  maxX?: number;
  color?: string;
  onPointerDown?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

