import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

const PHI = 1.6180339887;

/**
 * Fibonacci grid: phi-based square subdivisions inscribed in
 * the viewport, plus a quarter-circle Fibonacci spiral.
 *
 * Differs from `golden`:
 *   - Drawn from a corner (not centered)
 *   - Renders all subdivision rectangles, not just guide lines
 *   - The spiral is composed of true quarter-circles
 */
export const renderFibonacciGrid: GridRenderer = (host, _options, { width, height }) => {
  // Fit a phi-rectangle inside the viewport
  const aspect = width / height;
  let rectW: number;
  let rectH: number;
  if (aspect > PHI) {
    rectH = height;
    rectW = height * PHI;
  } else {
    rectW = width;
    rectH = width / PHI;
  }
  const ox = (width - rectW) / 2;
  const oy = (height - rectH) / 2;

  // Outer rectangle
  host.appendChild(svg("rect", {
    x: ox, y: oy, width: rectW, height: rectH,
    fill: "none", class: "gridly-line--accent"
  }));

  // Recursive subdivision: each step splits off a square equal to
  // the smaller side, alternating orientation.
  let x = ox;
  let y = oy;
  let w = rectW;
  let h = rectH;
  let dir = 0; // 0=right,1=bottom,2=left,3=top
  const arcs: string[] = [];
  for (let i = 0; i < 9; i++) {
    const sq = Math.min(w, h);
    let sx = x;
    let sy = y;
    let nx = x;
    let ny = y;
    let nw = w;
    let nh = h;

    switch (dir) {
      case 0: sx = x;             sy = y; nx = x + sq;     nw = w - sq;     break;
      case 1: sx = x;             sy = y; ny = y + sq;     nh = h - sq;     break;
      case 2: sx = x + w - sq;    sy = y; nw = w - sq;                       break;
      case 3: sx = x;             sy = y + h - sq;          nh = h - sq;     break;
    }

    host.appendChild(svg("rect", {
      x: sx, y: sy, width: sq, height: sq,
      fill: "none", class: "gridly-line"
    }));

    // Quarter-arc inside this square (corners depend on direction)
    arcs.push(quarterArc(sx, sy, sq, dir));

    x = nx; y = ny; w = nw; h = nh;
    dir = (dir + 1) % 4;
    if (Math.min(w, h) < 6) break;
  }

  host.appendChild(svg("path", {
    d: arcs.join(" "),
    fill: "none",
    class: "gridly-line--bold"
  }));
};

function quarterArc(x: number, y: number, s: number, dir: number): string {
  // Arc starts and ends at two corners of the square, sweeping inward.
  const r = s;
  switch (dir) {
    case 0: return `M ${x} ${y + s} A ${r} ${r} 0 0 1 ${x + s} ${y}`;
    case 1: return `M ${x} ${y}     A ${r} ${r} 0 0 1 ${x + s} ${y + s}`;
    case 2: return `M ${x + s} ${y} A ${r} ${r} 0 0 1 ${x} ${y + s}`;
    case 3: return `M ${x + s} ${y + s} A ${r} ${r} 0 0 1 ${x} ${y}`;
    default: return "";
  }
}
