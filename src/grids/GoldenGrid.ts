import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

const PHI = 1.6180339887;

/**
 * Golden ratio grid (phi-based subdivisions on both axes).
 */
export const renderGoldenGrid: GridRenderer = (host, options, { width, height }) => {
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

  // Optional spiral guide
  const spiral = svg("path", {
    d: goldenSpiralPath(width, height),
    fill: "none",
    class: "gridly-line--bold"
  });
  host.appendChild(spiral);
};

function goldenSpiralPath(w: number, h: number): string {
  // Simple 4-arc spiral inscribed in a phi-rectangle
  const size = Math.min(w, h) * 0.6;
  const cx = w / 2;
  const cy = h / 2;
  let s = size;
  let x = cx - s / 2;
  let y = cy - s / 2;
  let path = `M ${x} ${y + s}`;
  for (let i = 0; i < 5; i++) {
    const r = s;
    path += ` A ${r} ${r} 0 0 1 ${x + s} ${y + s}`;
    s = s / PHI;
    x = x + r - s;
  }
  return path;
}
