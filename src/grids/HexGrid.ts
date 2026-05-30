import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

/**
 * Hexagonal grid (pointy-top), tightly packed.
 */
export const renderHexGrid: GridRenderer = (host, options, { width, height }) => {
  const r = Math.max(8, options.hexRadius);
  const w = Math.sqrt(3) * r;       // hex width
  const h = 2 * r;                  // hex height
  const vSpacing = h * 0.75;        // vertical row spacing for pointy-top hexes

  let row = 0;
  for (let cy = 0; cy < height + h; cy += vSpacing, row++) {
    const offset = row % 2 === 0 ? 0 : w / 2;
    for (let cx = -w; cx < width + w; cx += w) {
      host.appendChild(svg("polygon", {
        points: hexPoints(cx + offset, cy, r),
        fill: "none",
        class: "gridly-line"
      }));
    }
  }
};

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2; // pointy-top
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}
