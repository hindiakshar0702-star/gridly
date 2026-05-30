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
 * Merge user-supplied options over the defaults.
 *
 * Implements the margin-fallback rule:
 *   marginLeft  = input.marginLeft  ?? input.margin ?? DEFAULTS.marginLeft
 *   marginRight = input.marginRight ?? input.margin ?? DEFAULTS.marginRight
 *
 * Also propagates the legacy `showNumbers` flag to the new
 * `showColumnNumbers` flag when the new flag isn't explicitly set.
 */
export function mergeOptions(input: GridlyOptions = {}): ResolvedOptions {
  const margin = input.margin ?? DEFAULTS.margin;
  const marginLeft = input.marginLeft ?? input.margin ?? DEFAULTS.marginLeft;
  const marginRight = input.marginRight ?? input.margin ?? DEFAULTS.marginRight;

  const showColumnNumbers =
    input.showColumnNumbers ?? input.showNumbers ?? DEFAULTS.showColumnNumbers;

  return {
    ...DEFAULTS,
    ...input,
    color: input.color ?? null,
    breakpoints: input.breakpoints ?? DEFAULT_BREAKPOINTS,
    maxWidth: input.maxWidth ?? 0,
    margin,
    marginLeft,
    marginRight,
    showColumnNumbers
  };
}

export function pickBreakpoint(
  width: number,
  breakpoints: Breakpoint[]
): Breakpoint {
  const sorted = [...breakpoints].sort((a, b) => a.minWidth - b.minWidth);
  let match = sorted[0];
  for (const bp of sorted) {
    if (width >= bp.minWidth) match = bp;
  }
  return match;
}
