import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

/**
 * Uniform square grid (cells of `size` px).
 * Bold every 5 cells for legibility.
 */
export const renderSquareGrid: GridRenderer = (host, options, size) => {
  const cell = Math.max(4, options.size);
  const boldEvery = 5;

  for (let i = 0, x = 0; x <= size.width; x += cell, i++) {
    const cls = i % boldEvery === 0 ? "gridly-line--bold" : "gridly-line";
    host.appendChild(svg("line", {
      x1: x, y1: 0, x2: x, y2: size.height, class: cls
    }));
  }
  for (let j = 0, y = 0; y <= size.height; y += cell, j++) {
    const cls = j % boldEvery === 0 ? "gridly-line--bold" : "gridly-line";
    host.appendChild(svg("line", {
      x1: 0, y1: y, x2: size.width, y2: y, class: cls
    }));
  }
};
