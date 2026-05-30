import type { ReactNode } from "react";
import type { GridlyOptions } from "../types";
import { useGridly } from "./useGridly";

export interface GridOverlayProps extends GridlyOptions {
  /** When false, the overlay is unmounted. Defaults to true. */
  enabled?: boolean;
  /** Optional children pass-through (so it can wrap content). */
  children?: ReactNode;
}

/**
 * Declarative React wrapper around the Gridly overlay.
 *
 * Usage:
 *   <GridOverlay type="columns" columns={12} theme="dark" />
 *
 * Renders no DOM of its own (the overlay is portaled to body
 * via the imperative Gridly singleton).
 */
export function GridOverlay(props: GridOverlayProps): JSX.Element | null {
  const { enabled = true, children, ...options } = props;
  useGridly(options, enabled);
  return (children as JSX.Element | undefined) ?? null;
}
