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

  const totalGutters = gutter * Math.max(0, columns - 1);
  const colW = (contentWidth - totalGutters) / columns;

  // Vertical: use a symmetric vertical margin equal to options.margin
  // (for now — could add marginTop/marginBottom in a future patch).
  const vMargin = options.margin;
  const rowGutter = gutter;
  const totalRowGutters = rowGutter * Math.max(0, rows - 1);
  const usableHeight = Math.max(0, size.height - vMargin * 2);
  const rowH = (usableHeight - totalRowGutters) / rows;
  const startY = vMargin;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
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
