import type { GridRenderer, ResolvedOptions } from "../types";
import { svg } from "../utils/createElement";

/**
 * Column grid: classic N-column overlay with gutters.
 *
 * Positioning (matches the standard CSS container pattern):
 *   - `marginLeft` and `marginRight` = minimum page padding
 *   - `maxWidth` (when > 0) = cap; content centers in the extra space
 *   - When `maxWidth = 0`, content is fluid edge-to-edge minus margins
 *
 * Examples (viewport 1920):
 *   ml=40,  mr=40,  maxWidth=0     →  startX=40,   width=1840
 *   ml=40,  mr=40,  maxWidth=1200  →  startX=360,  width=1200  (centered)
 *   ml=240, mr=40,  maxWidth=0     →  startX=240,  width=1640  (sidebar)
 */
export const renderColumnGrid: GridRenderer = (host, options, size) => {
  drawColumns(host, options, size, options.columns);
};

/**
 * Container grid: max-width visualization with margins.
 */
export const renderContainerGrid: GridRenderer = (host, options, size) => {
  const { startX, contentWidth } = computeBox(options, size.width);

  // Outer margins (subtle fill)
  if (startX > 0) {
    host.appendChild(svg("rect", {
      x: 0, y: 0, width: startX, height: size.height,
      class: "gridly-fill"
    }));
  }
  const rightStart = startX + contentWidth;
  if (rightStart < size.width) {
    host.appendChild(svg("rect", {
      x: rightStart, y: 0,
      width: size.width - rightStart, height: size.height,
      class: "gridly-fill"
    }));
  }

  // Content boundary
  host.appendChild(svg("rect", {
    x: startX, y: 0, width: contentWidth, height: size.height,
    fill: "none", class: "gridly-line--accent"
  }));

  // Center line of the *content area* (not the viewport)
  host.appendChild(svg("line", {
    x1: startX + contentWidth / 2, y1: 0,
    x2: startX + contentWidth / 2, y2: size.height,
    class: "gridly-line"
  }));

  if (options.showColumnNumbers) {
    host.appendChild(svg("text", {
      x: startX + 6, y: 16, class: "gridly-label"
    }, [`width=${contentWidth.toFixed(0)}px  ml=${options.marginLeft}  mr=${options.marginRight}`]));
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

  const sideMargin = (size.width - contentWidth) / 2;

  // Bootstrap explicitly centers, so we override marginLeft/Right here
  // for this grid type only.
  const customized: ResolvedOptions = {
    ...options,
    columns: 12,
    gutter: 24,
    marginLeft: sideMargin,
    marginRight: sideMargin,
    maxWidth: contentWidth
  };
  drawColumns(host, customized, size, 12);

  // Breakpoint badge
  host.appendChild(svg("rect", {
    x: 12, y: 12, width: 200, height: 22, rx: 4,
    class: "gridly-fill--bold"
  }));
  host.appendChild(svg("text", {
    x: 18, y: 28, class: "gridly-label",
    style: "fill:#fff;font-weight:600"
  }, [`bootstrap \u00b7 ${active.name} \u00b7 ${contentWidth.toFixed(0)}px`]));
};

/**
 * Compute the content box (startX, width) using the strict
 * marginLeft / marginRight / maxWidth rule.
 *
 * Semantics (matches CSS `max-width: X; margin: 0 auto; padding: 0 ml/mr`):
 *
 *   1. `marginLeft` and `marginRight` act as *minimum* page padding.
 *   2. `maxWidth` (when > 0) caps the content width.
 *   3. When the viewport is wider than `maxWidth + marginLeft + marginRight`,
 *      the content is *centered* (extra space split equally on both sides).
 *   4. When `maxWidth = 0`, content is fluid and `marginLeft` is a strict
 *      left offset (useful for sidebars / asymmetric layouts).
 *
 * Examples (viewport 1920):
 *   ml=40,  mr=40,  maxWidth=0     →  startX=40,   width=1840
 *   ml=40,  mr=40,  maxWidth=1200  →  startX=360,  width=1200  (centered)
 *   ml=240, mr=40,  maxWidth=0     →  startX=240,  width=1640  (sidebar)
 *
 * Exported for reuse by ModularGrid and ResponsiveGrid.
 */
export function computeBox(
  options: ResolvedOptions,
  viewportWidth: number
): { startX: number; contentWidth: number } {
  const { marginLeft, marginRight, maxWidth } = options;
  const fluidWidth = Math.max(0, viewportWidth - marginLeft - marginRight);
  const constrained = maxWidth > 0 && maxWidth < fluidWidth;
  const contentWidth = constrained ? maxWidth : fluidWidth;
  const startX = constrained
    ? marginLeft + (fluidWidth - contentWidth) / 2
    : marginLeft;
  return { startX, contentWidth };
}

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
    gutter,
    showColumnNumbers, showGutterNumbers,
    columnLabelPrefix, gutterLabelPrefix
  } = options;

  const { startX, contentWidth } = computeBox(options, size.width);
  const totalGutters = gutter * Math.max(0, columnCount - 1);
  const columnWidth = (contentWidth - totalGutters) / columnCount;

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
