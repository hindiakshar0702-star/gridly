import type { ResolvedOptions } from "../types";
import { svg } from "../utils/createElement";
import { computeBox } from "./ColumnGrid";

/**
 * Visual debug overlay that renders the constraint-based layout's
 * key positions on top of the regular grid:
 *
 *   - viewport bounds (blue dashed outline)
 *   - container bounds (green outline)
 *   - grid origin     (orange solid line at containerX, with label)
 *   - column boundaries (orange dashed lines at columnX(i))
 *   - rightMargin marker (purple line at containerX + containerWidth)
 *
 * Used to verify the constraint invariants visually:
 *   1. Origin always equals leftMargin
 *   2. Changing rightMargin only moves the right edge
 *   3. Changing gutter only changes spacing between columns
 *   4. Changing column count never moves origin
 *
 * Toggled via the `showDebugOverlay` option (or the panel checkbox).
 */
export function drawDebugOverlay(
  host: SVGElement,
  options: ResolvedOptions,
  size: { width: number; height: number }
): void {
  const { containerX, containerWidth } = computeBox(options, size.width);
  const { columns, gutter, marginLeft, marginRight, maxWidth } = options;

  const safeCols = Math.max(1, columns);
  const totalGutters = gutter * Math.max(0, safeCols - 1);
  const columnWidth = Math.max(0, (containerWidth - totalGutters) / safeCols);

  // ── 1. Viewport bounds ─────────────────────────────────────────────
  host.appendChild(svg("rect", {
    x: 0.5, y: 0.5,
    width: Math.max(0, size.width - 1),
    height: Math.max(0, size.height - 1),
    fill: "none",
    stroke: "rgba(59, 130, 246, 0.6)",   // blue
    "stroke-width": 1,
    "stroke-dasharray": "8 4"
  }));
  host.appendChild(debugLabel(
    4, 14,
    `viewport ${Math.round(size.width)}\u00d7${Math.round(size.height)}`,
    "rgba(59,130,246,0.95)"
  ));

  // ── 2. Container bounds ────────────────────────────────────────────
  host.appendChild(svg("rect", {
    x: containerX, y: 0,
    width: containerWidth, height: size.height,
    fill: "none",
    stroke: "rgba(34, 197, 94, 0.85)",   // green
    "stroke-width": 1.5
  }));
  host.appendChild(debugLabel(
    containerX + 6,
    size.height - 30,
    `container ${Math.round(containerWidth)}px`,
    "rgba(34,197,94,1)"
  ));

  // ── 3. Grid origin (the key constraint visual) ─────────────────────
  host.appendChild(svg("line", {
    x1: containerX, y1: 0,
    x2: containerX, y2: size.height,
    stroke: "rgba(234, 88, 12, 1)",      // orange
    "stroke-width": 2.5
  }));
  host.appendChild(debugBadge(
    containerX,
    32,
    `ORIGIN  x = leftMargin = ${Math.round(containerX)}`,
    "rgba(234,88,12,1)"
  ));

  // ── 4. Right margin marker ─────────────────────────────────────────
  const rightX = containerX + containerWidth;
  host.appendChild(svg("line", {
    x1: rightX, y1: 0,
    x2: rightX, y2: size.height,
    stroke: "rgba(168, 85, 247, 1)",     // purple
    "stroke-width": 2,
    "stroke-dasharray": "6 4"
  }));
  host.appendChild(debugLabel(
    rightX - 4,
    size.height - 14,
    `rightMargin ${Math.round(marginRight)}`,
    "rgba(168,85,247,1)",
    "end"
  ));

  // ── 5. Column boundaries (every column start) ──────────────────────
  if (columnWidth > 0 && safeCols > 0) {
    for (let i = 0; i < safeCols; i++) {
      const colX = containerX + i * (columnWidth + gutter);
      host.appendChild(svg("line", {
        x1: colX, y1: 0,
        x2: colX, y2: size.height,
        stroke: "rgba(234, 88, 12, 0.45)",
        "stroke-width": 1,
        "stroke-dasharray": "2 4"
      }));
      // Tag every 4th column boundary so the labels don't crowd each other
      if (i > 0 && i % 4 === 0) {
        host.appendChild(debugLabel(
          colX + 4,
          14,
          `col[${i}] x=${Math.round(colX)}`,
          "rgba(234,88,12,0.85)"
        ));
      }
    }

    // Also draw the right edge of the last column
    const lastColEnd = containerX + safeCols * columnWidth + (safeCols - 1) * gutter;
    host.appendChild(svg("line", {
      x1: lastColEnd, y1: 0,
      x2: lastColEnd, y2: size.height,
      stroke: "rgba(234, 88, 12, 0.45)",
      "stroke-width": 1,
      "stroke-dasharray": "2 4"
    }));
  }

  // ── 6. Stats panel (top-right) ─────────────────────────────────────
  const lines = [
    `leftMargin   = ${Math.round(marginLeft)}`,
    `rightMargin  = ${Math.round(marginRight)}`,
    `maxWidth     = ${maxWidth || "(unset)"}`,
    `columns      = ${safeCols}`,
    `gutter       = ${gutter}`,
    ` `,
    `containerX   = ${Math.round(containerX)}    ← = leftMargin`,
    `containerW   = ${Math.round(containerWidth)}`,
    `columnWidth  = ${columnWidth.toFixed(2)}`,
    `totalGutters = ${totalGutters}`
  ];
  drawStatsPanel(host, size.width - 12, 12, lines);
}

// ─── helpers ─────────────────────────────────────────────────────────

function debugLabel(
  x: number,
  y: number,
  text: string,
  color: string,
  anchor: "start" | "middle" | "end" = "start"
): SVGTextElement {
  return svg("text", {
    x, y,
    fill: color,
    "font-family": "ui-monospace, Menlo, Consolas, monospace",
    "font-size": 10,
    "font-weight": 600,
    "text-anchor": anchor
  }, [text]);
}

function debugBadge(
  x: number,
  y: number,
  text: string,
  color: string
): SVGGElement {
  const g = svg("g");
  const charW = 6.6;
  const w = text.length * charW + 16;
  g.appendChild(svg("rect", {
    x: x + 4, y: y - 14,
    width: w, height: 20, rx: 3,
    fill: color
  }));
  g.appendChild(svg("text", {
    x: x + 12, y: y,
    fill: "#fff",
    "font-family": "ui-monospace, Menlo, Consolas, monospace",
    "font-size": 11,
    "font-weight": 700
  }, [text]));
  return g;
}

function drawStatsPanel(
  host: SVGElement,
  rightX: number,
  topY: number,
  lines: string[]
): void {
  const lineH = 14;
  const charW = 6.6;
  const padX = 10;
  const padY = 8;
  const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
  const w = longest * charW + padX * 2;
  const h = lines.length * lineH + padY * 2;
  const x = rightX - w;
  const y = topY;

  host.appendChild(svg("rect", {
    x, y, width: w, height: h, rx: 4,
    fill: "rgba(20,20,24,0.94)",
    stroke: "rgba(255,255,255,0.18)",
    "stroke-width": 1
  }));

  for (let i = 0; i < lines.length; i++) {
    host.appendChild(svg("text", {
      x: x + padX,
      y: y + padY + (i + 1) * lineH - 4,
      fill: lines[i].includes("\u2190") ? "rgba(234,88,12,1)" : "#f4f4f5",
      "font-family": "ui-monospace, Menlo, Consolas, monospace",
      "font-size": 11
    }, [lines[i]]));
  }
}
