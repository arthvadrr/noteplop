import React, { useEffect, useState, useRef } from 'react';
import { useScore } from '../../contexts/ScoreContext/ScoreContext';
import type { PlacedNote } from '../../contexts/ScoreContext/ScoreContext.types';

/**
 * NoteRotary
 * - Renders a relatively-positioned overlay above the measures
 * - Shows note names for notes in the current (active) measure
 * - Positions labels by querying the DOM for rendered note elements and using their X positions
 *
 * Minimal styles for now; positioning is computed from the `.measure-carousel` element.
 */
export default function NoteRotary(): React.ReactElement | null {
  const { activeMeasure } = useScore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [positions, setPositions] = useState<Record<string, number>>({});

  if (!activeMeasure) return null;

  useEffect(() => {
    function computePositions() {
      const measureSlide = document.querySelector(`.measure-slide[data-measure-id="${activeMeasure!.id}"]`);

      if (!measureSlide || !containerRef.current) {
        setPositions({});

        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();

      // Find note elements inside the measure SVG that carry data-note-id
      const svg = measureSlide.querySelector('svg');

      if (!svg) {
        setPositions({});

        return;
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

      setPositions(next);
    }

    // Compute initially and after a short delay to allow measure carousel transitions
    computePositions();
    const t = setTimeout(computePositions, 300);

    // Recompute on resize
    window.addEventListener('resize', computePositions);

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', computePositions);
    };
  }, [activeMeasure]);

  if (!activeMeasure) return null;

  // Snap points used by staff (must match the staff's snap grid)
  // This matches the SNAP_POINTS built in `NotePlopper` (includes duplicates)
  const SNAP_POINTS = [
    25,
    62.5,
    100,
    137.5,
    175,
    212.5,
    212.5,
    250,
    287.5,
    325,
    362.5,
    400,
    437.5,
    475,
    512.5,
    550,
    587.5,
    587.5,
    625,
    662.5,
    700,
    737.5,
    775,
  ];

  // Pitch name maps from top (small y) -> bottom (large y). Length = 23.
  // These are diatonic letter names (no accidentals); index 15 corresponds to y=550 (bottom staff line)
  const trebleMap = [
    'F','E','D','C','B','A','G','F','E','D','C','B','A','G','F','E','D','C','B','A','G','F','E'
  ];

  const bassMap = [
    'A','G','F','E','D','C','B','A','G','F','E','D','C','B','A','G','F','E','D','C','B','A','G'
  ];

  const altoMap = [
    'G','F','E','D','C','B','A','G','F','E','D','C','B','A','G','F','E','D','C','B','A','G','F'
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
      style={{
        position: 'relative',
        pointerEvents: 'none',
      }}
    >
      {activeMeasure.notes.map((note) => {
        const x = positions[note.id];

        if (typeof x === 'undefined') return null;

        const label = labelForNote(note);

        return (
          <div
            key={note.id}
            style={{
              position: 'absolute',
              left: x,
              top: 0,
              transform: 'translateX(-50%) translateY(-100%)',
              pointerEvents: 'none',
              color: 'white',
              fontSize: 12,
              background: 'transparent',
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
