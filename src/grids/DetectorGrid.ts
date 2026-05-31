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
 * padding, and child item bounds.
 *
 * Drives off four options:
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

  // Always install the diagonal-stripe pattern used for gap fills.
  installPatterns(host);

  const collectResult = collectGrids(options);
  const { grids, summary } = collectResult;

  if (grids.length === 0) {
    drawEmptyState(host, options, summary);
    return;
  }

  // Sort by area descending so larger containers draw first and
  // smaller ones (which usually nest inside) stay on top + visible.
  const sorted = [...grids].sort((a, b) =>
    (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height)
  );

  for (const g of sorted) {
    drawDetectedGrid(host, g, options);
  }

  drawHeaderBadge(host, grids.length, summary);
};

interface CollectResult {
  grids: DetectedGrid[];
  summary: {
    targetMatched: number;     // # elements selector matched
    targetIneligible: number;  // # of those that weren't grid/flex
    autoScanned: boolean;
  };
}

function collectGrids(options: ResolvedOptions): CollectResult {
  const target = (options.detectorTarget ?? "").trim();
  const summary = { targetMatched: 0, targetIneligible: 0, autoScanned: false };

  if (target) {
    const els = resolveTargets(target);
    summary.targetMatched = els.length;
    const out: DetectedGrid[] = [];
    for (const el of els) {
      const d = detectGrid(el);
      if (d) out.push(d);
      else summary.targetIneligible++;
    }
    return { grids: out, summary };
  }

  if (options.detectorAutoScan) {
    summary.autoScanned = true;
    return { grids: detectAllGrids(), summary };
  }

  return { grids: [], summary };
}

// ─── SVG patterns (defs) ────────────────────────────────────────────

const PATTERN_ID = "gridly-detector-stripe";

/**
 * Install a reusable diagonal-stripe <pattern> in <defs> for gap fills.
 * Theme-independent visibility so gaps are obvious in light + dark.
 *
 * Re-runs on every draw because Overlay.clearChildren wipes <defs>;
 * the early-return guard makes this a no-op when already present.
 */
function installPatterns(host: SVGElement): void {
  // host is always the root <svg> in the detector branch (Overlay.draw
  // passes this.surface directly, not a translated <g>).
  const surface = host as SVGSVGElement;

  if (surface.querySelector(`#${PATTERN_ID}`)) return;

  const defs = svg("defs");
  const pattern = svg("pattern", {
    id: PATTERN_ID,
    patternUnits: "userSpaceOnUse",
    width: 8,
    height: 8,
    patternTransform: "rotate(45)"
  });
  pattern.appendChild(svg("rect", {
    x: 0, y: 0, width: 8, height: 8,
    fill: "transparent"
  }));
  pattern.appendChild(svg("line", {
    x1: 0, y1: 0, x2: 0, y2: 8,
    stroke: "var(--gridly-ink-bold, rgba(220,38,38,0.45))",
    "stroke-width": 3
  }));
  defs.appendChild(pattern);
  surface.insertBefore(defs, surface.firstChild);
}

// ─── Per-grid rendering ─────────────────────────────────────────────

function drawDetectedGrid(
  host: SVGElement,
  g: DetectedGrid,
  options: ResolvedOptions
): void {
  const { rect } = g;
  const isFlex = g.display === "flex" || g.display === "inline-flex";

  // 1. Tinted background fill of the container so it stands out
  host.appendChild(svg("rect", {
    x: rect.x, y: rect.y, width: rect.width, height: rect.height,
    fill: isFlex
      ? "var(--gridly-ink, rgba(220,38,38,0.08))"
      : "var(--gridly-ink, rgba(220,38,38,0.10))",
    opacity: 0.45
  }));

  // 2. Bold container outline
  host.appendChild(svg("rect", {
    x: rect.x, y: rect.y, width: rect.width, height: rect.height,
    fill: "none",
    stroke: "var(--gridly-accent, rgba(220,38,38,0.85))",
    "stroke-width": 2
  }));

  // 3. Padding inset (solid line, more visible than dashed)
  if (g.padding.left || g.padding.top || g.padding.right || g.padding.bottom) {
    host.appendChild(svg("rect", {
      x: rect.x + g.padding.left,
      y: rect.y + g.padding.top,
      width:  Math.max(0, rect.width  - g.padding.left - g.padding.right),
      height: Math.max(0, rect.height - g.padding.top  - g.padding.bottom),
      fill: "none",
      stroke: "var(--gridly-ink-bold, rgba(220,38,38,0.45))",
      "stroke-width": 1,
      "stroke-dasharray": "5 5",
      opacity: 0.85
    }));
  }

  if (g.display === "grid" || g.display === "inline-grid") {
    drawGridTracks(host, g);
  } else {
    drawFlexAxes(host, g);
  }

  // 4. Item bounds
  if (options.detectorShowItems) {
    for (const item of g.items) {
      host.appendChild(svg("rect", {
        x: item.rect.x, y: item.rect.y,
        width: item.width, height: item.height,
        fill: "none",
        stroke: "var(--gridly-accent, rgba(220,38,38,0.85))",
        "stroke-width": 1.25,
        "stroke-dasharray": "3 3",
        opacity: 0.7
      }));
    }
  }

  // 5. Label badge
  if (options.detectorShowLabels) {
    drawLabelBadge(host, g);
  }
}

