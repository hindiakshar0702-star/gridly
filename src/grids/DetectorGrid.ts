import type { GridRenderer, ResolvedOptions } from "../types";
import { svg } from "../utils/createElement";
import {
  detectAllGrids,
  detectGrid,
  resolveTargets,
  type DetectedGrid
} from "../core/GridDetector";

/**
 * Detector grid: scans the page for `display: grid` / `flex`
 * containers and overlays their actual track lines, gaps,
 * and child item bounds.
 *
 * Drives off three options:
 *   - detectorTarget       (selector string; comma-separated OK)
 *   - detectorAutoScan     (when target is empty, scan whole document)
 *   - detectorShowLabels   (label badges on each detection)
 *   - detectorShowItems    (draw the actual child <items>)
 *
 * Note: this renderer reads the CURRENT DOM positions of elements,
 * so it does not respect device-simulator translation. The Overlay
 * special-cases this in its `draw()` method to bypass the sim group.
 */
export const renderDetectorGrid: GridRenderer = (host, options, _size) => {
  if (typeof window === "undefined") return;

  const grids = collectGrids(options);
  if (grids.length === 0) {
    drawEmptyState(host, options);
    return;
  }

  for (const g of grids) {
    drawDetectedGrid(host, g, options);
  }

  drawHeaderBadge(host, grids.length);
};

function collectGrids(options: ResolvedOptions): DetectedGrid[] {
  const target = (options.detectorTarget ?? "").trim();
  if (target) {
    const els = resolveTargets(target);
    const out: DetectedGrid[] = [];
    for (const el of els) {
      const d = detectGrid(el);
      if (d) out.push(d);
    }
    return out;
  }
  if (options.detectorAutoScan) {
    return detectAllGrids();
  }
  return [];
}

function drawDetectedGrid(
  host: SVGElement,
  g: DetectedGrid,
  options: ResolvedOptions
): void {
  const { rect } = g;

  // 1. Container bounding box (accent color)
  host.appendChild(svg("rect", {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    fill: "none",
    class: "gridly-line--accent",
    "stroke-width": 1.5
  }));

  // 2. Padding inset (dashed line)
  if (g.padding.left || g.padding.top || g.padding.right || g.padding.bottom) {
    host.appendChild(svg("rect", {
      x: rect.x + g.padding.left,
      y: rect.y + g.padding.top,
      width:  Math.max(0, rect.width  - g.padding.left - g.padding.right),
      height: Math.max(0, rect.height - g.padding.top  - g.padding.bottom),
      fill: "none",
      class: "gridly-line",
      "stroke-dasharray": "4 4"
    }));
  }

  if (g.display === "grid" || g.display === "inline-grid") {
    drawGridTracks(host, g);
  } else {
    drawFlexAxes(host, g);
  }

  // 3. Item bounds
  if (options.detectorShowItems) {
    for (const item of g.items) {
      host.appendChild(svg("rect", {
        x: item.rect.x,
        y: item.rect.y,
        width: item.width,
        height: item.height,
        fill: "var(--gridly-ink, rgba(220,38,38,0.08))",
        stroke: "var(--gridly-ink-bold)",
        "stroke-width": 0.75,
        "stroke-dasharray": "2 3"
      }));
    }
  }

  // 4. Label badge
  if (options.detectorShowLabels) {
    drawLabelBadge(host, g);
  }
}

function drawGridTracks(host: SVGElement, g: DetectedGrid): void {
  const { rect, colSizes = [], rowSizes = [], colGap, rowGap, padding } = g;

  const innerLeft   = rect.x + padding.left;
  const innerTop    = rect.y + padding.top;
  const innerRight  = rect.x + rect.width  - padding.right;
  const innerBottom = rect.y + rect.height - padding.bottom;

  // Vertical lines between columns
  let cursorX = innerLeft;
  for (let i = 0; i < colSizes.length; i++) {
    const w = colSizes[i];
    if (i > 0) {
      // Gap fill rect (subtle)
      if (colGap > 0) {
        host.appendChild(svg("rect", {
          x: cursorX - colGap,
          y: innerTop,
          width: colGap,
          height: innerBottom - innerTop,
          fill: "var(--gridly-ink-bold)",
          opacity: 0.18
        }));
      }
      // Track-start line
      host.appendChild(svg("line", {
        x1: cursorX, y1: innerTop, x2: cursorX, y2: innerBottom,
        class: "gridly-line--bold"
      }));
    }
    cursorX += w + (i < colSizes.length - 1 ? colGap : 0);
  }

  // Horizontal lines between rows
  let cursorY = innerTop;
  for (let i = 0; i < rowSizes.length; i++) {
    const h = rowSizes[i];
    if (i > 0) {
      if (rowGap > 0) {
        host.appendChild(svg("rect", {
          x: innerLeft,
          y: cursorY - rowGap,
          width: innerRight - innerLeft,
          height: rowGap,
          fill: "var(--gridly-ink-bold)",
          opacity: 0.18
        }));
      }
      host.appendChild(svg("line", {
        x1: innerLeft, y1: cursorY, x2: innerRight, y2: cursorY,
        class: "gridly-line--bold"
      }));
    }
    cursorY += h + (i < rowSizes.length - 1 ? rowGap : 0);
  }
}

