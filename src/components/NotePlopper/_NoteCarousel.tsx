import { useEffect, useState, useRef } from 'react';
import { useScore } from '../../contexts/ScoreContext/ScoreContext';
import type { PlacedNote } from '../../contexts/ScoreContext/ScoreContext.types';

/**
 * NoteRotary
 * Shows note names for notes in the current (active) measure
 * Positions labels by querying the DOM for rendered note elements and using their X positions
 */
export default function NoteRotary(): React.ReactElement | null {
  const { activeMeasure } = useScore();
  const [positions, setPositions] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const rafStartRef = useRef<number | null>(null);
  const positionsRef = useRef<Record<string, number>>({});

  if (!activeMeasure) return null;

  useEffect(() => {
    function computePositions(): boolean {
      const measureSlide = document.querySelector(`.measure-slide[data-measure-id="${activeMeasure!.id}"]`);

      if (!measureSlide || !containerRef.current) {
        const empty: Record<string, number> = {};
        const prev = positionsRef.current;

        const same = Object.keys(prev).length === 0;

        if (!same) {
          positionsRef.current = empty;
          setPositions(empty);
        }

        return !same;
      }

      const containerRect = containerRef.current.getBoundingClientRect();

      // Find note elements inside the measure SVG that carry data-note-id which we use to set posX
      const svg = measureSlide.querySelector('svg');

      if (!svg) {
        const empty: Record<string, number> = {};
        const prev = positionsRef.current;

        const same = Object.keys(prev).length === 0;

        if (!same) {
          positionsRef.current = empty;
          setPositions(empty);
        }

        return !same;
      }

      const noteEls = Array.from(svg.querySelectorAll('[data-note-id]')) as Element[];
      const next: Record<string, number> = {};

      noteEls.forEach((el) => {
        const id = el.getAttribute('data-note-id');

        if (!id) return;

        // Prefer the actual note head circle bounding box (avoids duration indicator skew)
        let rect: DOMRect | null = null;

        // Try to find a circle that likely represents the note head (non-transparent fill)
        const headCircle = el.querySelector('circle:not([fill="transparent"])') as SVGCircleElement | null;

        if (headCircle) {
          rect = headCircle.getBoundingClientRect();
        } else {
          // Fallback to group's bounding box
          rect = el.getBoundingClientRect();
        }

        // X position relative to our container element
        const x = rect.left - containerRect.left + rect.width / 2;

        next[id] = x;
      });

      // Compare shallow equality with previous positionsRef to know if anything changed
      const prev = positionsRef.current;

      let changed = false;

      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);

      if (prevKeys.length !== nextKeys.length) {
        changed = true;
      } else {
        for (let i = 0; i < nextKeys.length; i++) {
          const k = nextKeys[i];

          if (prev[k] !== next[k]) {
            changed = true;
            break;
          }
        }
      }

      if (changed) {
        positionsRef.current = next;
        setPositions(next);
      }

      return changed;
    }

    // Compute initially and then for a short time using requestAnimationFrame
    // to allow measure carousel transitions to finish (replaces setTimeout)
    computePositions();

    function scheduleRafCompute() {
      rafStartRef.current = performance.now();

      // Run until positions stop changing. Use a safety cap to avoid an infinite loop.
      const MAX_FRAMES = 60;
      let frameCount = 0;
      let unchangedFrames = 0;

      const loop = (_ts: number) => {
        frameCount++;

        const changed = computePositions();

        if (!changed) {
          unchangedFrames++;
        } else {
          unchangedFrames = 0;
        }

        const stopBecauseStable = unchangedFrames >= 2; // two frames of stability
        const stopBecauseCap = frameCount >= MAX_FRAMES;

        if (!stopBecauseStable && !stopBecauseCap) {
          rafRef.current = requestAnimationFrame(loop);
        } else {
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(loop);
    }

    scheduleRafCompute();

    // Recompute on resize
    window.addEventListener('resize', computePositions);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', computePositions);
    };
  }, [activeMeasure]);

  if (!activeMeasure) return null;

  /**
   * These are the positions to map the note names 
   * We start at 25 for the notehead offset. Then it's 37.5 in between
   */
  const SNAP_POINTS = Array.from({ length: 21 }, (_, i) => 25 + i * 37.5);

  /**
   * Pitch name maps from top (small y) -> bottom (large y). Length = 23.
   * These are diatonic letter names (no accidentals); index 15 corresponds to y=550 (bottom staff line)
   */
  const trebleMap = [
    'F', 'E', 'D', 'C', 'B', 'A', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'G', 'F', 'E'
  ];

  const bassMap = [
    'A', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'G'
  ];

  const altoMap = [
    'G', 'F', 'E', 'D', 'C', 'B', 'A', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'G', 'F'
  ];

  // Helper: map a note Y to the nearest snap point index
  function nearestSnapIndex(y: number): number {
    let best = 0;
    let bestDist = Infinity;

    for (let i = 0; i < SNAP_POINTS.length; i++) {
      const p = SNAP_POINTS[i];
      const d = Math.abs(p - y);

      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }

    return best;
  }

  function labelForNote(note: PlacedNote): string {
    const idx = nearestSnapIndex(note.y);
    const map = (activeMeasure!.clef === 'bass') ? bassMap : (activeMeasure!.clef === 'alto' ? altoMap : trebleMap);
    return map[idx] ?? 'C';
  }

  return (
    <div
      ref={containerRef}
      className="note-rotary"
    >
      {activeMeasure.notes.map((note) => {
        const x = positions[note.id];

        if (typeof x === 'undefined') return null;

        const label = labelForNote(note);

        return (
          <div
            key={note.id}
            className="note"
            style={{
              left: x,
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
