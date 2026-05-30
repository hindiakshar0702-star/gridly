import type { GridType, ThemeName } from "../types";
import { el } from "../utils/createElement";
import { Gridly } from "./Gridly";

const TYPES: GridType[] = [
  "columns", "baseline", "square", "dots", "container", "modular",
  "golden", "thirds", "isometric", "hex", "polar", "radial", "responsive"
];

const THEMES: ThemeName[] = [
  "light", "dark", "blueprint", "cyberpunk", "figma", "auto"
];

/**
 * Floating debug panel (toggle with Ctrl+P).
 * Built as plain DOM so it works without React.
 */
export class ControlPanel {
  private root: HTMLDivElement | null = null;

  mount(): void {
    if (this.root) return;
    const opts = Gridly.getOptions();
    if (!opts) return;

    const root = el("div", { class: "gridly-panel", role: "dialog" });

    const title = el("div", { class: "gridly-panel__title" });
    title.appendChild(document.createTextNode("Gridly"));
    const closeBtn = el("button", { type: "button", "aria-label": "Close panel" });
    closeBtn.textContent = "\u00d7";
    closeBtn.addEventListener("click", () => {
      Gridly.update({ showPanel: false });
    });
    title.appendChild(closeBtn);
    root.appendChild(title);

    // Type selector
    root.appendChild(this.row("Type", this.select(TYPES, opts.type, (v) => {
      Gridly.setType(v as GridType);
    })));

    // Theme selector
    root.appendChild(this.row("Theme", this.select(THEMES, opts.theme, (v) => {
      Gridly.setTheme(v as ThemeName);
    })));

    // Columns
    root.appendChild(this.row("Columns", this.number(opts.columns, 1, 24, 1, (v) => {
      Gridly.update({ columns: v });
    })));

    // Gutter
    root.appendChild(this.row("Gutter", this.number(opts.gutter, 0, 200, 1, (v) => {
      Gridly.update({ gutter: v });
    })));

    // Max width
    root.appendChild(this.row("Max width", this.number(opts.maxWidth, 0, 4000, 10, (v) => {
      Gridly.update({ maxWidth: v });
    })));

    // Baseline
    root.appendChild(this.row("Baseline", this.number(opts.baseline, 2, 64, 1, (v) => {
      Gridly.update({ baseline: v });
    })));

    // Opacity
    root.appendChild(this.row("Opacity", this.number(opts.opacity, 0, 1, 0.05, (v) => {
      Gridly.update({ opacity: v });
    })));

    // Hint
    const hint = el("div", { class: "gridly-panel__hint" });
    hint.innerHTML =
      "<b>Ctrl+G</b> toggle &middot; <b>Ctrl+Shift+G</b> cycle type<br/>" +
      "<b>Ctrl+D</b> cycle theme &middot; <b>Ctrl+P</b> panel";
    root.appendChild(hint);

    document.body.appendChild(root);
    this.root = root;
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

  private row(label: string, control: HTMLElement): HTMLDivElement {
    const row = el("div", { class: "gridly-panel__row" });
    const lbl = el("label");
    lbl.textContent = label;
    row.appendChild(lbl);
    row.appendChild(control);
    return row;
  }

  private select(
    values: string[],
    current: string,
    onChange: (v: string) => void
  ): HTMLSelectElement {
    const sel = el("select");
    for (const v of values) {
      const opt = el("option", { value: v });
      opt.textContent = v;
      if (v === current) opt.setAttribute("selected", "selected");
      sel.appendChild(opt);
    }
    sel.addEventListener("change", () => onChange(sel.value));
    return sel;
  }

  private number(
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (v: number) => void
  ): HTMLInputElement {
    const input = el("input", {
      type: "number",
      min, max, step,
      value: String(value)
    });
    input.addEventListener("input", () => {
      const n = Number(input.value);
      if (!Number.isNaN(n)) onChange(n);
    });
    return input;
  }
}

export const controlPanel = new ControlPanel();
