import type { Breakpoint, DevicePreset, GridType, ThemeName } from "../types";
import { el } from "../utils/createElement";
import { Gridly } from "./Gridly";
import { DEVICE_LIST, DEVICE_SPECS } from "./DeviceSimulator";

const TYPES: GridType[] = [
  "columns", "baseline", "square", "dots", "container", "modular",
  "golden", "thirds", "isometric", "hex", "polar", "radial", "responsive",
  "flex", "fibonacci", "diagonal", "percentage", "bootstrap", "detector"
];

const THEMES: ThemeName[] = [
  "light", "dark", "blueprint", "cyberpunk", "figma", "auto"
];

/** Which grid types use which options. Drives row visibility in the panel. */
const COLUMN_TYPES: GridType[] = ["columns", "responsive", "modular", "container", "bootstrap"];
const DETECTOR_TYPES: GridType[] = ["detector"];

type ControlMap = Record<string, HTMLInputElement | HTMLSelectElement>;
type TypedRow = { row: HTMLDivElement | HTMLTableElement; types: GridType[] | "all" };

/**
 * Floating debug panel (toggle with Ctrl+P or via the launcher button).
 *
 * The panel is *type-aware* — it shows only the controls that apply
 * to the currently-selected grid type (e.g. "Cell size" appears for
 * `square` / `isometric` / `diagonal`, "Hex radius" for `hex`, etc.).
 */
export class ControlPanel {
  private root: HTMLDivElement | null = null;
  private inputs: ControlMap = {};
  private breakpointTable: HTMLTableElement | null = null;
  private rebuilding = false;
  private typedRows: TypedRow[] = [];

