import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";
import type { GridlyOptions } from "../types";
import { Overlay } from "../core/Overlay";

export interface GridBackgroundProps extends GridlyOptions {
  /** Inline style for the wrapping div. */
  style?: CSSProperties;
  /** Class name for the wrapping div. */
  className?: string;
  /** Children rendered above the grid background. */
  children?: ReactNode;
}

/**
 * A scoped grid background that renders inside its parent
 * (instead of the global body overlay). Multiple instances
 * can coexist on the same page and they don't interfere with
 * the global Gridly singleton or its launcher / panel.
 *
 *   <GridBackground type="dots" spacing={20} style={{ height: 320 }}>
 *     <Hero />
 *   </GridBackground>
 */
export function GridBackground(props: GridBackgroundProps): JSX.Element {
  const { style, className, children, ...options } = props;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const signature = JSON.stringify(options);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Create a fully-scoped overlay that mounts directly inside the
    // wrapper (not document.body) and skips the global panel/launcher.
    // Force showLauncher/showPanel off — they're for the global overlay.
    const scopedOptions: GridlyOptions = {
      ...options,
      showLauncher: false,
      showPanel: false
    };

    const overlay = new Overlay(scopedOptions, { host: wrapper });
    overlay.mount();
    overlayRef.current = overlay;

    return () => {
      overlay.unmount();
      overlayRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  // If the props change while mounted, push them to the existing overlay
  // (cheaper than fully unmounting / remounting).
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.update({
        ...options,
        showLauncher: false,
        showPanel: false
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const wrapperStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    ...style
  };

  return (
    <div ref={wrapperRef} className={className} style={wrapperStyle}>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
