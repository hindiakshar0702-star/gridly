import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

const PHI = 1.6180339887;

/**
 * Golden ratio grid (phi-based subdivisions on both axes).
 *
 * Renders 4 phi-position guide lines plus a proper golden spiral
 * inscribed in a centered phi-rectangle.
 */
export const renderGoldenGrid: GridRenderer = (host, _options, { width, height }) => {
  if (width <= 4 || height <= 4) return;

  // Vertical golden lines
  const vx1 = width / PHI;
  const vx2 = width - width / PHI;
  // Horizontal golden lines
  const hy1 = height / PHI;
  const hy2 = height - height / PHI;

  const lines: Array<[number, number, number, number]> = [
    [vx1, 0, vx1, height],
    [vx2, 0, vx2, height],
    [0, hy1, width, hy1],
    [0, hy2, width, hy2]
  ];

  for (const [x1, y1, x2, y2] of lines) {
    host.appendChild(svg("line", {
      x1, y1, x2, y2, class: "gridly-line--accent"
    }));
  }

  // Spiral inscribed in a phi-rectangle (50% of viewport)
  const path = goldenSpiralPath(width, height);
  if (path) {
    host.appendChild(svg("path", {
      d: path,
      fill: "none",
      class: "gridly-line--bold"
    }));
  }
};

/**
 * Build a proper golden spiral by walking quarter-arcs through
 * a sequence of phi-related squares inscribed in a centered
 * phi-rectangle.
 */
function goldenSpiralPath(w: number, h: number): string {
  // Inscribe a centered phi-rectangle covering ~50% of the viewport
  const aspect = w / h;
  let rectW: number;
  let rectH: number;
  if (aspect > PHI) {
    rectH = h * 0.5;
    rectW = rectH * PHI;
  } else {
    rectW = w * 0.5;
    rectH = rectW / PHI;
  }
  if (rectW < 8 || rectH < 8) return "";

  let x = (w - rectW) / 2;
  let y = (h - rectH) / 2;
  let bw = rectW;
  let bh = rectH;
  let dir = 0; // 0=right, 1=bottom, 2=left, 3=top

  const segments: string[] = [];
  let prev: { x: number; y: number } | null = null;

  for (let i = 0; i < 9; i++) {
    const sq = Math.min(bw, bh);
    if (sq < 4) break;

    // The square hugs whichever side `dir` points to.
    let sx = x;
    let sy = y;
    let nx = x;
    let ny = y;
    let nw = bw;
    let nh = bh;

    switch (dir) {
      case 0: // square on the LEFT, remainder on the right
        sx = x; sy = y;
        nx = x + sq; nw = bw - sq;
        break;
      case 1: // square on the TOP, remainder below
        sx = x; sy = y;
        ny = y + sq; nh = bh - sq;
        break;
      case 2: // square on the RIGHT, remainder on the left
        sx = x + bw - sq; sy = y;
        nw = bw - sq;
        break;
      case 3: // square on the BOTTOM, remainder above
        sx = x; sy = y + bh - sq;
        nh = bh - sq;
        break;
    }

    // Quarter-arc inside the square. The arc starts at the corner
    // adjacent to the previous square so the spiral is continuous.
    const arc = quarterArc(sx, sy, sq, dir);
    if (!prev) {
      segments.push(`M ${arc.start.x.toFixed(2)} ${arc.start.y.toFixed(2)}`);
    }
    segments.push(
      `A ${sq.toFixed(2)} ${sq.toFixed(2)} 0 0 1 ${arc.end.x.toFixed(2)} ${arc.end.y.toFixed(2)}`
    );
    prev = arc.end;

    x = nx; y = ny; bw = nw; bh = nh;
    dir = (dir + 1) % 4;
  }

  return segments.join(" ");
}

interface ArcEndpoints {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

function quarterArc(x: number, y: number, s: number, dir: number): ArcEndpoints {
  switch (dir) {
    case 0: return { start: { x: x,     y: y + s }, end: { x: x + s, y: y     } };
    case 1: return { start: { x: x,     y: y     }, end: { x: x + s, y: y + s } };
    case 2: return { start: { x: x + s, y: y     }, end: { x: x,     y: y + s } };
    case 3: return { start: { x: x + s, y: y + s }, end: { x: x,     y: y     } };
    default: return { start: { x, y }, end: { x, y } };
  }
}
