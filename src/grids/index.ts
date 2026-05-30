import type { GridRenderer, GridType, ResolvedOptions } from "../types";
import { renderColumnGrid, renderContainerGrid, renderBootstrapGrid } from "./ColumnGrid";
import { renderBaselineGrid } from "./BaselineGrid";
import { renderSquareGrid } from "./SquareGrid";
import { renderDotGrid } from "./DotGrid";
import { renderModularGrid } from "./ModularGrid";
import { renderGoldenGrid } from "./GoldenGrid";
import { renderThirdsGrid } from "./ThirdsGrid";
import { renderIsometricGrid } from "./IsometricGrid";
import { renderHexGrid } from "./HexGrid";
import { renderPolarGrid } from "./PolarGrid";
import { renderRadialGrid } from "./RadialGrid";
import { renderResponsiveGrid } from "./ResponsiveGrid";
import { renderFlexGrid } from "./FlexGrid";
import { renderFibonacciGrid } from "./FibonacciGrid";
import { renderDiagonalGrid } from "./DiagonalGrid";
import { renderPercentageGrid } from "./PercentageGrid";

/**
 * Registry mapping each grid type to its renderer.
 * To add a new grid, drop a renderer here.
 */
export const RENDERERS: Record<GridType, GridRenderer> = {
  columns:    renderColumnGrid,
  baseline:   renderBaselineGrid,
  square:     renderSquareGrid,
  dots:       renderDotGrid,
  container:  renderContainerGrid,
  modular:    renderModularGrid,
  golden:     renderGoldenGrid,
  thirds:     renderThirdsGrid,
  isometric:  renderIsometricGrid,
  hex:        renderHexGrid,
  polar:      renderPolarGrid,
  radial:     renderRadialGrid,
  responsive: renderResponsiveGrid,
  flex:       renderFlexGrid,
  fibonacci:  renderFibonacciGrid,
  diagonal:   renderDiagonalGrid,
  percentage: renderPercentageGrid,
  bootstrap:  renderBootstrapGrid
};

export function renderGrid(
  host: SVGElement,
  options: ResolvedOptions,
  size: { width: number; height: number }
): void {
  const renderer = RENDERERS[options.type] ?? renderColumnGrid;
  renderer(host, options, size);
}

export {
  renderColumnGrid,
  renderContainerGrid,
  renderBootstrapGrid,
  renderBaselineGrid,
  renderSquareGrid,
  renderDotGrid,
  renderModularGrid,
  renderGoldenGrid,
  renderThirdsGrid,
  renderIsometricGrid,
  renderHexGrid,
  renderPolarGrid,
  renderRadialGrid,
  renderResponsiveGrid,
  renderFlexGrid,
  renderFibonacciGrid,
  renderDiagonalGrid,
  renderPercentageGrid
};
