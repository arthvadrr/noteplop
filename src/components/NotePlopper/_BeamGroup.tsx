import type { ReactNode } from 'react';
import type { PlacedNote } from '../../contexts/ScoreContext/ScoreContext.types';

interface BeamGroupProps {
  notes: PlacedNote[];
  beamY: number;
  stemDirection?: 'up' | 'down';
  strokeColor?: string;
}

/**
 * Renders horizontal beams connecting a group of eighth/sixteenth notes
 * beamY should be the Y position where the beam should be drawn
 * For stems up: typically the highest note's stem end (above notes)
 * For stems down: typically the lowest note's stem end (below notes)
 */
function BeamGroup({ notes, beamY, stemDirection = 'up', strokeColor = 'white' }: BeamGroupProps): ReactNode {
  if (notes.length < 2) return null;

  /**
   * STEM_OFFSET: Note radius - adjusts based on stem direction
   * For stems up: beam connects to right side of notehead (+ radius)
   * For stems down: beam connects to left side of notehead (- radius)
   * BEAM_THICKNESS: Thickness of the beam line
   * BEAM_SPACING: Space between beams for sixteenth notes
   * BEAM_EXTENSION: Extend beam by half its thickness on each end
   */
  const STEM_OFFSET = 24;
  const BEAM_THICKNESS = 10;
  const BEAM_SPACING = 13;
  const BEAM_EXTENSION = 3;
  const firstNote = notes[0];
  const lastNote = notes[notes.length - 1];

  /**
   * Extend the beam slightly beyond the first and last stem
   * Adjust X position based on stem direction
   */
  const startX = stemDirection === 'up'
    ? firstNote.x + STEM_OFFSET - BEAM_EXTENSION
    : firstNote.x - STEM_OFFSET - BEAM_EXTENSION;
  const endX = stemDirection === 'up'
    ? lastNote.x + STEM_OFFSET + BEAM_EXTENSION
    : lastNote.x - STEM_OFFSET + BEAM_EXTENSION;

  /**
   * Determine if we need one or two beams
   */
  const hasSixteenth = notes.some(note => note.duration === 'sixteenth');
  const allSixteenth = notes.every(note => note.duration === 'sixteenth');

  return (
    <g>
      {/* Primary beam (horizontal, connects all eighth and sixteenth notes) */}
      <line
        x1={startX}
        y1={beamY}
        x2={endX}
        y2={beamY}
        stroke={strokeColor}
        strokeWidth={BEAM_THICKNESS}
        strokeLinecap="butt"
      />

      {/* Secondary beam for sixteenth notes */}
      {hasSixteenth && allSixteenth && (
        <line
          x1={startX}
          y1={beamY + BEAM_SPACING}
          x2={endX}
          y2={beamY + BEAM_SPACING}
          stroke={strokeColor}
          strokeWidth={BEAM_THICKNESS}
          strokeLinecap="butt"
        />
      )}

      {/* Partial secondary beams for mixed eighth/sixteenth groups */}
      {hasSixteenth && !allSixteenth && (
        <>
          {notes.map((note, index) => {
            if (note.duration !== 'sixteenth') return null;

            const noteX = stemDirection === 'up'
              ? note.x + STEM_OFFSET
              : note.x - STEM_OFFSET;
            const nextNote = notes[index + 1];

            /**
             * Check if next note is also sixteenth
             */
            if (nextNote && nextNote.duration === 'sixteenth') {
              const nextX = stemDirection === 'up'
                ? nextNote.x + STEM_OFFSET
                : nextNote.x - STEM_OFFSET;
              return (
                <line
                  key={`beam2-${note.id}`}
                  x1={noteX}
                  y1={beamY + BEAM_SPACING}
                  x2={nextX}
                  y2={beamY + BEAM_SPACING}
                  stroke={strokeColor}
                  strokeWidth={BEAM_THICKNESS}
                  strokeLinecap="butt"
                />
              );
            } else {
              /**
               * Partial beam for isolated sixteenth
               */
              return (
                <line
                  key={`partial-${note.id}`}
                  x1={noteX}
                  y1={beamY + BEAM_SPACING}
                  x2={noteX}
                  y2={beamY + BEAM_SPACING}
                  stroke={strokeColor}
                  strokeWidth={BEAM_THICKNESS}
                  strokeLinecap="butt"
                />
              );
            }
          })}
        </>
      )}
    </g>
  );
}

export default BeamGroup;
