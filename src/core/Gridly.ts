import type { GridlyOptions, GridType, ResolvedOptions, ThemeName } from "../types";
import { Overlay } from "./Overlay";

/**
 * The main Gridly facade.
 *
 * Usage:
 *   import { Gridly } from "gridly";
 *   Gridly.show({ type: "columns", columns: 12 });
 *   Gridly.toggle();
 *   Gridly.setType("baseline");
 */
class GridlyClass {
  private overlay: Overlay | null = null;
  private lastOptions: GridlyOptions = {};

  /** Cycle order used by Ctrl+Shift+G. */
  static readonly TYPE_CYCLE: GridType[] = [
    "columns",
    "baseline",
    "square",
    "dots",
    "container",
    "modular",
    "golden",
    "thirds",
    "isometric",
    "hex",
    "polar",
    "radial",
    "responsive"
  ];

  /** Theme cycle used by Ctrl+D. */
  static readonly THEME_CYCLE: ThemeName[] = [
    "light",
    "dark",
    "blueprint",
    "cyberpunk",
    "figma"
  ];

  show(options: GridlyOptions = {}): void {
    this.lastOptions = { ...this.lastOptions, ...options };
    if (!this.overlay) {
      this.overlay = new Overlay(this.lastOptions);
      this.overlay.mount();
    } else {
      this.overlay.update(this.lastOptions);
      if (!this.overlay.isMounted()) this.overlay.mount();
    }
  }

  hide(): void {
    if (this.overlay) {
      this.overlay.unmount();
      this.overlay = null;
    }
  }

  toggle(options: GridlyOptions = {}): void {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.show(options);
    }
  }

  isVisible(): boolean {
    return this.overlay !== null && this.overlay.isMounted();
  }

  update(patch: GridlyOptions): void {
    this.lastOptions = { ...this.lastOptions, ...patch };
    if (this.overlay) this.overlay.update(this.lastOptions);
  }

  setType(type: GridType): void {
    this.update({ type });
  }

  setTheme(theme: ThemeName): void {
    this.update({ theme });
  }

  cycleType(direction: 1 | -1 = 1): GridType {
    const cycle = GridlyClass.TYPE_CYCLE;
    const current = (this.lastOptions.type ?? "columns") as GridType;
    const idx = cycle.indexOf(current);
    const nextIdx = ((idx === -1 ? 0 : idx) + direction + cycle.length) % cycle.length;
    const next = cycle[nextIdx];
    this.setType(next);
    return next;
  }

  cycleTheme(direction: 1 | -1 = 1): ThemeName {
    const cycle = GridlyClass.THEME_CYCLE;
    const current = (this.lastOptions.theme ?? "light") as ThemeName;
    const idx = cycle.indexOf(current);
    const nextIdx = ((idx === -1 ? 0 : idx) + direction + cycle.length) % cycle.length;
    const next = cycle[nextIdx];
    this.setTheme(next);
    return next;
  }

  getOptions(): ResolvedOptions | null {
    return this.overlay ? this.overlay.getOptions() : null;
  }
}

/** Singleton instance — Gridly is intended to be used as a global API. */
export const Gridly = new GridlyClass();

export type { GridlyClass };
