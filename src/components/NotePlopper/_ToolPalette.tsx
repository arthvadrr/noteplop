import type { ReactNode } from 'react';
import type { NoteDuration, TimeSignature, Clef } from '../../contexts/ScoreContext/ScoreContext.types';
import type { ToolPaletteProps } from './NotePlopper.types';

/**
 * Time signature options
 */
const TIME_SIGNATURES: TimeSignature[] = ['4/4', '3/4', '6/8', '2/4'];

/**
 * Clef options with display labels
 */
const CLEFS: Array<{ value: Clef; label: string }> = [
  { value: 'treble', label: 'Treble' },
  { value: 'bass', label: 'Bass' },
  { value: 'alto', label: 'Alto' },
];

/**
 * Note duration options with their display labels
 */
const NOTE_DURATIONS: Array<{ value: NoteDuration; label: string }> = [
  { value: 'whole', label: 'Whole' },
  { value: 'half', label: 'Half' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'eighth', label: 'Eighth' },
  { value: 'sixteenth', label: 'Sixteenth' },
];

/**
 * Component for selecting time signature, clef, and note duration
 */
function ToolPalette({
  selectedDuration,
  selectedTimeSignature,
  selectedClef,
  onSelectDuration,
  onSelectTimeSignature,
  onSelectClef
}: ToolPaletteProps): ReactNode {
  return (
    <div className="note-plopper-palette">
      {/* Time Signature Section */}
      <div className="palette-section">
        <label className="palette-section-label">Time Signature</label>
        <div className="palette-section-buttons">
          {TIME_SIGNATURES.map((timeSignature) => (
            <button
              key={timeSignature}
              type="button"
              className={`note-plopper-tool-btn${selectedTimeSignature === timeSignature ? ' active' : ''}`}
              onClick={() => onSelectTimeSignature(timeSignature)}
              aria-pressed={selectedTimeSignature === timeSignature}
            >
              {timeSignature}
            </button>
          ))}
        </div>
      </div>

      {/* Clef Section */}
      <div className="palette-section">
        <label className="palette-section-label">Clef</label>
        <div className="palette-section-buttons">
          {CLEFS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`note-plopper-tool-btn${selectedClef === value ? ' active' : ''}`}
              onClick={() => onSelectClef(value)}
              aria-pressed={selectedClef === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Note Duration Section */}
      <div className="palette-section">
        <label className="palette-section-label">Note Duration</label>
        <div className="palette-section-buttons">
          {NOTE_DURATIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`note-plopper-tool-btn${selectedDuration === value ? ' active' : ''}`}
              onClick={() => onSelectDuration(value)}
              aria-pressed={selectedDuration === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ToolPalette;