  mount(): void {
    if (this.root) return;
    const opts = Gridly.getOptions();
    if (!opts) return;

    const root = el("div", { class: "gridly-panel", role: "dialog" });

    // ── Title bar ────────────────────────────────────────────────────
    const title = el("div", { class: "gridly-panel__title" });
    title.appendChild(document.createTextNode("Gridly"));
    const closeBtn = el("button", { type: "button", "aria-label": "Close panel" });
    closeBtn.textContent = "\u00d7";
    closeBtn.addEventListener("click", () => Gridly.update({ showPanel: false }));
    title.appendChild(closeBtn);
    root.appendChild(title);

    // ── Scrollable body ──────────────────────────────────────────────
    const body = el("div", { class: "gridly-panel__body" });
    root.appendChild(body);

    // GRID section ----------------------------------------------------
    body.appendChild(this.section("Grid"));
    body.appendChild(this.row("Type", this.makeSelect(
      "type", TYPES, opts.type, (v) => Gridly.setType(v as GridType)
    )));
    body.appendChild(this.row("Theme", this.makeSelect(
      "theme", THEMES, opts.theme, (v) => Gridly.setTheme(v as ThemeName)
    )));
    // Device sim doesn't apply to detector (which uses real DOM coords),
    // so hide it for that type.
    body.appendChild(this.typedRow(
      TYPES.filter((t) => t !== "detector"),
      "Device",
      this.makeSelect(
        "device", DEVICE_LIST, opts.device, (v) => Gridly.update({ device: v as DevicePreset })
      )
    ));

    // LAYOUT section --------------------------------------------------
    body.appendChild(this.typedSection("Layout", "all"));

    body.appendChild(this.typedRow(COLUMN_TYPES, "Grid Overlay", this.makeNumber(
      "columns", opts.columns, 1, 24, 1,
      (v) => Gridly.update({ columns: v })
    )));
    body.appendChild(this.typedRow(COLUMN_TYPES, "Gutter", this.makeNumber(
      "gutter", opts.gutter, 0, 200, 1,
      (v) => Gridly.update({ gutter: v })
    )));
    body.appendChild(this.typedRow(["modular"], "Rows", this.makeNumber(
      "rows", opts.rows, 1, 24, 1,
      (v) => Gridly.update({ rows: v })
    )));
    body.appendChild(this.typedRow(COLUMN_TYPES, "Margin L", this.makeNumber(
      "marginLeft", opts.marginLeft, 0, 500, 1,
      (v) => Gridly.update({ marginLeft: v })
    )));
    body.appendChild(this.typedRow(COLUMN_TYPES, "Margin R", this.makeNumber(
      "marginRight", opts.marginRight, 0, 500, 1,
      (v) => Gridly.update({ marginRight: v })
    )));
    body.appendChild(this.typedRow(COLUMN_TYPES, "Max width", this.makeNumber(
      "maxWidth", opts.maxWidth, 0, 4000, 10,
      (v) => Gridly.update({ maxWidth: v })
    )));
    body.appendChild(this.typedRow(["baseline"], "Baseline", this.makeNumber(
      "baseline", opts.baseline, 2, 64, 1,
      (v) => Gridly.update({ baseline: v })
    )));

    // CELL section (per-type sizing) ----------------------------------
    body.appendChild(this.typedSection(
      "Cell",
      ["square", "isometric", "diagonal", "dots", "hex", "polar", "radial"]
    ));
    body.appendChild(this.typedRow(
      ["square", "isometric", "diagonal"], "Cell size",
      this.makeNumber("size", opts.size, 4, 400, 1, (v) => Gridly.update({ size: v }))
    ));
    body.appendChild(this.typedRow(
      ["dots"], "Spacing",
      this.makeNumber("spacing", opts.spacing, 4, 400, 1, (v) => Gridly.update({ spacing: v }))
    ));
    body.appendChild(this.typedRow(
      ["dots"], "Dot radius",
      this.makeNumber("dotRadius", opts.dotRadius, 0.5, 20, 0.5, (v) => Gridly.update({ dotRadius: v }))
    ));
    body.appendChild(this.typedRow(
      ["hex"], "Hex radius",
      this.makeNumber("hexRadius", opts.hexRadius, 6, 400, 1, (v) => Gridly.update({ hexRadius: v }))
    ));
    body.appendChild(this.typedRow(
      ["polar", "radial"], "Rings",
      this.makeNumber("rings", opts.rings, 1, 24, 1, (v) => Gridly.update({ rings: v }))
    ));
    body.appendChild(this.typedRow(
      ["polar", "radial"], "Sectors",
      this.makeNumber("sectors", opts.sectors, 2, 48, 1, (v) => Gridly.update({ sectors: v }))
    ));

    // LABELS section --------------------------------------------------
    body.appendChild(this.typedSection("Labels", COLUMN_TYPES));
    body.appendChild(this.typedRow(COLUMN_TYPES, "", this.checkboxControl(
      "showColumnNumbers", "Show gridOverlay_n", opts.showColumnNumbers,
      (v) => Gridly.update({ showColumnNumbers: v })
    )));
    body.appendChild(this.typedRow(COLUMN_TYPES, "", this.checkboxControl(
      "showGutterNumbers", "Show gutter_n", opts.showGutterNumbers,
      (v) => Gridly.update({ showGutterNumbers: v })
    )));

    // DETECTOR section -----------------------------------------------
    body.appendChild(this.typedSection("Detector", DETECTOR_TYPES));
    body.appendChild(this.typedRow(DETECTOR_TYPES, "Target", this.makeText(
      "detectorTarget", opts.detectorTarget,
      ".container, .grid",
      (v) => Gridly.update({ detectorTarget: v })
    )));
    body.appendChild(this.typedRow(DETECTOR_TYPES, "", this.checkboxControl(
      "detectorAutoScan", "Auto-scan whole page", opts.detectorAutoScan,
      (v) => Gridly.update({ detectorAutoScan: v })
    )));
    body.appendChild(this.typedRow(DETECTOR_TYPES, "", this.checkboxControl(
      "detectorShowLabels", "Show labels", opts.detectorShowLabels,
      (v) => Gridly.update({ detectorShowLabels: v })
    )));
    body.appendChild(this.typedRow(DETECTOR_TYPES, "", this.checkboxControl(
      "detectorShowItems", "Show item bounds", opts.detectorShowItems,
      (v) => Gridly.update({ detectorShowItems: v })
    )));

    // APPEARANCE section ---------------------------------------------
    body.appendChild(this.section("Appearance"));
    body.appendChild(this.row("Opacity", this.makeNumber(
      "opacity", opts.opacity, 0, 1, 0.05,
      (v) => Gridly.update({ opacity: v })
    )));
    body.appendChild(this.row("Color", this.makeColor(
      "color", opts.color ?? "",
      (v) => Gridly.update({ color: v || undefined })
    )));

    // BREAKPOINTS section --------------------------------------------
    body.appendChild(this.typedSection("Breakpoints", ["responsive"]));
    this.breakpointTable = this.buildBreakpointTable(opts.breakpoints);
    this.typedRows.push({ row: this.breakpointTable, types: ["responsive"] });
    body.appendChild(this.breakpointTable);

    const addBtn = el("button", { type: "button", class: "gridly-panel__addbp" });
    addBtn.textContent = "+ Add breakpoint";
    addBtn.addEventListener("click", () => this.addBreakpoint());
    const addBtnRow = el("div");
    addBtnRow.appendChild(addBtn);
    this.typedRows.push({ row: addBtnRow, types: ["responsive"] });
    body.appendChild(addBtnRow);

    // Hint / shortcuts ----------------------------------------------
    const hint = el("div", { class: "gridly-panel__hint" });
    hint.innerHTML =
      "<b>Ctrl+G</b> toggle &middot; <b>Ctrl+Shift+G</b> cycle type<br/>" +
      "<b>Ctrl+D</b> theme &middot; <b>Ctrl+Shift+D</b> device &middot; <b>Ctrl+P</b> panel";
    body.appendChild(hint);

    document.body.appendChild(root);
    this.root = root;

    // Apply initial visibility
    this.updateRowVisibility(opts.type);
  }

