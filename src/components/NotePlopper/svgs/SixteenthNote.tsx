import type { ReactNode } from 'react';
import NoteHead from '../_NoteHead';

interface SvgProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function SVGSixteenthNote({ className, width = 56, height = 56 }: SvgProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 160 160" width={width} height={height} aria-hidden>
      <g>
        <NoteHead x={80} y={80} duration="sixteenth" stemHeight={70} stemDirection="up" hideLedgerLines />
      </g>
    </svg>
  );
}
