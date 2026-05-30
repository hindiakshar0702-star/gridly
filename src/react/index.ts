/**
 * React entry point: import from "gridly/react".
 *
 *   import { GridOverlay, useGridly } from "gridly/react";
 *
 *   function App() {
 *     return <GridOverlay type="columns" columns={12} theme="dark" />;
 *   }
 */
export { GridOverlay } from "./GridOverlay";
export type { GridOverlayProps } from "./GridOverlay";
export { GridBackground } from "./GridBackground";
export type { GridBackgroundProps } from "./GridBackground";
export { useGridly } from "./useGridly";

export { Gridly } from "../core/Gridly";
export type {
  GridlyOptions,
  GridType,
  ThemeName,
  Breakpoint
} from "../types";
