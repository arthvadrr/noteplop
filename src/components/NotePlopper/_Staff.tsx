import { useRef } from 'react';
import NoteHead from './_NoteHead';
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import type { StaffProps } from './NotePlopper.types';

/**
 * Staff configuration
 */
const STAFF_WIDTH = 800;
const STAFF_HEIGHT = 900;
const STAFF_LINE_POSITIONS = [
  250,  // Line 1 (top staff line)
  325,  // Line 2
  400,  // Line 3 (middle)
  475,  // Line 4
  550,  // Line 5 (bottom staff line)
];

/**
 * Pure presentational SVG staff component
 * Renders musical staff lines, placed notes, and ghost note
 * Handles pointer events and converts to SVG coordinates
 */
function Staff({
  notes,
  ghostNote,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onNotePointerDown,
  onNotePointerEnter,
  onNotePointerLeave,
}: StaffProps): ReactNode {
  const svgRef = useRef<SVGSVGElement>(null);

  /**
   * Converts pointer event screen coordinates to SVG coordinate space
   */
  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>): void {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();

    pt.x = event.clientX;
    pt.y = event.clientY;

    const ctm = svg.getScreenCTM();

    if (!ctm) return;

    const svgPoint = pt.matrixTransform(ctm.inverse());
    onPointerMove({ x: svgPoint.x, y: svgPoint.y });
  }

  /**
   * Handles pointer leaving the SVG area
   */
  function handlePointerLeave(): void {
    onPointerLeave();
  }

  /**
   * Handles pointer up (note placement)
   */
  function handlePointerUp(): void {
    onPointerDown();
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${STAFF_WIDTH} ${STAFF_HEIGHT}`}
      className="note-plopper-staff"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      {/* Staff lines */}
      {STAFF_LINE_POSITIONS.map((y, index) => (
        <line
          key={`staff-line-${index}`}
          x1={0}
          y1={y}
          x2={STAFF_WIDTH}
          y2={y}
          stroke="currentColor"
          strokeWidth={4}
          opacity={0.8}
        />
      ))}

      {/* Placed notes */}
      {notes.map((note) => (
        <NoteHead
          key={note.id}
          x={note.x}
          y={note.y}
          duration={note.duration}
          isGhost={false}
          onPointerDown={() => onNotePointerDown(note.id)}
          onPointerEnter={() => onNotePointerEnter(note.id)}
          onPointerLeave={onNotePointerLeave}
        />
      ))}

      {/* Ghost note */}
      {ghostNote && (
        <NoteHead
          x={ghostNote.x}
          y={ghostNote.y}
          duration={ghostNote.duration}
          isGhost={true}
        />
      )}
    </svg>
  );
}

export default Staff;
