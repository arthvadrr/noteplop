import type { ReactNode } from 'react';

interface MeasureControlsProps {
  isFirstMeasure: boolean;
  hasNotes: boolean;
  onAddMeasure: () => void;
  onResetMeasure: () => void;
  onDeleteMeasure: () => void;
}

/**
 * Control buttons for adding and deleting measures
 */
export default function MeasureControls({
  isFirstMeasure,
  hasNotes,
  onAddMeasure,
  onResetMeasure,
  onDeleteMeasure,
}: MeasureControlsProps): ReactNode {
  return (
    <div className="measure-controls">
      <button
        onClick={onAddMeasure}
        className="measure-controls__button measure-controls__button--add"
      >
        Insert Measure
      </button>
      <button
        onClick={onResetMeasure}
        disabled={!hasNotes}
        className="measure-controls__button measure-controls__button--reset"
      >
        Reset Measure
      </button>
      <button
        onClick={onDeleteMeasure}
        disabled={isFirstMeasure}
        className="measure-controls__button measure-controls__button--delete"
      >
        Delete Measure
      </button>
    </div>
  );
}
