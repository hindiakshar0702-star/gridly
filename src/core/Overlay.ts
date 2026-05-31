import type { GridlyOptions, ResolvedOptions } from "../types";
import { mergeOptions } from "../utils/mergeOptions";
import { rafThrottle } from "../utils/debounce";
import { clearChildren, el, svg } from "../utils/createElement";
import { applyThemeVars } from "./ThemeManager";
import { renderGrid } from "../grids";
import { injectStyles } from "../styles/inject";
import { controlPanel } from "./ControlPanel";
import { launcher } from "./Launcher";
import { computeSimulation, drawDeviceBackdrop, drawDeviceFrame, installDeviceClip } from "./DeviceSimulator";

export interface OverlayMountOptions {
  /**
   * Element to mount the overlay into. Defaults to `document.body`.
   * When set to anything else, the overlay is automatically scoped
   * (position: absolute, sized to the host) and the global control
   * panel + launcher are NOT mounted.
   */
  host?: HTMLElement;
}

/** Monotonic counter for unique SVG clip-path ids per Overlay instance. */
let overlayInstanceCounter = 0;

/**
 * Overlay is the host element that contains the SVG canvas where
 * grid renderers draw.
 *
 * One Overlay instance corresponds to one mounted grid. By default
 * it mounts to <body> as a fixed full-viewport overlay (used by the
 * global Gridly singleton).
 *
 * When constructed with a custom host element it becomes a *scoped*
 * overlay (position: absolute, no panel/launcher) — used by the
 * React `<GridBackground />` component.
 */
export class Overlay {
  private root: HTMLDivElement | null = null;
  private surface: SVGSVGElement | null = null;
  private options: ResolvedOptions;
  private host: HTMLElement | null;
  private scoped: boolean;
  private resizeObserver: ResizeObserver | null = null;
  private onResize: () => void;
  private onScroll: () => void;
  private clipId: string;

  constructor(options: GridlyOptions = {}, mountOpts: OverlayMountOptions = {}) {
    this.options = mergeOptions(options);
    this.onResize = rafThrottle(() => this.draw());
    this.onScroll = rafThrottle(() => this.draw());
    this.host = mountOpts.host ?? null;
    // If a custom host is provided we treat the overlay as scoped.
    this.scoped = mountOpts.host != null && mountOpts.host !== globalBody();
    // Unique clip id per instance so multiple overlays on the same
    // page don't collide on `<clipPath id="...">`.
    this.clipId = `gridly-clip-${++overlayInstanceCounter}`;
  }

