import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

/**
 * Dot grid (Figma-style).
 */
export const renderDotGrid: GridRenderer = (host, options, size) => {
  const spacing = Math.max(4, options.spacing);
  const r = Math.max(0.5, options.dotRadius);

  for (let y = spacing / 2; y < size.height; y += spacing) {
    for (let x = spacing / 2; x < size.width; x += spacing) {
      host.appendChild(svg("circle", {
        cx: x, cy: y, r, class: "gridly-fill--bold"
      }));
    }
  }
};
