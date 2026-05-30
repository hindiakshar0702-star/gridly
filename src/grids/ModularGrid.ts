import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";
import { computeBox } from "./ColumnGrid";

/**
 * Modular grid: columns + rows together (magazine style).
 * Honors marginLeft / marginRight / maxWidth like the column grid.
 */
export const renderModularGrid: GridRenderer = (host, options, size) => {
  const { columns, gutter, rows, showNumbers, showColumnNumbers } = options;
  const { startX, contentWidth } = computeBox(options, size.width);

  const safeCols = Math.max(1, columns);
  const safeRows = Math.max(1, rows);

  const totalGutters = gutter * Math.max(0, safeCols - 1);
  const colW = Math.max(0, (contentWidth - totalGutters) / safeCols);

  // Vertical: use a symmetric vertical margin equal to options.margin
  // (could add marginTop/marginBottom in a future patch).
  const vMargin = options.margin;
  const rowGutter = gutter;
  const totalRowGutters = rowGutter * Math.max(0, safeRows - 1);
  const usableHeight = Math.max(0, size.height - vMargin * 2);
  const rowH = Math.max(0, (usableHeight - totalRowGutters) / safeRows);
  const startY = vMargin;

  // Skip if layout is degenerate
  if (contentWidth <= 0 || colW <= 0 || rowH <= 0) return;

  for (let r = 0; r < safeRows; r++) {
    for (let c = 0; c < safeCols; c++) {
      const x = startX + c * (colW + gutter);
      const y = startY + r * (rowH + rowGutter);
      host.appendChild(svg("rect", {
        x, y, width: colW, height: rowH,
        class: "gridly-column-fill"
      }));
      if ((showNumbers || showColumnNumbers) && c === 0) {
        host.appendChild(svg("text", {
          x: startX - 12,
          y: y + rowH / 2 + 4,
          "text-anchor": "end",
          class: "gridly-label"
        }, [String(r + 1)]));
      }
    }
  }
};