function drawFlexAxes(host: SVGElement, g: DetectedGrid): void {
  const { rect, padding, flexDirection } = g;
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;

  const isRow = !flexDirection || /^row/.test(flexDirection);

  // Main axis
  if (isRow) {
    host.appendChild(svg("line", {
      x1: rect.x + padding.left,
      x2: rect.x + rect.width - padding.right,
      y1: cy, y2: cy,
      class: "gridly-line--bold",
      "stroke-dasharray": "6 4"
    }));
  } else {
    host.appendChild(svg("line", {
      y1: rect.y + padding.top,
      y2: rect.y + rect.height - padding.bottom,
      x1: cx, x2: cx,
      class: "gridly-line--bold",
      "stroke-dasharray": "6 4"
    }));
  }

  // Cross axis (lighter)
  if (isRow) {
    host.appendChild(svg("line", {
      x1: cx, x2: cx,
      y1: rect.y + padding.top,
      y2: rect.y + rect.height - padding.bottom,
      class: "gridly-line",
      "stroke-dasharray": "2 6"
    }));
  } else {
    host.appendChild(svg("line", {
      y1: cy, y2: cy,
      x1: rect.x + padding.left,
      x2: rect.x + rect.width - padding.right,
      class: "gridly-line",
      "stroke-dasharray": "2 6"
    }));
  }
}

function drawLabelBadge(host: SVGElement, g: DetectedGrid): void {
  const text = formatLabel(g);
  const x = g.rect.x + 4;
  const y = g.rect.y + 4;

  // Approximate text width (monospace 11px ≈ 6.5 px per char) + padding
  const labelWidth = Math.min(
    Math.max(60, text.length * 6.6 + 12),
    Math.max(40, g.rect.width - 8)
  );

  host.appendChild(svg("rect", {
    x, y, width: labelWidth, height: 18, rx: 3,
    fill: "var(--gridly-accent, rgba(220,38,38,0.85))"
  }));
  host.appendChild(svg("text", {
    x: x + 6, y: y + 13,
    fill: "#fff",
    "font-family": "ui-monospace, Menlo, Consolas, monospace",
    "font-size": 10,
    "font-weight": 600
  }, [text]));
}

function formatLabel(g: DetectedGrid): string {
  if (g.display === "grid" || g.display === "inline-grid") {
    return `GRID  ${g.columns ?? 0}\u00d7${g.rows ?? 0}  gap ${g.colGap}/${g.rowGap}`;
  }
  const dir = (g.flexDirection ?? "row").replace("-reverse", "\u00ab");
  const justify = (g.justifyContent ?? "normal").replace(/^space-/, "s-");
  return `FLEX  ${dir}  ${justify}  gap ${g.colGap || g.rowGap}`;
}

function drawHeaderBadge(host: SVGElement, count: number): void {
  host.appendChild(svg("rect", {
    x: 12, y: 12, width: 220, height: 22, rx: 4,
    class: "gridly-fill--bold"
  }));
  host.appendChild(svg("text", {
    x: 18, y: 28,
    class: "gridly-label",
    style: "fill:#fff;font-weight:700"
  }, [`detector \u00b7 ${count} grid${count === 1 ? "" : "s"} found`]));
}

function drawEmptyState(host: SVGElement, options: ResolvedOptions): void {
  const w = window.innerWidth;
  const target = (options.detectorTarget ?? "").trim();
  const msg = target
    ? `detector: no element matched "${target}"`
    : `detector: scan disabled (set a target or enable Auto-scan)`;

  host.appendChild(svg("rect", {
    x: 12, y: 12, width: Math.min(w - 24, msg.length * 7 + 16), height: 22, rx: 4,
    class: "gridly-fill--bold"
  }));
  host.appendChild(svg("text", {
    x: 18, y: 28,
    class: "gridly-label",
    style: "fill:#fff;font-weight:600"
  }, [msg]));
}
