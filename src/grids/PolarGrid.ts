import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

/**
 * Polar grid: concentric rings + angular sectors centered in the
 * (possibly device-simulated) viewport.
 */
export const renderPolarGrid: GridRenderer = (host, options, { width, height }) => {
  const cx = width / 2;
  const cy = height / 2;
  // Leave a small breathing-room margin so outer ring + tick labels
  // don't touch viewport / device-frame edges. Clamp non-negative
  // for tiny viewports.
  const maxR = Math.max(0, Math.min(width, height) / 2 - 24);
  const rings = Math.max(2, options.rings);
  const sectors = Math.max(2, options.sectors);

  // Skip drawing if the available radius is too small to be useful.
  if (maxR <= 4) return;

  // Rings
  for (let i = 1; i <= rings; i++) {
    const r = (maxR / rings) * i;
    const cls = i === rings ? "gridly-line--accent" : "gridly-line--bold";
    host.appendChild(svg("circle", {
      cx, cy, r, fill: "none", class: cls
    }));
  }

  // Sectors
  for (let i = 0; i < sectors; i++) {
    const a = (Math.PI * 2 * i) / sectors;
    host.appendChild(svg("line", {
      x1: cx, y1: cy,
      x2: cx + Math.cos(a) * maxR,
      y2: cy + Math.sin(a) * maxR,
      class: "gridly-line"
    }));
  }

  // Center dot
  host.appendChild(svg("circle", {
    cx, cy, r: 3, class: "gridly-fill--bold"
  }));
};
