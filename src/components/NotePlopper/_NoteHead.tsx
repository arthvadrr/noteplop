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
} as const;

const NOTE_STROKE_WIDTHS = {
  whole: 6,
  half: 6,
  quarter: 5,
  eighth: 5,
} as const;

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

function NoteHead({ x, y, duration, isGhost = false, onPointerDown, onPointerEnter, onPointerLeave }: NoteHeadProps): ReactNode {
  const opacity = isGhost ? 0.5 : 1;
  const radius = 24;
  const fillStyle = NOTE_FILL_STYLES[duration];
  const strokeWidth = NOTE_STROKE_WIDTHS[duration];
  const strokeColor = isGhost ? 'rgba(255, 255, 255, 0.5)' : 'white';
  const ledgerLines = calculateLedgerLines(y);

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
      opacity={opacity}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{ cursor: onPointerDown ? 'move' : 'default' }}
    >
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

      {/* Stem for half, quarter, and eighth notes */}
      {(duration === 'half' || duration === 'quarter' || duration === 'eighth') && (
        <line
          x1={x + radius}
          y1={y}
          x2={x + radius}
          y2={y - 120}
          stroke={strokeColor}
          strokeWidth={6}
        />
      )}

      {/* Flag for eighth notes */}
      {duration === 'eighth' && (
        <line
          x1={x + radius}
          y1={y - 120}
          x2={x + radius + 24}
          y2={y - 90}
          stroke={strokeColor}
          strokeWidth={7}
          style={{ pointerEvents: onPointerDown ? 'none' : 'auto' }}
        />
      )}
    </g>
  );
}

export default NoteHead;
