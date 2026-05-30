import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

/**
 * Horizontal baseline rhythm grid.
 * Every Nth line is rendered bolder (default every 4 lines).
 */
export const renderBaselineGrid: GridRenderer = (host, options, size) => {
  const baseline = Math.max(2, options.baseline);
  const boldEvery = 4;

  for (let y = 0, i = 0; y <= size.height; y += baseline, i++) {
    const cls = i % boldEvery === 0 ? "gridly-line--bold" : "gridly-line";
    host.appendChild(svg("line", {
      x1: 0, y1: y, x2: size.width, y2: y, class: cls
    }));
  }
};
