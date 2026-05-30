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
 * (instead of the global body overlay). Uses position: relative
 * on the wrapper and a position: absolute Gridly overlay child.
 *
 * Use this when you want a grid as a section background rather
 * than a debug toolbar covering the entire viewport.
 */
export function GridBackground(props: GridBackgroundProps): JSX.Element {
  const { style, className, children, ...options } = props;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const signature = JSON.stringify(options);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Use a private overlay scoped to this wrapper. We achieve
    // scoping by mounting the global overlay then re-parenting
    // its root into the wrapper. (Simpler than building a second
    // engine; the overlay is just a positioned element.)
    const overlay = new Overlay(options);
    overlay.mount();
    overlayRef.current = overlay;

    // Re-parent the overlay root from <body> into the wrapper.
    const root = document.querySelector(
      ".gridly-overlay[data-gridly-type]"
    ) as HTMLElement | null;
    if (root) {
      root.style.position = "absolute";
      root.style.zIndex = "0";
      wrapper.appendChild(root);
    }

    return () => {
      overlay.unmount();
      overlayRef.current = null;
    };
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
