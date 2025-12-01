/**
 * Note duration types supported by the Note Plop application
 */
export type NoteDuration = "whole" | "half" | "quarter" | "eighth";

/**
 * Represents a placed note on the staff
 */
export interface PlacedNote {
  id: string;
  x: number;
  y: number;
  duration: NoteDuration;
}

/**
 * Represents the ghost note that follows the pointer
 */
export interface GhostNote {
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
  onSelect: (duration: NoteDuration) => void;
}

/**
 * Props for the NoteHead component
 */
export interface NoteHeadProps {
  x: number;
  y: number;
  duration: NoteDuration;
  isGhost?: boolean;
  onPointerDown?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}