  mount(): void {
    if (this.root) return;
    injectStyles();

    const targetHost = this.host ?? globalBody();
    if (!targetHost) return;

    const cls = this.scoped ? "gridly-overlay gridly-overlay--scoped" : "gridly-overlay";
    this.root = el("div", {
      class: cls,
      "data-gridly-type": this.options.type,
      "aria-hidden": "true",
      role: "presentation"
    });
    this.root.style.zIndex = String(this.options.zIndex);
    this.root.style.opacity = String(this.options.opacity);

    // Apply theme palette first, then optionally override with custom color
    // (otherwise applyThemeVars wipes the picker color).
    applyThemeVars(this.root, this.options.theme);
    this.applyCustomColor();

    this.surface = svg("svg", {
      class: "gridly-surface",
      width: "100%",
      height: "100%",
      preserveAspectRatio: "xMidYMid slice"
    });
    this.root.appendChild(this.surface);

    targetHost.appendChild(this.root);

    this.draw();

    if (!this.scoped) {
      this.syncPanel();
      this.syncLauncher();
    }

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.onResize);
      // For scoped overlays, observe the host to follow its size.
      this.resizeObserver.observe(this.scoped ? targetHost : document.documentElement);
    }
    window.addEventListener("resize", this.onResize, { passive: true });
    // Detector reads real DOM positions — those become stale on scroll.
    // Cheap rafThrottle keeps the cost to one redraw per frame.
    window.addEventListener("scroll", this.onScroll, { passive: true });
  }

  unmount(): void {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("scroll", this.onScroll);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    if (!this.scoped) {
      controlPanel.unmount();
      // NOTE: launcher stays mounted even when overlay is hidden so the
      // user has a way to bring it back. Call Gridly.hideLauncher() to
      // remove it explicitly.
    }
    this.root = null;
    this.surface = null;
  }

  isMounted(): boolean {
    return this.root !== null && this.root.isConnected;
  }

  update(patch: GridlyOptions): void {
    const merged: GridlyOptions = {
      ...this.options,
      color: this.options.color ?? undefined,
      ...patch
    };
    this.options = mergeOptions(merged);
    if (!this.root) return;

    this.root.dataset.gridlyType = this.options.type;
    this.root.style.zIndex = String(this.options.zIndex);
    this.root.style.opacity = String(this.options.opacity);

    // Apply theme palette first, then optionally override with custom color
    // so the color picker actually wins over the theme.
    applyThemeVars(this.root, this.options.theme);
    this.applyCustomColor();
    this.draw();
    if (!this.scoped) {
      this.syncPanel();
      this.syncLauncher();
      controlPanel.refresh();
    }
  }

  getOptions(): ResolvedOptions {
    return { ...this.options };
  }

  private applyCustomColor(): void {
    if (!this.root) return;
    if (this.options.color) {
      this.root.style.setProperty("--gridly-ink", this.options.color);
      this.root.style.setProperty("--gridly-ink-bold", this.options.color);
      this.root.style.setProperty("--gridly-accent", this.options.color);
    } else {
      this.root.style.removeProperty("--gridly-ink");
      this.root.style.removeProperty("--gridly-ink-bold");
      this.root.style.removeProperty("--gridly-accent");
    }
  }

  private syncPanel(): void {
    if (this.options.showPanel) {
      if (!controlPanel.isMounted()) controlPanel.mount();
    } else {
      if (controlPanel.isMounted()) controlPanel.unmount();
    }
  }

  private syncLauncher(): void {
    if (this.options.showLauncher) {
      if (!launcher.isMounted()) launcher.mount();
    } else {
      if (launcher.isMounted()) launcher.unmount();
    }
  }

  private draw(): void {
    if (!this.surface || !this.root) return;
    clearChildren(this.surface);

    // For scoped overlays, derive size from the host element instead
    // of the viewport.
    const useHostSize = this.scoped && this.root.parentElement;
    const fullWidth = useHostSize
      ? (this.root.parentElement as HTMLElement).clientWidth
      : window.innerWidth;
    const fullHeight = useHostSize
      ? (this.root.parentElement as HTMLElement).clientHeight
      : window.innerHeight;

    if (fullWidth <= 0 || fullHeight <= 0) return;

    this.surface.setAttribute("viewBox", `0 0 ${fullWidth} ${fullHeight}`);
    this.surface.setAttribute("width", String(fullWidth));
    this.surface.setAttribute("height", String(fullHeight));

    // Detector renders against the *real* DOM in viewport coordinates,
    // so it bypasses the device simulator entirely (the sim is just a
    // visual viewport preview and would offset the real-element rects
    // away from the elements they describe).
    if (this.options.type === "detector") {
      renderGrid(this.surface, this.options, { width: fullWidth, height: fullHeight });
      return;
    }

    const sim = computeSimulation(this.options, fullWidth, fullHeight);

    // 1. Backdrop letterboxes (drawn first so the grid sits on top)
    drawDeviceBackdrop(this.surface, sim, fullWidth, fullHeight);

    // 2. The grid itself, translated into the simulated viewport
    //    and clipped so over-drawn cells (hex/dots/etc.) don't leak
    //    into the letterbox area. Use a per-instance clip id so
    //    multiple overlays don't fight over the same <defs> entry.
    const clipPath = installDeviceClip(this.surface, sim, this.clipId);
    const gridAttrs: Record<string, string> = {
      transform: sim.active ? `translate(${sim.offsetX}, 0)` : ""
    };
    if (clipPath) gridAttrs["clip-path"] = clipPath;
    const gridGroup = svg("g", gridAttrs);
    this.surface.appendChild(gridGroup);
    renderGrid(gridGroup, this.options, { width: sim.width, height: sim.height });

    // 3. Device frame outline + label on top of everything
    drawDeviceFrame(this.surface, sim, fullWidth, fullHeight);
  }
}

function globalBody(): HTMLElement | null {
  return typeof document !== "undefined" ? document.body : null;
}
