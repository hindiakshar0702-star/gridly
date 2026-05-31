import type { Breakpoint, GridlyOptions, ResolvedOptions } from "../types";

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { name: "mobile",  minWidth: 0,    columns: 4,  gutter: 16, maxWidth: 480 },
  { name: "tablet",  minWidth: 768,  columns: 8,  gutter: 20, maxWidth: 1024 },
  { name: "laptop",  minWidth: 1024, columns: 12, gutter: 24, maxWidth: 1280 },
  { name: "desktop", minWidth: 1280, columns: 12, gutter: 24, maxWidth: 1440 },
  { name: "ultra",   minWidth: 1920, columns: 16, gutter: 32, maxWidth: 1920 }
];

export const DEFAULTS: ResolvedOptions = {
  type: "columns",
  theme: "light",
  color: null,
  opacity: 1,
  zIndex: 2147483646,
  showPanel: false,
  showLauncher: true,
  showDebugOverlay: false,
  keyboard: true,

  columns: 12,
  gutter: 24,
  margin: 32,
  marginLeft: 32,
  marginRight: 32,
  maxWidth: 0,

  baseline: 8,
  rows: 6,

  size: 40,
  spacing: 24,
  dotRadius: 1.5,

  hexRadius: 28,

  rings: 6,
  sectors: 12,

  breakpoints: DEFAULT_BREAKPOINTS,

  device: "responsive",

  showColumnNumbers: false,
  showGutterNumbers: false,
  columnLabelPrefix: "gridOverlay_",
  gutterLabelPrefix: "gutter_",
  showNumbers: false,

  detectorTarget: "",
  detectorAutoScan: true,
  detectorShowLabels: true,
  detectorShowItems: true
};

/**
 * Strip `undefined` properties so they don't overwrite defaults
 * via the spread operator.
 *
 *   { ...DEFAULTS, ...{ columns: undefined } }  // columns becomes undefined
 *
 * vs after filtering:
 *
 *   { ...DEFAULTS, ...filterUndefined({ columns: undefined }) }  // columns stays 12
 */
function filterUndefined<T extends object>(input: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(input) as Array<keyof T>) {
    if (input[key] !== undefined) out[key] = input[key];
  }
  return out;
}

/**
 * Merge user-supplied options over the defaults.
 *
 * Implements the margin-fallback rule:
 *   marginLeft  = input.marginLeft  ?? input.margin ?? DEFAULTS.marginLeft
 *   marginRight = input.marginRight ?? input.margin ?? DEFAULTS.marginRight
 *
 * Also propagates the legacy `showNumbers` flag to the new
 * `showColumnNumbers` flag when the new flag isn't explicitly set.
 *
 * `undefined` values in `input` are filtered out before merging
 * so they don't overwrite the defaults.
 */
export function mergeOptions(input: GridlyOptions = {}): ResolvedOptions {
  const filtered = filterUndefined(input);

  const margin = filtered.margin ?? DEFAULTS.margin;
  const marginLeft = filtered.marginLeft ?? filtered.margin ?? DEFAULTS.marginLeft;
  const marginRight = filtered.marginRight ?? filtered.margin ?? DEFAULTS.marginRight;

  const showColumnNumbers =
    filtered.showColumnNumbers ?? filtered.showNumbers ?? DEFAULTS.showColumnNumbers;

  const breakpoints = (filtered.breakpoints && filtered.breakpoints.length > 0)
    ? filtered.breakpoints
    : DEFAULT_BREAKPOINTS;

  return {
    ...DEFAULTS,
    ...filtered,
    color: filtered.color ?? null,
    breakpoints,
    maxWidth: filtered.maxWidth ?? 0,
    margin,
    marginLeft,
    marginRight,
    showColumnNumbers
  };
}

/**
 * Pick the active breakpoint for a given viewport width.
 * Falls back to the first DEFAULT_BREAKPOINTS entry if `breakpoints`
 * is empty (which would otherwise crash callers).
 */
export function pickBreakpoint(
  width: number,
  breakpoints: Breakpoint[]
): Breakpoint {
  const list = (breakpoints && breakpoints.length > 0)
    ? breakpoints
    : DEFAULT_BREAKPOINTS;
  const sorted = [...list].sort((a, b) => a.minWidth - b.minWidth);
  let match = sorted[0];
  for (const bp of sorted) {
    if (width >= bp.minWidth) match = bp;
  }
  return match;
}
