import { useEffect, useRef } from "react";
import type { GridlyOptions } from "../types";
import { Gridly } from "../core/Gridly";

/**
 * Imperative hook: shows the Gridly overlay for the lifetime
 * of the calling component, syncing options on every render.
 */
export function useGridly(options: GridlyOptions = {}, enabled = true): void {
  // Stable serialized signature so we don't pass a fresh object reference
  // into the dependency array each render.
  const signature = JSON.stringify(options);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      if (mountedRef.current) {
        Gridly.hide();
        mountedRef.current = false;
      }
      return;
    }
    Gridly.show(options);
    mountedRef.current = true;
    return () => {
      Gridly.hide();
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, signature]);
}
