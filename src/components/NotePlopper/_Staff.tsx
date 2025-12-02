import { useRef } from 'react';
import NoteHead from './_NoteHead';
import SVGTrebleClef from './_SVGTrebleClef';
import SVGBassClef from './_SVGBassClef';
import SVGAltoClef from './_SVGAltoClef';
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import type { StaffProps, TimeSignature } from './NotePlopper.types';

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
 * Renders time signature as two stacked numbers
 */
function renderTimeSignature(timeSignature: TimeSignature, x: number, y: number): ReactNode {
  const [top, bottom] = timeSignature.split('/');

  return (
    <g>
      <text
        x={x}
        y={y}
        fill="white"
        fontSize="72"
        fontWeight="bold"
        textAnchor="middle"
      >
        {top}
      </text>
      <text
        x={x}
        y={y + 72}
        fill="white"
        fontSize="72"
        fontWeight="bold"
        textAnchor="middle"
      >
        {bottom}
      </text>
    </g>
  );
}

/**
 * Pure presentational SVG staff component
 * Renders musical staff lines, placed notes, and ghost note
 * Handles pointer events and converts to SVG coordinates
 */
function Staff({
  notes,
  ghostNote,
  timeSignature,
  clef,
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
      {/* Clef */}
      {clef === 'treble' && <SVGTrebleClef />}
      {clef === 'bass' && <SVGBassClef />}
      {clef === 'alto' && <SVGAltoClef />}

      {/* Time Signature */}
      {renderTimeSignature(timeSignature, 180, 390)}

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

      {/* Left bar line */}
      <line
        x1={0}
        y1={STAFF_LINE_POSITIONS[0]}
        x2={0}
        y2={STAFF_LINE_POSITIONS[4]}
        stroke="currentColor"
        strokeWidth={4}
        opacity={0.8}
      />

      {/* Right bar line */}
      <line
        x1={STAFF_WIDTH}
        y1={STAFF_LINE_POSITIONS[0]}
        x2={STAFF_WIDTH}
        y2={STAFF_LINE_POSITIONS[4]}
        stroke="currentColor"
        strokeWidth={4}
        opacity={0.8}
      />

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
