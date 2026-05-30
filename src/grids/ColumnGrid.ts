import type { GridRenderer, ResolvedOptions } from "../types";
import { svg } from "../utils/createElement";

/**
 * Column grid: classic N-column overlay with gutters.
 * Honors maxWidth + asymmetric marginLeft/marginRight.
 */
export const renderColumnGrid: GridRenderer = (host, options, size) => {
  drawColumns(host, options, size, options.columns);
};

/**
 * Container grid: max-width visualization with margins.
 */
export const renderContainerGrid: GridRenderer = (host, options, size) => {
  const { maxWidth, marginLeft, marginRight } = options;
  const usableWidth = size.width - marginLeft - marginRight;
  const contentWidth = maxWidth > 0
    ? Math.min(maxWidth, usableWidth)
    : usableWidth;

  const startX = marginLeft + (usableWidth - contentWidth) / 2;

  // Outer margins (subtle fill)
  host.appendChild(svg("rect", {
    x: 0, y: 0, width: startX, height: size.height,
    class: "gridly-fill"
  }));
  host.appendChild(svg("rect", {
    x: startX + contentWidth, y: 0,
    width: size.width - (startX + contentWidth), height: size.height,
    class: "gridly-fill"
  }));

  // Content boundary
  host.appendChild(svg("rect", {
    x: startX, y: 0, width: contentWidth, height: size.height,
    fill: "none", class: "gridly-line--accent"
  }));

  // Center line
  host.appendChild(svg("line", {
    x1: size.width / 2, y1: 0,
    x2: size.width / 2, y2: size.height,
    class: "gridly-line"
  }));

  if (options.showColumnNumbers) {
    host.appendChild(svg("text", {
      x: startX + 6, y: 16, class: "gridly-label"
    }, [`maxWidth_${contentWidth.toFixed(0)}px`]));
  }
};

/**
 * Bootstrap-style 12-column grid: matches Bootstrap container widths
 * (576/768/992/1200/1400) with explicit gutters and breakpoint label.
 */
export const renderBootstrapGrid: GridRenderer = (host, options, size) => {
  const BOOTSTRAP = [
    { min: 1400, container: 1320, name: "xxl" },
    { min: 1200, container: 1140, name: "xl"  },
    { min: 992,  container: 960,  name: "lg"  },
    { min: 768,  container: 720,  name: "md"  },
    { min: 576,  container: 540,  name: "sm"  },
    { min: 0,    container: 0,    name: "xs"  } // fluid below sm
  ];

  let active = BOOTSTRAP[BOOTSTRAP.length - 1];
  for (const bp of BOOTSTRAP) {
    if (size.width >= bp.min) { active = bp; break; }
  }

  const contentWidth = active.container > 0
    ? Math.min(active.container, size.width - 24)
    : size.width - 24; // fluid

  const customized: ResolvedOptions = {
    ...options,
    columns: 12,
    gutter: 24,
    marginLeft: (size.width - contentWidth) / 2,
    marginRight: (size.width - contentWidth) / 2,
    maxWidth: contentWidth
  };
  drawColumns(host, customized, size, 12);

  // Breakpoint badge
  host.appendChild(svg("rect", {
    x: 12, y: 12, width: 160, height: 22, rx: 4,
    class: "gridly-fill--bold"
  }));
  host.appendChild(svg("text", {
    x: 18, y: 28, class: "gridly-label",
    style: "fill:#fff;font-weight:600"
  }, [`bootstrap \u00b7 ${active.name} \u00b7 ${contentWidth.toFixed(0)}px`]));
};

/**
 * Shared helper used by columns / responsive / bootstrap.
 *
 * Renders:
 *   1. Margin fills (left + right outside content)
 *   2. Numbered column blocks (label format: `${prefix}${index}`)
 *   3. Numbered gutter blocks  (label format: `${prefix}${index}`)
 */
export function drawColumns(
  host: SVGElement,
  options: ResolvedOptions,
  size: { width: number; height: number },
  columnCount: number
): void {
  const {
    gutter, marginLeft, marginRight, maxWidth,
    showColumnNumbers, showGutterNumbers,
    columnLabelPrefix, gutterLabelPrefix
  } = options;

  const usableWidth = size.width - marginLeft - marginRight;
  const contentWidth = maxWidth > 0
    ? Math.min(maxWidth, usableWidth)
    : usableWidth;

  const totalGutters = gutter * (columnCount - 1);
  const columnWidth = (contentWidth - totalGutters) / columnCount;
  const startX = marginLeft + (usableWidth - contentWidth) / 2;

  // --- Margin fills (left + right) ------------------------------------
  if (startX > 0) {
    host.appendChild(svg("rect", {
      x: 0, y: 0, width: startX, height: size.height,
      class: "gridly-fill"
    }));
  }
  const rightMarginX = startX + contentWidth;
  if (rightMarginX < size.width) {
    host.appendChild(svg("rect", {
      x: rightMarginX, y: 0,
      width: size.width - rightMarginX, height: size.height,
      class: "gridly-fill"
    }));
  }

  // --- Column blocks ---------------------------------------------------
  for (let i = 0; i < columnCount; i++) {
    const x = startX + i * (columnWidth + gutter);
    host.appendChild(svg("rect", {
      x, y: 0, width: columnWidth, height: size.height,
      class: "gridly-column-fill"
    }));

    if (showColumnNumbers) {
      const label = `${columnLabelPrefix}${i}`;
      host.appendChild(svg("text", {
        x: x + columnWidth / 2,
        y: 18,
        "text-anchor": "middle",
        class: "gridly-label"
      }, [label]));
      // Echo at bottom too for tall pages
      host.appendChild(svg("text", {
        x: x + columnWidth / 2,
        y: size.height - 8,
        "text-anchor": "middle",
        class: "gridly-label"
      }, [label]));
    }
  }

  // --- Gutter blocks (visualized between columns) ----------------------
  if (gutter > 0) {
    for (let i = 0; i < columnCount - 1; i++) {
      const x = startX + i * (columnWidth + gutter) + columnWidth;
      // Subtle striped pattern marker for the gutter region
      host.appendChild(svg("rect", {
        x, y: 0, width: gutter, height: size.height,
        fill: "none",
        stroke: "var(--gridly-ink-bold)",
        "stroke-dasharray": "2 4",
        "stroke-width": 1
      }));

      if (showGutterNumbers) {
        const label = `${gutterLabelPrefix}${i}`;
        host.appendChild(svg("text", {
          x: x + gutter / 2,
          y: 36,
          "text-anchor": "middle",
          class: "gridly-label",
          style: "font-size:10px"
        }, [label]));
      }
    }
  }
}
