import type { ReactNode } from 'react';
import type { NoteHeadProps } from './NotePlopper.types';

/**
 * Renders a single note head with stems and flags based on duration
 */
const NOTE_FILL_STYLES = {
  whole: 'none',
  half: 'none',
  quarter: 'white',
  eighth: 'white',
  sixteenth: 'white',
} as const;

const NOTE_STROKE_WIDTHS = {
  whole: 6,
  half: 6,
  quarter: 5,
  eighth: 5,
  sixteenth: 5,
} as const;

/**
 * Duration indicator configuration
 * Colors provide visual distinction for each note duration
 */
const DURATION_COLORS = {
  whole: '#4A90E2',
  half: '#50C878',
  quarter: '#F5A623',
  eighth: '#FF6B35',
  sixteenth: '#E83F6F',
} as const;

/**
 * Beat durations for calculating indicator line lengths
 */
const BEAT_DURATIONS = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
} as const;

const INDICATOR_THICKNESS = 8;

/**
 * Staff configuration for ledger line calculation
 */
const TOP_STAFF_LINE = 250;
const BOTTOM_STAFF_LINE = 550;
const LINE_SPACING = 75;
const LEDGER_LINE_WIDTH = 60;

/**
 * Calculates which ledger lines are needed for a note at the given Y position
 */
function calculateLedgerLines(y: number): number[] {
  const ledgerPositions: number[] = [];

  /**
   * Above staff 
   * Calculate how many ledger lines are needed above
   */
  if (y < TOP_STAFF_LINE) {
    let ledgerY = TOP_STAFF_LINE - LINE_SPACING;

    while (ledgerY >= y - LINE_SPACING / 2) {
      ledgerPositions.push(ledgerY);
      ledgerY -= LINE_SPACING;
    }
  }

  /**
   * Below staff 
   * Calculate how many ledger lines are needed below
   */
  if (y > BOTTOM_STAFF_LINE) {
    let ledgerY = BOTTOM_STAFF_LINE + LINE_SPACING;

    while (ledgerY <= y + LINE_SPACING / 2) {
      ledgerPositions.push(ledgerY);
      ledgerY += LINE_SPACING;
    }
  }

  return ledgerPositions;
}

function NoteHead({
  x,
  y,
  duration,
  noteId,
  isGhost = false,
  hideFlag = false,
  hideLedgerLines = false,
  stemHeight,
  stemDirection = 'up',
  showDurationIndicator = false,
  beatWidth = 0,
  maxX = 760,
  color,
  onPointerDown,
  onPointerEnter,
  onPointerLeave
}: NoteHeadProps): ReactNode {
  const opacity = isGhost ? 0.5 : 1;
  const radius = 24;
  const fillStyle = color || NOTE_FILL_STYLES[duration];
  const strokeWidth = NOTE_STROKE_WIDTHS[duration];
  const strokeColor = color || (isGhost ? 'rgba(255, 255, 255, 0.5)' : 'white');
  const ledgerLines = hideLedgerLines ? [] : calculateLedgerLines(y);
  const actualStemHeight = stemHeight ?? 120;

  /**
   * Calculate duration indicator line position
   * beatWidth is now aligned with the grid (4 grid steps per beat)
   * Line starts at right edge of note head and extends to next note's center
   */
  const durationLineStartX = x + radius;
  const durationLineEndX = showDurationIndicator && beatWidth > 0
    ? Math.min(x + (BEAT_DURATIONS[duration] * beatWidth), maxX)
    : 0;

  function handlePointerDown(event: React.PointerEvent): void {
    if (onPointerDown) {
      event.stopPropagation();
      onPointerDown();
    }
  }

  function handlePointerEnter(): void {
    if (onPointerEnter) {
      onPointerEnter();
    }
  }

  function handlePointerLeave(): void {
    if (onPointerLeave) {
      onPointerLeave();
    }
  }

  return (
    <g
      data-note-id={noteId}
      opacity={opacity}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{ cursor: onPointerDown ? 'move' : 'default' }}
    >
      {/* Duration indicator line (rendered first so it's below everything else) */}
      {showDurationIndicator && beatWidth > 0 && durationLineEndX > durationLineStartX && (
        <line
          x1={durationLineStartX}
          y1={y}
          x2={durationLineEndX}
          y2={y}
          stroke={DURATION_COLORS[duration]}
          strokeWidth={INDICATOR_THICKNESS}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Ledger lines */}
      {ledgerLines.map((ledgerY, index) => (
        <line
          key={`ledger-${index}`}
          x1={x - LEDGER_LINE_WIDTH / 2}
          y1={ledgerY}
          x2={x + LEDGER_LINE_WIDTH / 2}
          y2={ledgerY}
          stroke={strokeColor}
          strokeWidth={4}
          style={{ pointerEvents: 'none' }}
        />
      ))}

      {/* Invisible larger hit area for easier clicking */}
      {onPointerDown && (
        <circle
          cx={x}
          cy={y}
          r={radius + 10}
          fill="transparent"
          style={{ pointerEvents: 'all' }}
        />
      )}

      {/* Note head */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={fillStyle}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{ pointerEvents: onPointerDown ? 'none' : 'auto' }}
      />

      {/* Stem for half, quarter, eighth, and sixteenth notes */}
      {(duration === 'half' || duration === 'quarter' || duration === 'eighth' || duration === 'sixteenth') && (
        <line
          x1={stemDirection === 'up' ? x + radius : x - radius}
          y1={y}
          x2={stemDirection === 'up' ? x + radius : x - radius}
          y2={stemDirection === 'up' ? y - actualStemHeight : y + actualStemHeight}
          stroke={strokeColor}
          strokeWidth={6}
        />
      )}

      {/* Flag for eighth notes (single flag) */}
      {duration === 'eighth' && !hideFlag && (
        <line
          x1={stemDirection === 'up' ? x + radius : x - radius}
          y1={stemDirection === 'up' ? y - actualStemHeight : y + actualStemHeight}
          x2={stemDirection === 'up' ? x + radius + 24 : x - radius + 24}
          y2={stemDirection === 'up' ? y - actualStemHeight + 30 : y + actualStemHeight - 30}
          stroke={strokeColor}
          strokeWidth={7}
          style={{ pointerEvents: onPointerDown ? 'none' : 'auto' }}
        />
      )}

      {/* Flags for sixteenth notes (double flag) */}
      {duration === 'sixteenth' && !hideFlag && (
        <>
          {/* First flag */}
          <line
            x1={stemDirection === 'up' ? x + radius : x - radius}
            y1={stemDirection === 'up' ? y - actualStemHeight : y + actualStemHeight}
            x2={stemDirection === 'up' ? x + radius + 24 : x - radius + 24}
            y2={stemDirection === 'up' ? y - actualStemHeight + 30 : y + actualStemHeight - 30}
            stroke={strokeColor}
            strokeWidth={7}
            style={{ pointerEvents: onPointerDown ? 'none' : 'auto' }}
          />
          {/* Second flag */}
          <line
            x1={stemDirection === 'up' ? x + radius : x - radius}
            y1={stemDirection === 'up' ? y - actualStemHeight + 20 : y + actualStemHeight - 20}
            x2={stemDirection === 'up' ? x + radius + 24 : x - radius + 24}
            y2={stemDirection === 'up' ? y - actualStemHeight + 50 : y + actualStemHeight - 50}
            stroke={strokeColor}
            strokeWidth={7}
            style={{ pointerEvents: onPointerDown ? 'none' : 'auto' }}
          />
        </>
      )}
    </g>
  );
}

export default NoteHead;
