import type { ReactNode } from 'react';
import { useState, useRef } from 'react';

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
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleClick = (callback: () => void, buttonName: string) => {
    callback();
    setClickedButton(buttonName);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setClickedButton(null);
    }, 500);
  };

  return (
    <div className="measure-controls">
      <button
        onClick={() => handleClick(onAddMeasure, 'add')}
        className={`measure-controls__button measure-controls__button--add${clickedButton === 'add' ? ' clicked' : ''}`}
      >
        Insert Measure
      </button>
      <button
        onClick={() => handleClick(onResetMeasure, 'reset')}
        disabled={!hasNotes}
        className={`measure-controls__button measure-controls__button--reset${clickedButton === 'reset' ? ' clicked' : ''}`}
      >
        Reset Measure
      </button>
      <button
        onClick={() => handleClick(onDeleteMeasure, 'delete')}
        disabled={isFirstMeasure}
        className={`measure-controls__button measure-controls__button--delete${clickedButton === 'delete' ? ' clicked' : ''}`}
      >
        Delete Measure
      </button>
    </div>
  );
}
