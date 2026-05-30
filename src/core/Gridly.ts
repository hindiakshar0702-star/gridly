import type { DevicePreset, GridlyOptions, GridType, ResolvedOptions, ThemeName } from "../types";
import { Overlay } from "./Overlay";
import { launcher } from "./Launcher";

/**
 * The main Gridly facade.
 *
 * Usage:
 *   import { Gridly } from "gridly";
 *   Gridly.show({ type: "columns", columns: 12 });
 *   Gridly.toggle();
 *   Gridly.setType("baseline");
 *   Gridly.setDevice("mobile");
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
    "responsive",
    "flex",
    "fibonacci",
    "diagonal",
    "percentage",
    "bootstrap",
    "detector"
  ];

  /** Theme cycle used by Ctrl+D. */
  static readonly THEME_CYCLE: ThemeName[] = [
    "light",
    "dark",
    "blueprint",
    "cyberpunk",
    "figma"
  ];

  /** Device cycle. */
  static readonly DEVICE_CYCLE: DevicePreset[] = [
    "responsive",
    "mobile",
    "tablet",
    "laptop",
    "desktop"
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

  setDevice(device: DevicePreset): void {
    this.update({ device });
  }

  /**
   * Inspect a specific element (or selector) using the grid detector.
   * Switches to `type: "detector"` and sets `detectorTarget` to the
   * provided selector(s).
   *
   *   Gridly.inspect(".container");
   *   Gridly.inspect(".hero, .grid-section");
   */
  inspect(selector: string): void {
    this.update({
      type: "detector",
      detectorTarget: selector,
      detectorAutoScan: false
    });
  }

  /**
   * Auto-detect every grid / flex container on the page and overlay
   * their structure. Equivalent to `Gridly.show({ type: "detector",
   * detectorAutoScan: true, detectorTarget: "" })`.
   */
  inspectAll(): void {
    this.update({
      type: "detector",
      detectorTarget: "",
      detectorAutoScan: true
    });
  }

  cycleType(direction: 1 | -1 = 1): GridType {
    return this.cycleAcross(GridlyClass.TYPE_CYCLE, "type", direction) as GridType;
  }

  cycleTheme(direction: 1 | -1 = 1): ThemeName {
    return this.cycleAcross(GridlyClass.THEME_CYCLE, "theme", direction) as ThemeName;
  }

  cycleDevice(direction: 1 | -1 = 1): DevicePreset {
    return this.cycleAcross(GridlyClass.DEVICE_CYCLE, "device", direction) as DevicePreset;
  }

  /**
   * Mount only the launcher button — useful for "click to start" UX
   * without immediately drawing a grid.
   */
  showLauncher(): void {
    if (!launcher.isMounted()) launcher.mount();
  }

  hideLauncher(): void {
    launcher.unmount();
    // Also persist the preference so subsequent show() calls don't bring it back.
    this.lastOptions.showLauncher = false;
    if (this.overlay) this.overlay.update(this.lastOptions);
  }

  getOptions(): ResolvedOptions | null {
    return this.overlay ? this.overlay.getOptions() : null;
  }

  // ─── Internal ─────────────────────────────────────────────────────

  private cycleAcross<K extends keyof GridlyOptions>(
    cycle: ReadonlyArray<string>,
    key: K,
    direction: 1 | -1
  ): string {
    const current = (this.lastOptions[key] as unknown as string) ?? cycle[0];
    const idx = cycle.indexOf(current);
    const nextIdx = ((idx === -1 ? 0 : idx) + direction + cycle.length) % cycle.length;
    const next = cycle[nextIdx];
    this.update({ [key]: next } as Partial<GridlyOptions>);
    return next;
  }
}

/** Singleton instance — Gridly is intended to be used as a global API. */
export const Gridly = new GridlyClass();

export type { GridlyClass };
