/*
  PropDefs
  --------------------------------------------------------------------------
  One-time SVG filter definitions for the Property Kit, mounted once at the
  app root. Filters are referenced by url(#...) from CSS on STATIC elements
  only — never on anything that animates or scrolls (DESIGN-BIBLE,
  Materials & Light: live turbulence is licensed only in one-time defs).
*/

export function PropDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {/* Rubber stamp — uneven inking + eroded edges */}
        <filter id="stamp-erode" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.35"
            numOctaves="2"
            seed="7"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
          <feComponentTransfer>
            <feFuncA type="gamma" amplitude="1" exponent="1.2" offset="0" />
          </feComponentTransfer>
        </filter>

        {/* Pencil / grease-pencil line wobble */}
        <filter id="pencil-wobble" x="-6%" y="-30%" width="112%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.11"
            numOctaves="2"
            seed="11"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" />
        </filter>

        {/* Chalk — soft edge + grain drop-out */}
        <filter id="chalk-scratch" x="-6%" y="-20%" width="112%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.6"
            numOctaves="2"
            seed="3"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" result="d" />
          <feGaussianBlur in="d" stdDeviation="0.35" />
        </filter>

        {/* Torn paper edge (applied to slip bottoms via CSS filter) */}
        <filter id="torn-edge" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="turbulence" baseFrequency="0.08 0.35" numOctaves="2" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
        </filter>
      </defs>
    </svg>
  );
}
