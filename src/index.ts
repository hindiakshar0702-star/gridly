/**
 * Gridly - a layout debugging & design inspection toolkit.
 *
 * Quick start:
 *   import { Gridly } from "gridly";
 *   Gridly.show({ type: "columns", columns: 12 });
 *
 * Keyboard shortcuts (auto-enabled):
 *   Ctrl/Cmd + G          toggle overlay
 *   Ctrl/Cmd + Shift + G  cycle grid type
 *   Ctrl/Cmd + D          cycle theme (when visible)
 *   Ctrl/Cmd + P          toggle floating control panel
 */
export { Gridly } from "./core/Gridly";
export { Overlay } from "./core/Overlay";
export { initKeyboard } from "./core/KeyboardController";
export { ControlPanel, controlPanel } from "./core/ControlPanel";
export { THEMES, applyThemeVars, resolveTheme } from "./core/ThemeManager";
export { injectStyles, getCSS } from "./styles/inject";

export {
  RENDERERS,
  renderGrid,
  renderColumnGrid,
  renderContainerGrid,
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
  renderResponsiveGrid
} from "./grids";

export type {
  GridlyOptions,
  ResolvedOptions,
  GridType,
  ThemeName,
  Breakpoint,
  GridRenderer
} from "./types";

export { DEFAULTS, DEFAULT_BREAKPOINTS, mergeOptions, pickBreakpoint } from "./utils/mergeOptions";

import { initKeyboard } from "./core/KeyboardController";

// Auto-initialize keyboard shortcuts in browser environments.
// Users can opt out by calling the returned teardown from initKeyboard.
if (typeof window !== "undefined") {
  initKeyboard();
}

// Note: Gridly is exported as a named export only (not default).
// Use:    import { Gridly } from "gridly";
// CJS:    const { Gridly } = require("gridly");
