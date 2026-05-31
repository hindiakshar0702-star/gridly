import type { GridRenderer, ResolvedOptions } from "../types";
import { svg } from "../utils/createElement";

/**
 * ┌─ Constraint-based layout system (v0.3) ────────────────────────┐
 * │                                                                 │
 * │  containerX     = leftMargin                          (always)  │
 * │  containerWidth = viewportWidth - leftMargin - rightMargin      │
 * │  totalGutters   = (columns - 1) * gutter                        │
 * │  columnWidth    = (containerWidth - totalGutters) / columns     │
 * │  columnX(i)     = containerX + i * (columnWidth + gutter)       │
 * │                                                                 │
 * │  Invariants:                                                    │
 * │    1. The grid origin is always equal to leftMargin.            │
 * │    2. Changing rightMargin only changes containerWidth.         │
 * │    3. Changing gutter only changes columnWidth + spacing.       │
 * │    4. Changing column count never moves the origin.             │
 * │    5. NO auto-centering, NO viewportWidth/2 offsets.            │
 * │                                                                 │
 * │  maxWidth (when set) caps containerWidth from the right side,   │
 * │  i.e. trims the right edge inward — it does NOT recenter.       │
 * │                                                                 │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * If a centered container is desired, set leftMargin and rightMargin
 * yourself — e.g. (viewportWidth - 1200) / 2 on each side. This is
 * a deliberate tradeoff: predictable behavior over implicit centering.
 */
export const renderColumnGrid: GridRenderer = (host, options, size) => {
  drawColumns(host, options, size, options.columns);
};

/**
 * Container grid: visualizes the container box with side margins.
 */
export const renderContainerGrid: GridRenderer = (host, options, size) => {
  const { containerX, containerWidth } = computeBox(options, size.width);

  // Left-side margin fill
  if (containerX > 0) {
    host.appendChild(svg("rect", {
      x: 0, y: 0, width: containerX, height: size.height,
      class: "gridly-fill"
    }));
  }
  // Right-side margin fill (everything past containerX + containerWidth)
  const rightStart = containerX + containerWidth;
  if (rightStart < size.width) {
    host.appendChild(svg("rect", {
      x: rightStart, y: 0,
      width: size.width - rightStart, height: size.height,
      class: "gridly-fill"
    }));
  }

  // Container outline
  host.appendChild(svg("rect", {
    x: containerX, y: 0, width: containerWidth, height: size.height,
    fill: "none", class: "gridly-line--accent"
  }));

  // Center line of the *container area*
  host.appendChild(svg("line", {
    x1: containerX + containerWidth / 2, y1: 0,
    x2: containerX + containerWidth / 2, y2: size.height,
    class: "gridly-line"
  }));

  if (options.showColumnNumbers) {
    host.appendChild(svg("text", {
      x: containerX + 6, y: 16, class: "gridly-label"
    }, [`width=${containerWidth.toFixed(0)}px  ml=${options.marginLeft}  mr=${options.marginRight}`]));
  }
};

/**
 * Bootstrap-style 12-column grid: uses the constraint-based system
 * with explicit margins computed from the active Bootstrap breakpoint.
 *
 * To preserve Bootstrap's centered-container UX, this grid type
 * computes equal left/right margins from the breakpoint container
 * width. This is opt-in *via this grid type*; it does NOT recenter
 * anything in the generic columns / responsive / modular grids.
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

  // For Bootstrap specifically, override marginLeft/Right so the
  // overlay centers like a real Bootstrap container would.
  const customized: ResolvedOptions = {
    ...options,
    columns: 12,
    gutter: 24,
    marginLeft: sideMargin,
    marginRight: sideMargin,
    maxWidth: 0   // already constrained by the explicit margins
  };
  drawColumns(host, customized, size, 12);

  // Breakpoint badge
  host.appendChild(svg("rect", {
    x: 12, y: 12, width: 230, height: 22, rx: 4,
    class: "gridly-fill--bold"
  }));
  host.appendChild(svg("text", {
    x: 18, y: 28, class: "gridly-label",
    style: "fill:#fff;font-weight:600"
  }, [`bootstrap \u00b7 ${active.name} \u00b7 ${contentWidth.toFixed(0)}px`]));
};

/**
 * Compute the container box using the constraint-based formulas
 * documented at the top of the file.
 *
 *   containerX     = leftMargin                          (NEVER centered)
 *   containerWidth = max(0, viewportWidth - leftMargin - rightMargin)
 *   if maxWidth > 0: containerWidth = min(containerWidth, maxWidth)
 *
 * Note: maxWidth caps the right edge inward — it does NOT recenter
 * the container. To get a centered look, set marginLeft and
 * marginRight to equal explicit values.
 */
export function computeBox(
  options: ResolvedOptions,
  viewportWidth: number
): { containerX: number; containerWidth: number } {
  const { marginLeft, marginRight, maxWidth } = options;

  // Invariant 1: containerX = leftMargin, ALWAYS.
  const containerX = marginLeft;

  // Invariant 2: containerWidth = viewport - leftMargin - rightMargin,
  // optionally capped by maxWidth from the RIGHT side (no recenter).
  let containerWidth = Math.max(0, viewportWidth - marginLeft - marginRight);
  if (maxWidth > 0 && maxWidth < containerWidth) {
    containerWidth = maxWidth;
  }

  return { containerX, containerWidth };
}

/**
 * Shared helper used by columns / responsive / bootstrap.
 *
 * Implements the constraint formulas:
 *   totalGutters = (columns - 1) * gutter
 *   columnWidth  = (containerWidth - totalGutters) / columns
 *   columnX(i)   = containerX + i * (columnWidth + gutter)
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

  const { containerX, containerWidth } = computeBox(options, size.width);
  const safeColumnCount = Math.max(1, columnCount);
  const totalGutters = gutter * Math.max(0, safeColumnCount - 1);
  const columnWidth = Math.max(0, (containerWidth - totalGutters) / safeColumnCount);

  // Skip drawing entirely if the content box would be invalid (e.g.
  // marginLeft + marginRight > viewport).
  if (containerWidth <= 0 || columnWidth <= 0) return;

  // --- Margin fills (left + right) ------------------------------------
  if (containerX > 0) {
    host.appendChild(svg("rect", {
      x: 0, y: 0, width: containerX, height: size.height,
      class: "gridly-fill"
    }));
  }
  const rightMarginX = containerX + containerWidth;
  if (rightMarginX < size.width) {
    host.appendChild(svg("rect", {
      x: rightMarginX, y: 0,
      width: size.width - rightMarginX, height: size.height,
      class: "gridly-fill"
    }));
  }

  // --- Column blocks ---------------------------------------------------
  for (let i = 0; i < safeColumnCount; i++) {
    // Constraint: columnX(i) = containerX + i * (columnWidth + gutter)
    const x = containerX + i * (columnWidth + gutter);
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
    for (let i = 0; i < safeColumnCount - 1; i++) {
      const x = containerX + i * (columnWidth + gutter) + columnWidth;
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
