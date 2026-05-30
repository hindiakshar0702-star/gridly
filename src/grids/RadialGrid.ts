import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

/**
 * Radial grid: like polar but with logarithmic ring spacing
 * and labeled angular ticks. Useful for radar / radial UIs.
 */
export const renderRadialGrid: GridRenderer = (host, options, { width, height }) => {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) / 2;
  const rings = Math.max(2, options.rings);
  const sectors = Math.max(2, options.sectors);

  // Logarithmic rings (denser near the center, sparse outside)
  for (let i = 1; i <= rings; i++) {
    const t = i / rings;
    const r = maxR * Math.pow(t, 0.7);
    host.appendChild(svg("circle", {
      cx, cy, r, fill: "none", class: "gridly-line"
    }));
  }

  // Angular ticks
  for (let i = 0; i < sectors; i++) {
    const a = (Math.PI * 2 * i) / sectors;
    const x2 = cx + Math.cos(a) * maxR;
    const y2 = cy + Math.sin(a) * maxR;
    host.appendChild(svg("line", {
      x1: cx, y1: cy, x2, y2, class: "gridly-line--bold"
    }));
    if (options.showNumbers) {
      const lx = cx + Math.cos(a) * (maxR + 14);
      const ly = cy + Math.sin(a) * (maxR + 14);
      host.appendChild(svg("text", {
        x: lx, y: ly, "text-anchor": "middle",
        class: "gridly-label"
      }, [`${Math.round((360 * i) / sectors)}\u00b0`]));
    }
  }

  // Center crosshair
  host.appendChild(svg("circle", {
    cx, cy, r: 3, class: "gridly-fill--bold"
  }));
};
