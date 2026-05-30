import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";
import { pickBreakpoint } from "../utils/mergeOptions";
import { drawColumns } from "./ColumnGrid";

/**
 * Responsive grid: picks the active breakpoint and renders
 * column overlay using that breakpoint's column count + gutter,
 * plus a small label badge showing the breakpoint name.
 */
export const renderResponsiveGrid: GridRenderer = (host, options, size) => {
  const bp = pickBreakpoint(size.width, options.breakpoints);

  const merged = {
    ...options,
    columns: bp.columns,
    gutter: bp.gutter,
    maxWidth: bp.maxWidth ?? options.maxWidth
  };

  drawColumns(host, merged, size, bp.columns);

  // Breakpoint label
  host.appendChild(svg("rect", {
    x: 12, y: 12, width: 130, height: 22, rx: 4,
    class: "gridly-fill--bold"
  }));
  host.appendChild(svg("text", {
    x: 18, y: 28, class: "gridly-label",
    style: "fill:#fff;font-weight:600"
  }, [`${bp.name} \u00b7 ${bp.columns} cols`]));
};