  unmount(): void {
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
    this.inputs = {};
    this.breakpointTable = null;
    this.typedRows = [];
  }

  isMounted(): boolean {
    return this.root !== null && this.root.isConnected;
  }

  /**
   * Re-syncs all input values from the current Gridly options
   * and toggles row visibility for the active grid type.
   */
  refresh(): void {
    if (!this.root || this.rebuilding) return;
    const opts = Gridly.getOptions();
    if (!opts) return;
    this.rebuilding = true;
    try {
      this.setInput("type",            opts.type);
      this.setInput("theme",           opts.theme);
      this.setInput("device",          opts.device);
      this.setInput("columns",         String(opts.columns));
      this.setInput("gutter",          String(opts.gutter));
      this.setInput("rows",            String(opts.rows));
      this.setInput("marginLeft",      String(opts.marginLeft));
      this.setInput("marginRight",     String(opts.marginRight));
      this.setInput("maxWidth",        String(opts.maxWidth));
      this.setInput("baseline",        String(opts.baseline));
      this.setInput("size",            String(opts.size));
      this.setInput("spacing",         String(opts.spacing));
      this.setInput("dotRadius",       String(opts.dotRadius));
      this.setInput("hexRadius",       String(opts.hexRadius));
      this.setInput("rings",           String(opts.rings));
      this.setInput("sectors",         String(opts.sectors));
      this.setInput("opacity",         String(opts.opacity));
      this.setInput("color",           opts.color ?? "");
      this.setCheckbox("showColumnNumbers", opts.showColumnNumbers);
      this.setCheckbox("showGutterNumbers", opts.showGutterNumbers);
      this.setInput("detectorTarget",       opts.detectorTarget ?? "");
      this.setCheckbox("detectorAutoScan",  opts.detectorAutoScan);
      this.setCheckbox("detectorShowLabels", opts.detectorShowLabels);
      this.setCheckbox("detectorShowItems",  opts.detectorShowItems);
      this.updateRowVisibility(opts.type);
    } finally {
      this.rebuilding = false;
    }
  }

  // ─── Visibility ────────────────────────────────────────────────────

  private updateRowVisibility(currentType: GridType): void {
    for (const { row, types } of this.typedRows) {
      const visible = types === "all" || types.includes(currentType);
      (row as HTMLElement).style.display = visible ? "" : "none";
    }
  }

  // ─── Internal helpers ───────────────────────────────────────────────

  private setInput(name: string, value: string): void {
    const input = this.inputs[name];
    if (input && input.value !== value) input.value = value;
  }

  private setCheckbox(name: string, checked: boolean): void {
    const input = this.inputs[name] as HTMLInputElement | undefined;
    if (input && input.checked !== checked) input.checked = checked;
  }

  private section(text: string): HTMLDivElement {
    const sec = el("div", { class: "gridly-panel__section" });
    sec.textContent = text;
    return sec;
  }

  private typedSection(text: string, types: GridType[] | "all"): HTMLDivElement {
    const sec = this.section(text);
    this.typedRows.push({ row: sec, types });
    return sec;
  }

  private row(label: string, control: HTMLElement): HTMLDivElement {
    const row = el("div", { class: "gridly-panel__row" });
    if (label) {
      const lbl = el("label");
      lbl.textContent = label;
      row.appendChild(lbl);
    }
    row.appendChild(control);
    return row;
  }

  private typedRow(types: GridType[] | "all", label: string, control: HTMLElement): HTMLDivElement {
    const row = this.row(label, control);
    this.typedRows.push({ row, types });
    return row;
  }

  private checkboxControl(
    name: string,
    label: string,
    checked: boolean,
    onChange: (v: boolean) => void
  ): HTMLDivElement {
    const wrap = el("div", { class: "gridly-panel__check" });
    const input = el("input", {
      type: "checkbox",
      id: `gridly-${name}`,
      ...(checked ? { checked: "checked" } : {})
    }) as HTMLInputElement;
    input.addEventListener("change", () => {
      if (this.rebuilding) return;
      onChange(input.checked);
    });
    const lbl = el("label", { for: `gridly-${name}` });
    lbl.textContent = label;
    wrap.appendChild(input);
    wrap.appendChild(lbl);
    this.inputs[name] = input;
    return wrap;
  }

  private makeSelect(
    name: string,
    values: string[],
    current: string,
    onChange: (v: string) => void
  ): HTMLSelectElement {
    const sel = el("select", { name });
    for (const v of values) {
      const opt = el("option", { value: v });
      opt.textContent = v;
      if (v === current) opt.setAttribute("selected", "selected");
      sel.appendChild(opt);
    }
    sel.addEventListener("change", () => {
      if (this.rebuilding) return;
      onChange((sel as HTMLSelectElement).value);
    });
    this.inputs[name] = sel;
    return sel;
  }

