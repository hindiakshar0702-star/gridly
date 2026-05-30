import { Gridly } from "./Gridly";

let installed = false;
let teardown: (() => void) | null = null;

/**
 * Wires up Gridly's default keyboard shortcuts:
 *   Ctrl/Cmd + G          → toggle overlay
 *   Ctrl/Cmd + Shift + G  → cycle grid type
 *   Ctrl/Cmd + D          → cycle theme (only when overlay visible)
 *   Ctrl/Cmd + P          → toggle floating control panel
 *
 * Idempotent: calling multiple times has no effect.
 * Returns a teardown function.
 */
export function initKeyboard(): () => void {
  if (typeof window === "undefined") return () => undefined;
  if (installed && teardown) return teardown;

  const handler = (event: KeyboardEvent): void => {
    const mod = event.ctrlKey || event.metaKey;
    if (!mod) return;

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

    // Cycle theme (avoid hijacking Ctrl+D bookmark when not visible)
    if (key === "d" && Gridly.isVisible()) {
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
