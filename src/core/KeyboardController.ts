import { Gridly } from "./Gridly";

let installed = false;
let teardown: (() => void) | null = null;

/**
 * Wires up Gridly's default keyboard shortcuts:
 *   Ctrl/Cmd + G          → toggle overlay
 *   Ctrl/Cmd + Shift + G  → cycle grid type
 *   Ctrl/Cmd + D          → cycle theme (only when overlay visible)
 *   Ctrl/Cmd + Shift + D  → cycle device simulator
 *   Ctrl/Cmd + P          → toggle floating control panel
 *
 * Idempotent: calling multiple times has no effect.
 * Returns a teardown function.
 *
 * Shortcuts are deliberately suppressed when the keyboard event
 * targets an editable element (input, textarea, select,
 * contenteditable) UNLESS the editable element is inside the
 * Gridly panel itself — so users can still close the panel
 * with Ctrl+P while the target input is focused.
 */
export function initKeyboard(): () => void {
  if (typeof window === "undefined") return () => undefined;
  if (installed && teardown) return teardown;

  const handler = (event: KeyboardEvent): void => {
    const mod = event.ctrlKey || event.metaKey;
    if (!mod) return;

    if (isEditableTarget(event.target) && !isInsideGridlyPanel(event.target)) {
      // User is typing on the host page — don't hijack their shortcuts.
      return;
    }

    const key = event.key.toLowerCase();

    // Toggle overlay
    if (key === "g" && !event.shiftKey) {
      event.preventDefault();
      Gridly.toggle();
      return;
    }

    // Cycle grid type
    if (key === "g" && event.shiftKey) {
      event.preventDefault();
      if (!Gridly.isVisible()) Gridly.show();
      Gridly.cycleType(1);
      return;
    }

    // Cycle device simulator
    if (key === "d" && event.shiftKey && Gridly.isVisible()) {
      event.preventDefault();
      Gridly.cycleDevice(1);
      return;
    }

    // Cycle theme (avoid hijacking Ctrl+D bookmark when not visible)
    if (key === "d" && !event.shiftKey && Gridly.isVisible()) {
      event.preventDefault();
      Gridly.cycleTheme(1);
      return;
    }

    // Toggle panel
    if (key === "p" && Gridly.isVisible()) {
      event.preventDefault();
      const opts = Gridly.getOptions();
      Gridly.update({ showPanel: !(opts?.showPanel ?? false) });
      return;
    }
  };

  window.addEventListener("keydown", handler, { capture: true });
  installed = true;
  teardown = () => {
    window.removeEventListener("keydown", handler, { capture: true });
    installed = false;
    teardown = null;
  };
  return teardown;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function isInsideGridlyPanel(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.closest(".gridly-panel") !== null;
}
