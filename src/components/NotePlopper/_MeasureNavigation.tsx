import type { ReactNode } from 'react';

interface MeasureNavigationProps {
  currentMeasureNumber: number;
  totalMeasures: number;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Measure indicator showing current measure number
 */
export function MeasureIndicator({
  currentMeasureNumber,
  totalMeasures,
}: { currentMeasureNumber: number; totalMeasures: number }): ReactNode {
  return (
    <div className="measure-indicator">
      Measure {currentMeasureNumber} of {totalMeasures}
    </div>
  );
}

/**
 * Navigation buttons for moving between measures
 */
export default function MeasureNavigation({
  currentMeasureNumber,
  totalMeasures,
  onPrevious,
  onNext,
}: MeasureNavigationProps): ReactNode {
  const isFirstMeasure = currentMeasureNumber === 1;
  const isLastMeasure = currentMeasureNumber === totalMeasures;

  return (
    <div className="measure-navigation">
      <button
        onClick={onPrevious}
        disabled={isFirstMeasure}
        className="measure-navigation__button"
      >
        ← Previous Measure
      </button>
      <button
        onClick={onNext}
        disabled={isLastMeasure}
        className="measure-navigation__button"
      >
        Next Measure →
      </button>
    </div>
  );
}
