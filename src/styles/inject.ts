/**
 * Injects the Gridly CSS into the document on first use.
 * The CSS is bundled inline so the package "just works"
 * without requiring users to import a stylesheet.
 *
 * Users who want to override styles can still import
 * "gridly/style.css" — this inline copy uses the same
 * class names.
 */
const STYLE_ID = "gridly-style";

const CSS = `
.gridly-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: var(--gridly-bg, transparent);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.gridly-overlay .gridly-surface {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.gridly-overlay .gridly-line        { stroke: var(--gridly-ink, rgba(220, 38, 38, 0.18)); stroke-width: 1; shape-rendering: crispEdges; }
.gridly-overlay .gridly-line--bold  { stroke: var(--gridly-ink-bold, rgba(220, 38, 38, 0.45)); stroke-width: 1; }
.gridly-overlay .gridly-line--accent{ stroke: var(--gridly-accent, rgba(220, 38, 38, 0.75)); stroke-width: 1.5; }
.gridly-overlay .gridly-fill        { fill:   var(--gridly-ink, rgba(220, 38, 38, 0.18)); }
.gridly-overlay .gridly-fill--bold  { fill:   var(--gridly-ink-bold, rgba(220, 38, 38, 0.45)); }
.gridly-overlay .gridly-column-fill {
  fill:   var(--gridly-ink, rgba(220, 38, 38, 0.10));
  stroke: var(--gridly-ink-bold, rgba(220, 38, 38, 0.30));
  stroke-width: 1;
}
.gridly-overlay .gridly-label {
  fill: var(--gridly-accent, rgba(220, 38, 38, 0.75));
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  user-select: none;
}

/* ── Floating launcher button ────────────────────────────────────── */
.gridly-launcher {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 2147483647;
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font: 600 12px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #f4f4f5;
  background: rgba(20, 20, 24, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
}
.gridly-launcher:hover {
  background: rgba(40, 40, 48, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
}
.gridly-launcher:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}
.gridly-launcher__label { line-height: 1; }

/* ── Floating control panel ──────────────────────────────────────── */
.gridly-panel {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 2147483647;
  pointer-events: auto;
  background: rgba(20, 20, 24, 0.94);
  color: #f4f4f5;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
  max-height: calc(100vh - 32px);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.gridly-panel__title {
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.gridly-panel__title button {
  width: 22px;
  height: 22px;
  padding: 0;
  font-size: 16px;
  line-height: 1;
}

.gridly-panel__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  padding-right: 4px;
}

.gridly-panel__section {
  margin-top: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 4px;
}
.gridly-panel__section:first-child { margin-top: 0; }

.gridly-panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.gridly-panel__row > label { opacity: 0.75; }

.gridly-panel__row--check {
  justify-content: flex-start;
  gap: 8px;
}
.gridly-panel__row--check > label { opacity: 0.9; }

.gridly-panel__check {
  display: flex;
  align-items: center;
  gap: 6px;
}
.gridly-panel__check label { opacity: 0.9; cursor: pointer; }

.gridly-panel select,
.gridly-panel input[type="number"],
.gridly-panel input[type="text"],
.gridly-panel input[type="color"] {
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 4px 6px;
  font: inherit;
  min-width: 0;
}

.gridly-panel input[type="number"],
.gridly-panel input[type="text"] {
  width: 130px;
}
.gridly-panel input[type="color"] {
  width: 40px;
  height: 26px;
  padding: 1px;
  cursor: pointer;
}
.gridly-panel select { width: 130px; }
.gridly-panel input[type="checkbox"] { width: 14px; height: 14px; cursor: pointer; }

.gridly-panel button {
  background: rgba(255, 255, 255, 0.10);
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  padding: 4px 8px;
  font: inherit;
  cursor: pointer;
}
.gridly-panel button:hover { background: rgba(255, 255, 255, 0.18); }

.gridly-panel__addbp {
  align-self: flex-start;
  font-size: 10px;
  opacity: 0.75;
}

/* ── Breakpoint editor table ────────────────────────────────────── */
.gridly-panel__bp {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}
.gridly-panel__bp th,
.gridly-panel__bp td {
  padding: 2px 3px;
  text-align: left;
  vertical-align: middle;
}
.gridly-panel__bp th {
  font-weight: 600;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.gridly-panel__bp input {
  width: 100%;
  font-size: 10px;
  padding: 2px 4px;
  min-width: 0;
}
.gridly-panel__bp td:nth-child(1) input { width: 56px; }
.gridly-panel__bp td:nth-child(n+2) input { width: 38px; }
.gridly-panel__bp td:last-child {
  width: 18px;
}
.gridly-panel__bp td:last-child button {
  padding: 0 5px;
  font-size: 11px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
}

.gridly-panel__hint {
  margin-top: 6px;
  font-size: 10px;
  opacity: 0.55;
  line-height: 1.5;
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 6px;
}
`;

let injected = false;

export function injectStyles(): void {
  if (injected) return;
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) {
    injected = true;
    return;
  }
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
  injected = true;
}

export function getCSS(): string {
  return CSS;
}
