import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

/**
 * Diagonal cross-grid (45 degrees).
 * Useful for diagonal type lockups, hero shapes, and crosshatch checks.
 */
export const renderDiagonalGrid: GridRenderer = (host, options, { width, height }) => {
  const spacing = Math.max(8, options.size);

  // Down-right diagonals (y increases with x)
  for (let off = -height; off < width; off += spacing) {
    host.appendChild(svg("line", {
      x1: off, y1: 0, x2: off + height, y2: height,
      class: "gridly-line"
    }));
  }
  // Down-left diagonals (y decreases with x)
  for (let off = 0; off < width + height; off += spacing) {
    host.appendChild(svg("line", {
      x1: off, y1: 0, x2: off - height, y2: height,
      class: "gridly-line"
    }));
  }

  // Bold center cross
  host.appendChild(svg("line", {
    x1: 0, y1: 0, x2: width, y2: height,
    class: "gridly-line--accent"
  }));
  host.appendChild(svg("line", {
    x1: width, y1: 0, x2: 0, y2: height,
    class: "gridly-line--accent"
  }));
};
