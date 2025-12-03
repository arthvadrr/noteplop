import { useRef } from 'react';
import { calculateDurationConnectors } from './_durationConnectorUtils';
import { groupNotesForBeaming, getUnbeamedNotes } from './_beamingUtils';
import NoteHead from './_NoteHead';
import BeamGroup from './_BeamGroup';
import SVGTrebleClef from './_SVGTrebleClef';
import SVGBassClef from './_SVGBassClef';
import SVGAltoClef from './_SVGAltoClef';
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import type { TimeSignature } from '../../contexts/ScoreContext/ScoreContext.types';
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
  showTimeSignature = true,
  showClef = true,
  isActive = true,
  showDurationIndicators = false,
  beatWidth = 0,
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

  /**
   * Calculate beam groups for automatic beaming
   */
  const beamGroups = groupNotesForBeaming(notes);
  const unbeamedNotes = getUnbeamedNotes(notes, beamGroups);

  /**
   * Calculate duration connectors for vertically aligned notes
   * Only calculated when duration indicators are enabled
   */
  const durationConnectors = showDurationIndicators && beatWidth > 0
    ? calculateDurationConnectors(notes, ghostNote)
    : [];

  // Calculate beam Y position and stem heights for each beam group
  const beamGroupData = beamGroups.map(group => {
    // Find the highest note in the group (smallest Y value)
    const highestNoteY = Math.min(...group.map(note => note.y));
    const defaultStemHeight = 120;
    const beamY = highestNoteY - defaultStemHeight;

    // Calculate custom stem height for each note to reach the beam
    const notesWithStemHeights = group.map(note => ({
      note,
      stemHeight: note.y - beamY
    }));

    return {
      notes: notesWithStemHeights,
      beamY
    };
  });

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${STAFF_WIDTH} ${STAFF_HEIGHT}`}
      className="note-plopper-staff"
      width="100%"
      height="auto"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      style={{
        touchAction: 'none',
        opacity: isActive ? 1 : 0.4,
        pointerEvents: isActive ? 'auto' : 'none',
        display: 'block',
      }}
    >
      {/* Clef */}
      {showClef && clef === 'treble' && <SVGTrebleClef />}
      {showClef && clef === 'bass' && <SVGBassClef />}
      {showClef && clef === 'alto' && <SVGAltoClef />}

      {/* Time Signature */}
      {showTimeSignature && renderTimeSignature(timeSignature, 180, 390)}

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
          opacity={0.5}
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
        opacity={0.5}
      />

      {/* Right bar line */}
      <line
        x1={STAFF_WIDTH}
        y1={STAFF_LINE_POSITIONS[0]}
        x2={STAFF_WIDTH}
        y2={STAFF_LINE_POSITIONS[4]}
        stroke="currentColor"
        strokeWidth={4}
        opacity={0.5}
      />

      {/* Duration connectors (rendered after staff lines so they appear on top) */}
      {durationConnectors.map((connector, index) => {
        /**
         * Skip rendering if notes are at same Y position
         */
        if (connector.y1 === connector.y2) return null;

        /**
         * Determine if the second note is above or below the first
         * If y2 < y1, the second note is above (Y increases downward)
         */
        const isAbove = connector.y2 < connector.y1;

        return (
          <line
            key={`duration-connector-${index}`}
            x1={connector.x}
            y1={isAbove ? connector.y1 + 4 : connector.y1 - 4}
            x2={connector.x}
            y2={isAbove ? connector.y2 - 4 : connector.y2 + 4}
            stroke={connector.color}
            strokeWidth={8}
            style={{ pointerEvents: 'none' }}
          />
        );
      })}

      {/* Placed notes */}
      {unbeamedNotes.map((note) => (
        <NoteHead
          key={note.id}
          x={note.x}
          y={note.y}
          duration={note.duration}
          isGhost={false}
          showDurationIndicator={showDurationIndicators}
          beatWidth={beatWidth}
          maxX={796}
          onPointerDown={() => onNotePointerDown(note.id)}
          onPointerEnter={() => onNotePointerEnter(note.id)}
          onPointerLeave={onNotePointerLeave}
        />
      ))}

      {/* Beamed note groups */}
      {beamGroupData.map((groupData, index) => (
        <g key={`beam-group-${index}`}>
          {/* Render stems and note heads without flags, with custom stem heights */}
          {groupData.notes.map(({ note, stemHeight }) => (
            <NoteHead
              key={note.id}
              x={note.x}
              y={note.y}
              duration={note.duration}
              isGhost={false}
              hideFlag={true}
              stemHeight={stemHeight}
              showDurationIndicator={showDurationIndicators}
              beatWidth={beatWidth}
              maxX={796}
              onPointerDown={() => onNotePointerDown(note.id)}
              onPointerEnter={() => onNotePointerEnter(note.id)}
              onPointerLeave={onNotePointerLeave}
            />
          ))}
          {/* Render the beam */}
          <BeamGroup
            notes={groupData.notes.map(({ note }) => note)}
            beamY={groupData.beamY}
          />
        </g>
      ))}

      {/* Ghost note */}
      {ghostNote && (
        <NoteHead
          x={ghostNote.x}
          y={ghostNote.y}
          duration={ghostNote.duration}
          isGhost={true}
          showDurationIndicator={showDurationIndicators}
          beatWidth={beatWidth}
          maxX={796}
        />
      )}
    </svg>
  );
}

export default Staff;
