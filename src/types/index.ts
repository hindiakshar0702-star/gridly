/**
 * Gridly type definitions
 */

export type GridType =
  | "columns"
  | "baseline"
  | "square"
  | "dots"
  | "container"
  | "modular"
  | "golden"
  | "thirds"
  | "isometric"
  | "hex"
  | "polar"
  | "radial"
  | "responsive";

export type ThemeName =
  | "light"
  | "dark"
  | "blueprint"
  | "cyberpunk"
  | "figma"
  | "auto";

export interface Breakpoint {
  name: string;
  minWidth: number;
  columns: number;
  gutter: number;
  maxWidth?: number;
}

/**
 * Unified options object accepted by Gridly.show().
 * Different grid types use different subsets of these options.
 */
export interface GridlyOptions {
  /** Type of grid to render. Defaults to "columns". */
  type?: GridType;

  /** Theme name. Defaults to "light". */
  theme?: ThemeName;

  /** Custom color override (CSS color). Falls back to theme color. */
  color?: string;

  /** Opacity of grid lines/cells (0..1). Defaults to 1. */
  opacity?: number;

  /** Stack-order. Defaults to 2147483646. */
  zIndex?: number;

  /** Show built-in floating control panel. Defaults to false. */
  showPanel?: boolean;

  /** Enable keyboard shortcuts. Defaults to true. */
  keyboard?: boolean;

  // ----- Column / Container / Modular -----
  /** Number of columns (column / modular grids). */
  columns?: number;
  /** Gutter between columns (px). */
  gutter?: number;
  /** Outer page margin (px). */
  margin?: number;
  /** Max content width (px). 0 or undefined = full width. */
  maxWidth?: number;

  // ----- Baseline / Modular rows -----
  /** Baseline height (px). */
  baseline?: number;
  /** Number of rows (modular grid). */
  rows?: number;

  // ----- Square / Dots -----
  /** Cell size for square / dot grids (px). */
  size?: number;
  /** Spacing between dots (px). */
  spacing?: number;
  /** Dot radius (px). */
  dotRadius?: number;

  // ----- Hex -----
  /** Hex cell radius (px). */
  hexRadius?: number;

  // ----- Polar / Radial -----
  /** Number of concentric rings. */
  rings?: number;
  /** Number of angular divisions. */
  sectors?: number;

  // ----- Responsive -----
  /** Custom breakpoints. */
  breakpoints?: Breakpoint[];

  // ----- Misc -----
  /** Show column / row numbers. */
  showNumbers?: boolean;
}

export interface ResolvedOptions extends Required<Omit<
  GridlyOptions,
  "color" | "maxWidth" | "breakpoints"
>> {
  color: string | null;
  maxWidth: number;
  breakpoints: Breakpoint[];
}

/**
 * A grid renderer is a pure function that draws content
 * into the overlay container based on resolved options.
 */
export type GridRenderer = (
  container: SVGSVGElement,
  options: ResolvedOptions,
  size: { width: number; height: number }
) => void;
