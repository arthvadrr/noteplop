import NoteHead from '../_NoteHead';
import type { ReactNode } from 'react';

interface SvgProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function SVGHalfNote({ className, width = 56, height = 56 }: SvgProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 160 160" width={width} height={height} aria-hidden>
      <g>
        <NoteHead x={80} y={80} duration="half" stemHeight={70} stemDirection="up" hideLedgerLines />
      </g>
    </svg>
  );
}
