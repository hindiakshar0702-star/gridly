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
  | "responsive"
  // v0.2.0 additions:
  | "flex"
  | "fibonacci"
  | "diagonal"
  | "percentage"
  | "bootstrap"
  // v0.3.0 additions:
  | "detector";

export type ThemeName =
  | "light"
  | "dark"
  | "blueprint"
  | "cyberpunk"
  | "figma"
  | "auto";

/**
 * Device simulator presets. When set to anything other than "responsive",
 * the overlay constrains its drawing to a centered viewport of that width.
 */
export type DevicePreset =
  | "responsive"
  | "mobile"
  | "tablet"
  | "laptop"
  | "desktop";

export interface DeviceSpec {
  /** Preset key. */
  key: DevicePreset;
  /** Human-readable label shown in the panel & frame. */
  label: string;
  /** Simulated viewport width in CSS pixels. */
  width: number;
  /** Optional simulated height (mostly informational). */
  height?: number;
}

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

  /** Show floating "open panel" launcher button. Defaults to true. */
  showLauncher?: boolean;

  /** Enable keyboard shortcuts. Defaults to true. */
  keyboard?: boolean;

  // ----- Column / Container / Modular -----
  /** Number of columns (column / modular grids). */
  columns?: number;
  /** Gutter between columns (px). */
  gutter?: number;
  /**
   * Symmetric outer page margin (px).
   * Use marginLeft / marginRight to set asymmetric margins.
   */
  margin?: number;
  /** Left margin (px). Falls back to `margin`. */
  marginLeft?: number;
  /** Right margin (px). Falls back to `margin`. */
  marginRight?: number;
  /** Max content width (px). 0 or undefined = use full width minus margins. */
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

  /** Device simulator preset. Defaults to "responsive". */
  device?: DevicePreset;

  // ----- Labels -----
  /**
   * Show numbered labels on each column (e.g. "gridOverlay_0", "gridOverlay_1").
   * Replaces the older `showNumbers` flag for column grids.
   */
  showColumnNumbers?: boolean;
  /**
   * Show numbered labels on each gutter (e.g. "gutter_0", "gutter_1").
   */
  showGutterNumbers?: boolean;
  /** Prefix used for column number labels. Defaults to "gridOverlay_". */
  columnLabelPrefix?: string;
  /** Prefix used for gutter number labels. Defaults to "gutter_". */
  gutterLabelPrefix?: string;

  /**
   * Legacy: show numeric labels (column index for column grid,
   * row index for modular, angle for radial). Kept for backwards
   * compatibility with v0.1.0.
   */
  showNumbers?: boolean;

  // ----- Grid Detector (type: "detector") -----
  /**
   * CSS selector(s) to inspect. Comma-separated list supported.
   * If empty AND detectorAutoScan is true, scans the whole document.
   * If empty AND detectorAutoScan is false, no grids are drawn.
   */
  detectorTarget?: string;
  /** Scan the entire DOM for elements with `display: grid` or `flex`. */
  detectorAutoScan?: boolean;
  /** Show overlay labels with detected grid metadata. */
  detectorShowLabels?: boolean;
  /** Show the actual child item rectangles within each detected grid. */
  detectorShowItems?: boolean;
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
 *
 * The `host` may be the root <svg> or a transformed <g> group
 * when device simulation is active — renderers should treat it
 * as an opaque container they can append children to.
 */
export type GridRenderer = (
  host: SVGElement,
  options: ResolvedOptions,
  size: { width: number; height: number }
) => void;