  private makeNumber(
    name: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (v: number) => void
  ): HTMLInputElement {
    const input = el("input", {
      type: "number",
      name,
      min, max, step,
      value: String(value)
    });
    input.addEventListener("input", () => {
      if (this.rebuilding) return;
      const n = Number((input as HTMLInputElement).value);
      if (!Number.isNaN(n)) onChange(n);
    });
    this.inputs[name] = input;
    return input;
  }

  private makeColor(
    name: string,
    value: string,
    onChange: (v: string) => void
  ): HTMLInputElement {
    const input = el("input", {
      type: "color",
      name,
      value: value || "#dc2626"
    });
    input.addEventListener("input", () => {
      if (this.rebuilding) return;
      onChange((input as HTMLInputElement).value);
    });
    this.inputs[name] = input;
    return input;
  }

  private makeText(
    name: string,
    value: string,
    placeholder: string,
    onChange: (v: string) => void
  ): HTMLInputElement {
    const input = el("input", {
      type: "text",
      name,
      placeholder,
      value: value ?? ""
    });
    input.addEventListener("input", () => {
      if (this.rebuilding) return;
      onChange((input as HTMLInputElement).value);
    });
    this.inputs[name] = input;
    return input;
  }

  // ─── Breakpoint editor ────────────────────────────────────────────

  private buildBreakpointTable(breakpoints: Breakpoint[]): HTMLTableElement {
    const table = el("table", { class: "gridly-panel__bp" }) as HTMLTableElement;
    const header = el("tr");
    for (const h of ["name", "min", "cols", "gut", "max", ""]) {
      const th = el("th"); th.textContent = h; header.appendChild(th);
    }
    table.appendChild(header);

    for (let i = 0; i < breakpoints.length; i++) {
      table.appendChild(this.buildBreakpointRow(breakpoints[i], i));
    }
    return table;
  }

  private buildBreakpointRow(bp: Breakpoint, index: number): HTMLTableRowElement {
    const row = el("tr") as HTMLTableRowElement;

    const nameCell = el("td");
    const nameInput = el("input", { type: "text", value: bp.name });
    nameInput.addEventListener("input", () => this.commitBreakpoints());
    nameCell.appendChild(nameInput);
    row.appendChild(nameCell);

    for (const key of ["minWidth", "columns", "gutter", "maxWidth"] as const) {
      const cell = el("td");
      const input = el("input", {
        type: "number",
        min: 0,
        value: String(bp[key] ?? 0)
      });
      input.dataset.bpKey = key;
      input.addEventListener("input", () => this.commitBreakpoints());
      cell.appendChild(input);
      row.appendChild(cell);
    }

    const removeCell = el("td");
    const removeBtn = el("button", { type: "button", "aria-label": "Remove" });
    removeBtn.textContent = "\u00d7";
    removeBtn.addEventListener("click", () => {
      row.remove();
      this.commitBreakpoints();
    });
    removeCell.appendChild(removeBtn);
    row.appendChild(removeCell);

    row.dataset.index = String(index);
    return row;
  }

  private addBreakpoint(): void {
    if (!this.breakpointTable) return;
    const next: Breakpoint = {
      name: "new",
      minWidth: 0,
      columns: 12,
      gutter: 24,
      maxWidth: 0
    };
    const newRow = this.buildBreakpointRow(next, this.breakpointTable.rows.length - 1);
    this.breakpointTable.appendChild(newRow);
    this.commitBreakpoints();
  }

  private commitBreakpoints(): void {
    if (!this.breakpointTable || this.rebuilding) return;
    const rows = Array.from(this.breakpointTable.rows).slice(1); // skip header
    const breakpoints: Breakpoint[] = rows.map((row) => {
      const cells = Array.from(row.cells);
      const nameInput = cells[0].querySelector("input") as HTMLInputElement;
      const inputs: Record<string, number> = {};
      for (let i = 1; i < cells.length - 1; i++) {
        const inp = cells[i].querySelector("input") as HTMLInputElement;
        inputs[inp.dataset.bpKey ?? ""] = Number(inp.value) || 0;
      }
      return {
        name: nameInput.value || "bp",
        minWidth: inputs.minWidth ?? 0,
        columns: inputs.columns ?? 12,
        gutter: inputs.gutter ?? 24,
        maxWidth: inputs.maxWidth || undefined
      };
    });
    Gridly.update({ breakpoints });
  }
}

export const controlPanel = new ControlPanel();

// Re-export device list for type cycling shortcuts
export { DEVICE_LIST, DEVICE_SPECS };
