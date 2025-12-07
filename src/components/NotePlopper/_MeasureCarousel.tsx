import type { ReactNode } from 'react';
import type { Measure } from '../../contexts/ScoreContext/ScoreContext.types';

interface MeasureCarouselProps {
  measures: Measure[];
  activeMeasureId: string;
  children: (measure: Measure, isActive: boolean, index: number) => ReactNode;
}

/**
 * Carousel container that slides between measures with smooth transitions
 * Shows all measures but only the active one is interactive
 */
export default function MeasureCarousel({
  measures,
  activeMeasureId,
  children,
}: MeasureCarouselProps): ReactNode {
  const activeMeasureIndex = measures.findIndex((m) => m.id === activeMeasureId);
  const trackWidth = measures.length * 100; // Total width as percentage

  return (
    <div className="measure-carousel">
      <div
        className="measure-track"
        style={{
          width: `${trackWidth}%`,
          transform: `translateX(-${(activeMeasureIndex / measures.length) * 100}%)`,
        }}
      >
        {measures.map((measure, index) => (
          <div
            key={measure.id}
            className="measure-slide"
            data-measure-id={measure.id}
            style={{ width: `${100 / measures.length}%` }}
          >
            {children(measure, measure.id === activeMeasureId, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