function drawGridTracks(host: SVGElement, g: DetectedGrid): void {
  const { rect, colSizes = [], rowSizes = [], colGap, rowGap, padding } = g;

  const innerLeft = rect.x + padding.left;
  const innerTop  = rect.y + padding.top;
  const innerRight = rect.x + rect.width - padding.right;
  const innerBottom = rect.y + rect.height - padding.bottom;

  // --- Vertical: outline each column + stripe gaps ---
  let cursorX = innerLeft;
  for (let i = 0; i < colSizes.length; i++) {
    const w = colSizes[i];
    if (w <= 0) continue;

    // Column outline (subtle)
    host.appendChild(svg("rect", {
      x: cursorX, y: innerTop, width: w, height: innerBottom - innerTop,
      fill: "none",
      stroke: "var(--gridly-ink-bold, rgba(220,38,38,0.45))",
      "stroke-width": 1
    }));

    // Gap fill (diagonal stripe pattern) between this and previous col
    if (i > 0 && colGap > 0) {
      host.appendChild(svg("rect", {
        x: cursorX - colGap,
        y: innerTop,
        width: colGap,
        height: innerBottom - innerTop,
        fill: `url(#${PATTERN_ID})`,
        opacity: 0.55
      }));
    }

    cursorX += w + (i < colSizes.length - 1 ? colGap : 0);
  }

  // --- Horizontal: outline each row + stripe row gaps ---
  let cursorY = innerTop;
  for (let i = 0; i < rowSizes.length; i++) {
    const h = rowSizes[i];
    if (h <= 0) continue;

    host.appendChild(svg("rect", {
      x: innerLeft, y: cursorY,
      width: innerRight - innerLeft, height: h,
      fill: "none",
      stroke: "var(--gridly-ink-bold, rgba(220,38,38,0.45))",
      "stroke-width": 1
    }));

    if (i > 0 && rowGap > 0) {
      host.appendChild(svg("rect", {
        x: innerLeft, y: cursorY - rowGap,
        width: innerRight - innerLeft, height: rowGap,
        fill: `url(#${PATTERN_ID})`,
        opacity: 0.55
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

  // Main axis arrow line
  if (isRow) {
    host.appendChild(svg("line", {
      x1: rect.x + padding.left + 6,
      x2: rect.x + rect.width - padding.right - 6,
      y1: cy, y2: cy,
      stroke: "var(--gridly-accent, rgba(220,38,38,0.85))",
      "stroke-width": 1.5,
      "stroke-dasharray": "8 4"
    }));
  } else {
    host.appendChild(svg("line", {
      y1: rect.y + padding.top + 6,
      y2: rect.y + rect.height - padding.bottom - 6,
      x1: cx, x2: cx,
      stroke: "var(--gridly-accent, rgba(220,38,38,0.85))",
      "stroke-width": 1.5,
      "stroke-dasharray": "8 4"
    }));
  }

  // Cross axis (lighter)
  if (isRow) {
    host.appendChild(svg("line", {
      x1: cx, x2: cx,
      y1: rect.y + padding.top + 6,
      y2: rect.y + rect.height - padding.bottom - 6,
      stroke: "var(--gridly-ink-bold, rgba(220,38,38,0.45))",
      "stroke-width": 1,
      "stroke-dasharray": "3 6"
    }));
  } else {
    host.appendChild(svg("line", {
      y1: cy, y2: cy,
      x1: rect.x + padding.left + 6,
      x2: rect.x + rect.width - padding.right - 6,
      stroke: "var(--gridly-ink-bold, rgba(220,38,38,0.45))",
      "stroke-width": 1,
      "stroke-dasharray": "3 6"
    }));
  }
}

// ─── Labels ─────────────────────────────────────────────────────────

function drawLabelBadge(host: SVGElement, g: DetectedGrid): void {
  const text = formatLabel(g);
  const charW = 6.6;
  const padX = 8;
  const measured = text.length * charW + padX * 2;
  const labelWidth = Math.min(measured, Math.max(80, g.rect.width - 4));

  // Try to position the badge ABOVE the container (so it doesn't
  // cover the content). Fall back to the inside-top-left when there's
  // no room above (e.g., grid is at the very top of the viewport).
  let x = g.rect.x;
  let y = g.rect.y - 22;
  if (y < 4) {
    y = g.rect.y + 4;
    x = g.rect.x + 4;
  }

  host.appendChild(svg("rect", {
    x, y, width: labelWidth, height: 20, rx: 3,
    fill: "var(--gridly-accent, rgba(220,38,38,0.85))"
  }));
  host.appendChild(svg("text", {
    x: x + padX, y: y + 14,
    fill: "#fff",
    "font-family": "ui-monospace, Menlo, Consolas, monospace",
    "font-size": 10,
    "font-weight": 700
  }, [text]));
}

function formatLabel(g: DetectedGrid): string {
  const sel = truncate(g.selector, 28);
  if (g.display === "grid" || g.display === "inline-grid") {
    return `GRID  ${g.columns ?? 0}\u00d7${g.rows ?? 0}  gap ${g.colGap}/${g.rowGap}  ${sel}`;
  }
  const dir = (g.flexDirection ?? "row").replace("-reverse", "\u00ab");
  const justify = (g.justifyContent ?? "normal").replace(/^space-/, "s-");
  return `FLEX  ${dir}  ${justify}  gap ${g.colGap || g.rowGap}  ${sel}`;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "\u2026";
}

// ─── Header / empty state ───────────────────────────────────────────

function drawHeaderBadge(
  host: SVGElement,
  count: number,
  summary: CollectResult["summary"]
): void {
  const parts: string[] = [`detector \u00b7 ${count} grid${count === 1 ? "" : "s"}`];
  if (summary.autoScanned) parts.push("auto-scan");
  if (summary.targetMatched > 0) {
    parts.push(`target matched ${summary.targetMatched}`);
    if (summary.targetIneligible > 0) {
      parts.push(`${summary.targetIneligible} not grid/flex`);
    }
  }
  const text = parts.join(" \u00b7 ");
  const viewportW = (typeof document !== "undefined")
    ? document.documentElement.clientWidth
    : window.innerWidth;
  const w = Math.min(viewportW - 24, text.length * 7 + 24);

  host.appendChild(svg("rect", {
    x: 12, y: 12, width: w, height: 24, rx: 4,
    fill: "rgba(20,20,24,0.92)"
  }));
  host.appendChild(svg("text", {
    x: 22, y: 28,
    fill: "#f4f4f5",
    "font-family": "ui-monospace, Menlo, Consolas, monospace",
    "font-size": 11,
    "font-weight": 700
  }, [text]));
}

function drawEmptyState(
  host: SVGElement,
  options: ResolvedOptions,
  summary: CollectResult["summary"]
): void {
  const target = (options.detectorTarget ?? "").trim();
  let msg: string;
  if (target && summary.targetMatched > 0 && summary.targetIneligible > 0) {
    msg = `detector: "${target}" matched ${summary.targetMatched} element(s), but none use display: grid or flex`;
  } else if (target) {
    msg = `detector: no element matched "${target}"`;
  } else if (!options.detectorAutoScan) {
    msg = `detector: scan disabled - set a Target or enable Auto-scan`;
  } else {
    msg = `detector: no grid/flex containers on this page`;
  }

  const viewportW = (typeof document !== "undefined")
    ? document.documentElement.clientWidth
    : window.innerWidth;
  const w = Math.min(viewportW - 24, msg.length * 7 + 24);

  host.appendChild(svg("rect", {
    x: 12, y: 12, width: w, height: 24, rx: 4,
    fill: "rgba(20,20,24,0.92)"
  }));
  host.appendChild(svg("text", {
    x: 22, y: 28,
    fill: "#f4f4f5",
    "font-family": "ui-monospace, Menlo, Consolas, monospace",
    "font-size": 11,
    "font-weight": 600
  }, [msg]));
}
