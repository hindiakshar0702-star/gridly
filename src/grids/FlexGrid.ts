import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

/**
 * Flexbox alignment guide grid.
 *
 * Renders the lines you'd want to see while debugging a flex layout:
 *   - Main axis (horizontal centerline)
 *   - Cross axis (vertical centerline)
 *   - justify-content marks at 25 / 50 / 75 %
 *   - align-items marks at 25 / 50 / 75 %
 *   - Edge guides
 */
export const renderFlexGrid: GridRenderer = (host, _options, { width, height }) => {
  const xs = [0.25, 0.5, 0.75];
  const ys = [0.25, 0.5, 0.75];

  // Axes (bold)
  host.appendChild(svg("line", {
    x1: 0, y1: height / 2, x2: width, y2: height / 2,
    class: "gridly-line--accent"
  }));
  host.appendChild(svg("line", {
    x1: width / 2, y1: 0, x2: width / 2, y2: height,
    class: "gridly-line--accent"
  }));

  // Justify / align tick marks
  for (const t of xs) {
    if (t === 0.5) continue;
    host.appendChild(svg("line", {
      x1: width * t, y1: 0, x2: width * t, y2: height,
      class: "gridly-line", "stroke-dasharray": "4 6"
    }));
  }
  for (const t of ys) {
    if (t === 0.5) continue;
    host.appendChild(svg("line", {
      x1: 0, y1: height * t, x2: width, y2: height * t,
      class: "gridly-line", "stroke-dasharray": "4 6"
    }));
  }

  // Corner edge tick marks (for align-items: stretch reference)
  const tick = 18;
  const corners = [
    [0, 0], [width, 0], [0, height], [width, height]
  ] as const;
  for (const [cx, cy] of corners) {
    host.appendChild(svg("line", {
      x1: cx, y1: cy,
      x2: cx + (cx === 0 ? tick : -tick),
      y2: cy,
      class: "gridly-line--bold"
    }));
    host.appendChild(svg("line", {
      x1: cx, y1: cy,
      x2: cx,
      y2: cy + (cy === 0 ? tick : -tick),
      class: "gridly-line--bold"
    }));
  }

  // Center marker
  host.appendChild(svg("circle", {
    cx: width / 2, cy: height / 2, r: 4,
    class: "gridly-fill--bold"
  }));
};
