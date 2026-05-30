import type { GridRenderer, ResolvedOptions } from "../types";
import { svg } from "../utils/createElement";

/**
 * Column grid: classic N-column overlay with gutters.
 * Honors maxWidth + margin to center content.
 */
export const renderColumnGrid: GridRenderer = (host, options, size) => {
  drawColumns(host, options, size, options.columns);
};

/**
 * Container grid: max-width visualization with margins.
 */
export const renderContainerGrid: GridRenderer = (host, options, size) => {
  const { maxWidth, margin } = options;
  const contentWidth = maxWidth > 0
    ? Math.min(maxWidth, size.width - margin * 2)
    : size.width - margin * 2;

  const x = (size.width - contentWidth) / 2;

  // Outer margins
  host.appendChild(svg("rect", {
    x: 0, y: 0, width: x, height: size.height,
    class: "gridly-fill"
  }));
  host.appendChild(svg("rect", {
    x: x + contentWidth, y: 0, width: size.width - (x + contentWidth), height: size.height,
    class: "gridly-fill"
  }));

  // Content boundary
  host.appendChild(svg("rect", {
    x, y: 0, width: contentWidth, height: size.height,
    fill: "none",
    class: "gridly-line--accent"
  }));

  // Center line
  host.appendChild(svg("line", {
    x1: size.width / 2, y1: 0,
    x2: size.width / 2, y2: size.height,
    class: "gridly-line"
  }));
};

/**
 * Shared helper used by columns + responsive.
 */
export function drawColumns(
  host: SVGSVGElement,
  options: ResolvedOptions,
  size: { width: number; height: number },
  columnCount: number
): void {
  const { gutter, margin, maxWidth, showNumbers } = options;
  const contentWidth = maxWidth > 0
    ? Math.min(maxWidth, size.width - margin * 2)
    : size.width - margin * 2;

  const totalGutters = gutter * (columnCount - 1);
  const columnWidth = (contentWidth - totalGutters) / columnCount;
  const startX = (size.width - contentWidth) / 2;

  // Outside margins (subtle fill)
  host.appendChild(svg("rect", {
    x: 0, y: 0, width: startX, height: size.height,
    class: "gridly-fill"
  }));
  host.appendChild(svg("rect", {
    x: startX + contentWidth, y: 0,
    width: size.width - (startX + contentWidth), height: size.height,
    class: "gridly-fill"
  }));

  for (let i = 0; i < columnCount; i++) {
    const x = startX + i * (columnWidth + gutter);
    host.appendChild(svg("rect", {
      x, y: 0, width: columnWidth, height: size.height,
      class: "gridly-column-fill"
    }));

    if (showNumbers) {
      host.appendChild(svg("text", {
        x: x + columnWidth / 2,
        y: 18,
        "text-anchor": "middle",
        class: "gridly-label"
      }, [String(i + 1)]));
    }
  }
}
