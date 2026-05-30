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
 *   Ctrl/Cmd + Shift + D  cycle device simulator
 *   Ctrl/Cmd + P          toggle floating control panel
 *
 * One-click UX:
 *   The floating "Gridly" launcher button is auto-mounted in browsers.
 *   Click it once to show the grid + open the panel.
 *   Disable with: Gridly.hideLauncher();
 */
export { Gridly } from "./core/Gridly";
export { Overlay } from "./core/Overlay";
export { initKeyboard } from "./core/KeyboardController";
export { ControlPanel, controlPanel } from "./core/ControlPanel";
export { Launcher, launcher } from "./core/Launcher";
export { THEMES, applyThemeVars, resolveTheme } from "./core/ThemeManager";
export {
  DEVICE_SPECS, DEVICE_LIST,
  computeSimulation, drawDeviceBackdrop, drawDeviceFrame,
  installDeviceClip, DEVICE_CLIP_ID
} from "./core/DeviceSimulator";
export { injectStyles, getCSS } from "./styles/inject";

export {
  RENDERERS,
  renderGrid,
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
  renderPercentageGrid,
  renderDetectorGrid
} from "./grids";

export {
  detectGrid,
  detectAllGrids,
  resolveTargets,
  getElementSelector
} from "./core/GridDetector";
export type {
  DetectedGrid,
  DetectedItem,
  DetectedRect,
  DetectedDisplay
} from "./core/GridDetector";

export type {
  GridlyOptions,
  ResolvedOptions,
  GridType,
  ThemeName,
  Breakpoint,
  GridRenderer,
  DevicePreset,
  DeviceSpec
} from "./types";

export {
  DEFAULTS,
  DEFAULT_BREAKPOINTS,
  mergeOptions,
  pickBreakpoint
} from "./utils/mergeOptions";

import { Gridly } from "./core/Gridly";
import { initKeyboard } from "./core/KeyboardController";
import { launcher } from "./core/Launcher";

// Auto-initialize keyboard shortcuts + launcher in browser environments.
// Users can opt out:
//   - Keyboard:  the returned teardown from initKeyboard() removes the listener
//   - Launcher:  Gridly.hideLauncher();
if (typeof window !== "undefined") {
  initKeyboard();
  // Defer to next tick so the user's own mount code runs first
  // (avoids a flash when they call Gridly.show() during page init).
  if (typeof queueMicrotask === "function") {
    queueMicrotask(() => {
      if (!Gridly.isVisible()) launcher.mount();
    });
  } else {
    setTimeout(() => {
      if (!Gridly.isVisible()) launcher.mount();
    }, 0);
  }
}

// Note: Gridly is exported as a named export only (not default).
// Use:    import { Gridly } from "gridly";
// CJS:    const { Gridly } = require("gridly");
