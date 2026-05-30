import { el, svg } from "../utils/createElement";
import { Gridly } from "./Gridly";
import { injectStyles } from "../styles/inject";

/**
 * The floating "open Gridly panel" button.
 *
 * Always visible (when `showLauncher: true`) so users have a 1-click way
 * to open the control panel without remembering keyboard shortcuts.
 *
 * Click behavior:
 *   - If overlay is hidden → show overlay AND open panel
 *   - If overlay is shown  → toggle the panel
 */
export class Launcher {
  private root: HTMLButtonElement | null = null;

  mount(): void {
    if (this.root) return;
    injectStyles();

    const btn = el("button", {
      class: "gridly-launcher",
      type: "button",
      "aria-label": "Open Gridly panel",
      title: "Open Gridly panel"
    }) as HTMLButtonElement;

    // Inline SVG icon: a 3x3 grid + sparkle dot
    const icon = svg("svg", {
      width: 18, height: 18, viewBox: "0 0 24 24",
      fill: "none", "aria-hidden": "true"
    });
    // Outer rect
    icon.appendChild(svg("rect", {
      x: 3, y: 3, width: 18, height: 18, rx: 3,
      stroke: "currentColor", "stroke-width": 1.7
    }));
    // Vertical dividers
    icon.appendChild(svg("line", { x1: 9,  y1: 3, x2: 9,  y2: 21, stroke: "currentColor", "stroke-width": 1.5 }));
    icon.appendChild(svg("line", { x1: 15, y1: 3, x2: 15, y2: 21, stroke: "currentColor", "stroke-width": 1.5 }));
    // Horizontal dividers
    icon.appendChild(svg("line", { x1: 3,  y1: 9,  x2: 21, y2: 9,  stroke: "currentColor", "stroke-width": 1.5 }));
    icon.appendChild(svg("line", { x1: 3,  y1: 15, x2: 21, y2: 15, stroke: "currentColor", "stroke-width": 1.5 }));

    btn.appendChild(icon);

    const label = el("span", { class: "gridly-launcher__label" });
    label.textContent = "Gridly";
    btn.appendChild(label);

    btn.addEventListener("click", () => this.handleClick());

    document.body.appendChild(btn);
    this.root = btn;
  }

  unmount(): void {
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
  }

  isMounted(): boolean {
    return this.root !== null && this.root.isConnected;
  }

  private handleClick(): void {
    if (!Gridly.isVisible()) {
      // First click: show overlay AND open panel
      Gridly.show({ showPanel: true });
      return;
    }
    // Subsequent clicks: just toggle panel
    const opts = Gridly.getOptions();
    Gridly.update({ showPanel: !(opts?.showPanel ?? false) });
  }
}

export const launcher = new Launcher();
