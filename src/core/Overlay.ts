import type { GridlyOptions, ResolvedOptions } from "../types";
import { mergeOptions } from "../utils/mergeOptions";
import { rafThrottle } from "../utils/debounce";
import { clearChildren, el, svg } from "../utils/createElement";
import { applyThemeVars } from "./ThemeManager";
import { renderGrid } from "../grids";
import { injectStyles } from "../styles/inject";
import { controlPanel } from "./ControlPanel";

/**
 * Overlay is the host element appended to <body> that contains
 * the SVG canvas where grid renderers draw.
 *
 * One Overlay instance corresponds to one mounted grid.
 */
export class Overlay {
  private root: HTMLDivElement | null = null;
  private surface: SVGSVGElement | null = null;
  private options: ResolvedOptions;
  private resizeObserver: ResizeObserver | null = null;
  private onResize: () => void;

  constructor(options: GridlyOptions = {}) {
    this.options = mergeOptions(options);
    this.onResize = rafThrottle(() => this.draw());
  }

  mount(): void {
    if (this.root) return;
    injectStyles();

    this.root = el("div", {
      class: "gridly-overlay",
      "data-gridly-type": this.options.type,
      "aria-hidden": "true",
      role: "presentation"
    });
    this.root.style.zIndex = String(this.options.zIndex);
    this.root.style.opacity = String(this.options.opacity);

    if (this.options.color) {
      this.root.style.setProperty("--gridly-ink", this.options.color);
      this.root.style.setProperty("--gridly-ink-bold", this.options.color);
      this.root.style.setProperty("--gridly-accent", this.options.color);
    }

    applyThemeVars(this.root, this.options.theme);

    this.surface = svg("svg", {
      class: "gridly-surface",
      width: "100%",
      height: "100%",
      preserveAspectRatio: "xMidYMid slice"
    });
    this.root.appendChild(this.surface);

    document.body.appendChild(this.root);

    this.draw();
    this.syncPanel();

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(document.documentElement);
    }
    window.addEventListener("resize", this.onResize, { passive: true });
  }

  unmount(): void {
    window.removeEventListener("resize", this.onResize);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    controlPanel.unmount();
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

    if (this.options.color) {
      this.root.style.setProperty("--gridly-ink", this.options.color);
      this.root.style.setProperty("--gridly-ink-bold", this.options.color);
      this.root.style.setProperty("--gridly-accent", this.options.color);
    }
    applyThemeVars(this.root, this.options.theme);
    this.draw();
    this.syncPanel();
  }

  getOptions(): ResolvedOptions {
    return { ...this.options };
  }

  private syncPanel(): void {
    if (this.options.showPanel) {
      if (!controlPanel.isMounted()) controlPanel.mount();
    } else {
      if (controlPanel.isMounted()) controlPanel.unmount();
    }
  }

  private draw(): void {
    if (!this.surface) return;
    clearChildren(this.surface);

    const width = window.innerWidth;
    const height = window.innerHeight;
    this.surface.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.surface.setAttribute("width", String(width));
    this.surface.setAttribute("height", String(height));

    renderGrid(this.surface, this.options, { width, height });
  }
}
