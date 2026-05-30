import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

/**
 * Isometric grid: 30-degree axes for 3D mockups.
 */
export const renderIsometricGrid: GridRenderer = (host, options, { width, height }) => {
  const spacing = Math.max(8, options.size);
  // 30-degree slope: dy/dx = tan(30deg) = 1/sqrt(3)
  const slope = 1 / Math.sqrt(3);

  // Diagonal lines going down-right (positive slope)
  const stepX = spacing / Math.cos(Math.atan(slope));
  for (let x = -height / slope; x < width + height / slope; x += stepX) {
    const y2 = (width - x) * slope;
    host.appendChild(svg("line", {
      x1: x, y1: 0, x2: width, y2,
      class: "gridly-line"
    }));
    host.appendChild(svg("line", {
      x1: 0, y1: -x * slope + height, x2: x + height / slope, y2: height,
      class: "gridly-line"
    }));
  }

  // Down-left diagonals (negative slope)
  for (let x = 0; x < width + height / slope; x += stepX) {
    host.appendChild(svg("line", {
      x1: x, y1: 0, x2: x - height / slope, y2: height,
      class: "gridly-line"
    }));
  }

  // Vertical lines
  for (let x = 0; x <= width; x += spacing) {
    host.appendChild(svg("line", {
      x1: x, y1: 0, x2: x, y2: height,
      class: "gridly-line--bold",
      opacity: 0.4
    }));
  }
};
