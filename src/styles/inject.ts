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

.gridly-overlay .gridly-line {
  stroke: var(--gridly-ink, rgba(220, 38, 38, 0.18));
  stroke-width: 1;
  shape-rendering: crispEdges;
}

.gridly-overlay .gridly-line--bold {
  stroke: var(--gridly-ink-bold, rgba(220, 38, 38, 0.45));
  stroke-width: 1;
}

.gridly-overlay .gridly-line--accent {
  stroke: var(--gridly-accent, rgba(220, 38, 38, 0.75));
  stroke-width: 1.5;
}

.gridly-overlay .gridly-fill {
  fill: var(--gridly-ink, rgba(220, 38, 38, 0.18));
}

.gridly-overlay .gridly-fill--bold {
  fill: var(--gridly-ink-bold, rgba(220, 38, 38, 0.45));
}

.gridly-overlay .gridly-column-fill {
  fill: var(--gridly-ink, rgba(220, 38, 38, 0.10));
  stroke: var(--gridly-ink-bold, rgba(220, 38, 38, 0.30));
  stroke-width: 1;
}

.gridly-overlay .gridly-label {
  fill: var(--gridly-accent, rgba(220, 38, 38, 0.75));
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  user-select: none;
}

/* Floating control panel */
.gridly-panel {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 2147483647;
  pointer-events: auto;
  background: rgba(20, 20, 24, 0.92);
  color: #f4f4f5;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  display: grid;
  gap: 8px;
  min-width: 220px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.gridly-panel__title {
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 10px;
  opacity: 0.75;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gridly-panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.gridly-panel__row label {
  opacity: 0.75;
}

.gridly-panel select,
.gridly-panel input[type="number"] {
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 4px 6px;
  font: inherit;
  min-width: 110px;
}

.gridly-panel button {
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  padding: 4px 8px;
  font: inherit;
  cursor: pointer;
}

.gridly-panel button:hover {
  background: rgba(255, 255, 255, 0.18);
}

.gridly-panel__hint {
  font-size: 10px;
  opacity: 0.55;
  line-height: 1.5;
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
