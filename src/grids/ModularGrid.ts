import type { GridRenderer } from "../types";
import { svg } from "../utils/createElement";

/**
 * Modular grid: columns + rows together (magazine style).
 */
export const renderModularGrid: GridRenderer = (host, options, size) => {
  const { columns, gutter, margin, maxWidth, rows, showNumbers } = options;
  const contentWidth = maxWidth > 0
    ? Math.min(maxWidth, size.width - margin * 2)
    : size.width - margin * 2;

  const totalGutters = gutter * (columns - 1);
  const colW = (contentWidth - totalGutters) / columns;
  const startX = (size.width - contentWidth) / 2;

  const rowGutter = gutter;
  const totalRowGutters = rowGutter * (rows - 1);
  const usableHeight = size.height - margin * 2;
  const rowH = (usableHeight - totalRowGutters) / rows;
  const startY = margin;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const x = startX + c * (colW + gutter);
      const y = startY + r * (rowH + rowGutter);
      host.appendChild(svg("rect", {
        x, y, width: colW, height: rowH,
        class: "gridly-column-fill"
      }));
      if (showNumbers && c === 0) {
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
