import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

/**
 * Rule of thirds: 2 vertical + 2 horizontal divisions.
 */
export const renderThirdsGrid: GridRenderer = (host, _options, { width, height }) => {
  const vx1 = width / 3;
  const vx2 = (width / 3) * 2;
  const hy1 = height / 3;
  const hy2 = (height / 3) * 2;

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

  // Intersection markers (power points)
  const points = [
    [vx1, hy1], [vx2, hy1], [vx1, hy2], [vx2, hy2]
  ];
  for (const [cx, cy] of points) {
    host.appendChild(svg("circle", {
      cx, cy, r: 4, class: "gridly-fill--bold"
    }));
  }
};
