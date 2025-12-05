import { useRef, useEffect } from 'react';
import SVGWholeNote from './svgs/WholeNote';
import SVGHalfNote from './svgs/HalfNote';
import SVGQuarterNote from './svgs/QuarterNote';
import SVGEighthNote from './svgs/EighthNote';
import SVGSixteenthNote from './svgs/SixteenthNote';
import type { ReactNode, ReactElement } from 'react';
import type { NoteDuration } from '../../contexts/ScoreContext/ScoreContext.types';
import type { Notation } from './NotePlopper.types';

const NOTATIONS: Notation[] = [
  { value: 'sixteenth', label: 'Sixteenth' },
  { value: 'eighth', label: 'Eighth' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'half', label: 'Half' },
  { value: 'whole', label: 'Whole' },
];

interface NotationsBarProps {
  selectedDuration: NoteDuration | null;
  onSelectDuration: (duration: NoteDuration) => void;
}

/**
 * A horizontally scrollable bar of compact, selectable notation cards.
 * Each card shows a small SVG preview (re-using `NoteHead`) and a small label.
 */
function NotationsBar({ selectedDuration, onSelectDuration }: NotationsBarProps): ReactNode {
  const ICONS: Record<NoteDuration, (props?: { className?: string; width?: number; height?: number }) => ReactElement> = {
    whole: (p) => <SVGWholeNote {...p} />,
    half: (p) => <SVGHalfNote {...p} />,
    quarter: (p) => <SVGQuarterNote {...p} />,
    eighth: (p) => <SVGEighthNote {...p} />,
    sixteenth: (p) => <SVGSixteenthNote {...p} />,
  };

  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, NOTATIONS.length);
  }, []);

  /**
   * Helper to scroll a button into view within the container (avoids scrolling the page)
   */
  function scrollButtonIntoView(index: number) {
    const container = containerRef.current;
    const btn = buttonRefs.current[index];
    if (!container || !btn) return;

    /**
     * Compute scroll position using bounding rects so the calculation
     * is relative to the container's viewport even when offsetParent isn't the container.
     */
    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const btnCenterRelativeToContainer = btnRect.left - containerRect.left + btnRect.width / 2;
    const targetScrollLeft = Math.max(0, Math.round(container.scrollLeft + btnCenterRelativeToContainer - container.clientWidth / 2));

    try {
      container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    } catch {
      container.scrollLeft = targetScrollLeft;
    }
  }

  /**
   * Do the smooth scroll
   */
  useEffect(() => {
    if (!selectedDuration) return;
    const selectedIndex = NOTATIONS.findIndex((n) => n.value === selectedDuration);
    if (selectedIndex >= 0) scrollButtonIntoView(selectedIndex);
  }, [selectedDuration]);

  return (
    <div className="notations-bar" role="radiogroup" aria-label="Notations" ref={containerRef}>
      {NOTATIONS.map(({ value, label }, index) => {
        const Icon = ICONS[value];
        const isSelected = selectedDuration === value;

        function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectDuration(value);
            return;
          }

          const last = NOTATIONS.length - 1;

          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const next = index === last ? 0 : index + 1;
            const nextValue = NOTATIONS[next].value;
            onSelectDuration(nextValue);
            buttonRefs.current[next]?.focus();
            scrollButtonIntoView(next);
            return;
          }

          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = index === 0 ? last : index - 1;
            const prevValue = NOTATIONS[prev].value;
            onSelectDuration(prevValue);
            buttonRefs.current[prev]?.focus();
            scrollButtonIntoView(prev);
            return;
          }

          if (e.key === 'Home') {
            e.preventDefault();
            const firstValue = NOTATIONS[0].value;
            onSelectDuration(firstValue);
            buttonRefs.current[0]?.focus();
            scrollButtonIntoView(0);
            return;
          }

          if (e.key === 'End') {
            e.preventDefault();
            const lastValue = NOTATIONS[last].value;
            onSelectDuration(lastValue);
            buttonRefs.current[last]?.focus();
            scrollButtonIntoView(last);
            return;
          }
        }

        return (
          <button
            key={value}
            ref={(el) => { buttonRefs.current[index] = el; }}
            type="button"
            className={`notation-card${isSelected ? ' active' : ''}`}
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            aria-label={label}
            onClick={() => onSelectDuration(value)}
            onKeyDown={handleKeyDown}
          >
            <Icon className="notation-svg" width={56} height={56} />
            <span className="notation-label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default NotationsBar;
