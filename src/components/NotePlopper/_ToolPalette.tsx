import type { ReactNode } from 'react';
import type { NoteDuration, ToolPaletteProps } from './NotePlopper.types';

/**
 * Note duration options with their display labels
 */
const NOTE_DURATIONS: Array<{ value: NoteDuration; label: string }> = [
  { value: 'whole', label: 'Whole' },
  { value: 'half', label: 'Half' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'eighth', label: 'Eighth' },
];

/**
 * Pure presentational component for selecting note duration
 * Renders buttons for each supported note type
 */
function ToolPalette({ selectedDuration, onSelect }: ToolPaletteProps): ReactNode {
  return (
    <div className="note-plopper-palette">
      {NOTE_DURATIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`note-plopper-tool-btn${selectedDuration === value ? ' active' : ''}`}
          onClick={() => onSelect(value)}
          aria-pressed={selectedDuration === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default ToolPalette;
