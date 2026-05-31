/**
 * Grid Detector — finds elements on the page that use CSS Grid
 * or Flexbox and extracts their layout structure (track sizes,
 * gaps, child positions) for live overlay visualization.
 *
 * Public API:
 *   detectGrid(element)       → DetectedGrid | null
 *   detectAllGrids(root?)     → DetectedGrid[]
 *   resolveTargets(selector)  → HTMLElement[]
 */

export type DetectedDisplay =
  | "grid"
  | "inline-grid"
  | "flex"
  | "inline-flex";

export interface DetectedRect {
  /** Page-relative top-left in CSS pixels (does NOT include scroll offset). */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedItem {
  rect: DetectedRect;
  /** Bounding rect *relative to the parent grid* (origin = grid top-left). */
  relX: number;
  relY: number;
  width: number;
  height: number;
}

export interface DetectedGrid {
  /** The element being inspected. */
  element: HTMLElement;
  /** Best-effort CSS selector that resolves back to this element. */
  selector: string;
  /** Container bounding rect in viewport coords (page-relative, no scroll). */
  rect: DetectedRect;
  /** Computed `display` value. */
  display: DetectedDisplay;

  // Grid-specific (undefined for flex containers)
  /** Number of resolved column tracks. */
  columns?: number;
  /** Number of resolved row tracks. */
  rows?: number;
  /** Resolved column track sizes in px. */
  colSizes?: number[];
  /** Resolved row track sizes in px. */
  rowSizes?: number[];
  /** Column gap in px. */
  colGap: number;
  /** Row gap in px. */
  rowGap: number;

  // Flex-specific (undefined for grid containers)
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;

  /** Padding on each side of the container. */
  padding: { top: number; right: number; bottom: number; left: number };

  /** Child elements with positions relative to the container. */
  items: DetectedItem[];
}

/**
 * Inspect a single element. Returns null if the element doesn't
 * use grid or flex layout, or if the element is not in the document.
 *
 * Skips Gridly's own UI elements (overlay, panel, launcher) so the
 * detector doesn't recursively detect itself.
 */
export function detectGrid(el: HTMLElement): DetectedGrid | null {
  if (typeof window === "undefined" || !el.isConnected) return null;
  if (isGridlyUI(el)) return null;

  const styles = window.getComputedStyle(el);
  const display = styles.display as DetectedDisplay;

  const isGrid = display === "grid" || display === "inline-grid";
  const isFlex = display === "flex" || display === "inline-flex";
  if (!isGrid && !isFlex) return null;

  const rect = el.getBoundingClientRect();
  // Skip degenerate / invisible boxes
  if (rect.width < 2 || rect.height < 2) return null;

  const padding = {
    top:    parseFloat(styles.paddingTop)    || 0,
    right:  parseFloat(styles.paddingRight)  || 0,
    bottom: parseFloat(styles.paddingBottom) || 0,
    left:   parseFloat(styles.paddingLeft)   || 0
  };

  const colGap = parseFloat(styles.columnGap) || parseFloat(styles.gap) || 0;
  const rowGap = parseFloat(styles.rowGap)    || parseFloat(styles.gap) || 0;

  const items = collectItems(el, rect);

  const result: DetectedGrid = {
    element: el,
    selector: getElementSelector(el),
    rect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
    display,
    colGap,
    rowGap,
    padding,
    items
  };

  if (isGrid) {
    const colSizes = parseTrackList(styles.gridTemplateColumns);
    const rowSizes = parseTrackList(styles.gridTemplateRows);
    result.columns = colSizes.length;
    result.rows = rowSizes.length;
    result.colSizes = colSizes;
    result.rowSizes = rowSizes;
  } else {
    result.flexDirection = styles.flexDirection;
    result.justifyContent = styles.justifyContent;
    result.alignItems = styles.alignItems;
  }

  return result;
}

/**
 * Find every grid / flex container under `root` (default: document).
 * Caps results at `limit` to avoid blowing up huge pages.
 */
export function detectAllGrids(
  root: ParentNode = typeof document !== "undefined" ? document : (null as unknown as ParentNode),
  limit = 200
): DetectedGrid[] {
  if (!root) return [];
  const out: DetectedGrid[] = [];
  // querySelectorAll('*') is broad but we filter in detectGrid().
  const candidates = (root as ParentNode).querySelectorAll<HTMLElement>("*");
  for (let i = 0; i < candidates.length; i++) {
    const detected = detectGrid(candidates[i]);
    if (detected) {
      out.push(detected);
      if (out.length >= limit) break;
    }
  }
  return out;
}

/**
 * Resolve a (possibly comma-separated) selector string to a list of
 * matching elements. Invalid selectors are silently skipped.
 */
export function resolveTargets(selector: string): HTMLElement[] {
  if (typeof document === "undefined") return [];
  const list = selector
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const found: HTMLElement[] = [];
  for (const sel of list) {
    try {
      const els = document.querySelectorAll<HTMLElement>(sel);
      els.forEach((e) => found.push(e));
    } catch {
      // Bad selector — ignore.
    }
  }
  return found;
}

/**
 * Build a best-effort CSS selector path that uniquely identifies an
 * element. Falls back to tag + class chain if no id is available.
 */
export function getElementSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  const parts: string[] = [];
  let node: HTMLElement | null = el;
  let depth = 0;
  while (node && node.nodeType === 1 && depth < 4) {
    let part = node.tagName.toLowerCase();
    const classes = (node.className && typeof node.className === "string"
      ? node.className.split(/\s+/).filter(Boolean).slice(0, 2)
      : []);
    if (classes.length) part += "." + classes.join(".");
    parts.unshift(part);
    if (node.id) {
      parts[0] = `#${node.id}`;
      break;
    }
    node = node.parentElement;
    depth++;
  }
  return parts.join(" > ");
}

// ─── Internal helpers ────────────────────────────────────────────────

/**
 * True when the element is part of Gridly's own UI (overlay surface,
 * floating panel, or launcher button). Used to avoid the detector
 * recursively reporting its own host elements.
 */
function isGridlyUI(el: Element): boolean {
  return el.closest(".gridly-overlay, .gridly-panel, .gridly-launcher") !== null;
}

/**
 * Parse a computed `grid-template-columns` / `rows` value into pixel sizes.
 * Computed values are always in px, e.g. "100px 250.5px 100px".
 * Returns an empty array when the value is "none" or unparseable.
 */
function parseTrackList(value: string): number[] {
  if (!value || value === "none") return [];
  // Computed value uses spaces between tracks; bracketed line names like
  // "[col-start] 100px [col-end]" need to be stripped.
  const cleaned = value.replace(/\[[^\]]*\]/g, " ");
  const parts = cleaned.trim().split(/\s+/);
  const out: number[] = [];
  for (const p of parts) {
    const n = parseFloat(p);
    if (!Number.isNaN(n)) out.push(n);
  }
  return out;
}

function collectItems(parent: HTMLElement, parentRect: DOMRect): DetectedItem[] {
  const out: DetectedItem[] = [];
  const children = parent.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    if (!(child instanceof HTMLElement)) continue;
    const cs = window.getComputedStyle(child);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const r = child.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    out.push({
      rect: { x: r.left, y: r.top, width: r.width, height: r.height },
      relX: r.left - parentRect.left,
      relY: r.top - parentRect.top,
      width: r.width,
      height: r.height
    });
  }
  return out;
}
