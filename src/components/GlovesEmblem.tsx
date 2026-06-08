/*
  GlovesEmblem
  --------------------------------------------------------------------------
  A small pair of laced boxing gloves, drawn in the same hand-inked vintage
  fight-program style as the detail on the walk-in card. Used as the title
  motif and as section ornamentation. Pure SVG, currentColor-driven so it
  inherits amber/parchment wherever it sits.
*/

interface Props {
  size?: number;
  className?: string;
}

export function GlovesEmblem({ size = 64, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Boxing gloves"
      fill="none"
    >
      <g stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        {/* Left glove */}
        <g>
          <path
            d="M30 58c-10 0-16 7-16 17 0 12 9 20 22 20h12c5 0 8-3 8-8V63c0-6-3-9-9-9-3-7-9-11-17-11-2 0-4 1-4 3 0 4 6 5 9 7"
            fill="currentColor"
            fillOpacity="0.12"
          />
          {/* thumb */}
          <path d="M30 62c-5 0-9 3-9 8s4 8 9 8" />
          {/* wrist lacing */}
          <path d="M40 95v12" />
          <path d="M52 95v12" />
          <path d="M40 99h12M40 103h12M40 107h12" />
        </g>

        {/* Right glove, mirrored */}
        <g transform="translate(120,0) scale(-1,1)">
          <path
            d="M30 58c-10 0-16 7-16 17 0 12 9 20 22 20h12c5 0 8-3 8-8V63c0-6-3-9-9-9-3-7-9-11-17-11-2 0-4 1-4 3 0 4 6 5 9 7"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <path d="M30 62c-5 0-9 3-9 8s4 8 9 8" />
          <path d="M40 95v12" />
          <path d="M52 95v12" />
          <path d="M40 99h12M40 103h12M40 107h12" />
        </g>
      </g>
    </svg>
  );
}
