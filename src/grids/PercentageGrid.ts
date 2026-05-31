import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

const STOPS = [0.1, 0.2, 0.25, 0.33, 0.5, 0.66, 0.75, 0.8, 0.9];

/**
 * Percentage guide grid.
 * Renders vertical + horizontal lines at common percentage stops
 * (10/20/25/33/50/66/75/80/90%) with labels.
 */
export const renderPercentageGrid: GridRenderer = (host, _options, { width, height }) => {
  for (const t of STOPS) {
    const x = width * t;
    const y = height * t;
    const isHalf = Math.abs(t - 0.5) < 0.001;
    const cls = isHalf ? "gridly-line--accent" : "gridly-line--bold";

    host.appendChild(svg("line", {
      x1: x, y1: 0, x2: x, y2: height, class: cls
    }));
    host.appendChild(svg("line", {
      x1: 0, y1: y, x2: width, y2: y, class: cls
    }));

    // Top labels for vertical lines
    host.appendChild(svg("text", {
      x: x + 4, y: 14, class: "gridly-label",
      style: "font-size:10px"
    }, [`${Math.round(t * 100)}%`]));

    // Left labels for horizontal lines
    host.appendChild(svg("text", {
      x: 4, y: y - 4, class: "gridly-label",
      style: "font-size:10px"
    }, [`${Math.round(t * 100)}%`]));
  }
};
