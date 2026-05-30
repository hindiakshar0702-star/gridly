import type { ThemeName } from "../types";

/**
 * Theme color palettes used as CSS custom properties on the overlay root.
 * Each value is an "ink" color used for grid lines.
 */
export const THEMES: Record<Exclude<ThemeName, "auto">, {
  ink: string;
  inkBold: string;
  accent: string;
  bg: string;
}> = {
  light: {
    ink:     "rgba(220, 38, 38, 0.18)",
    inkBold: "rgba(220, 38, 38, 0.45)",
    accent:  "rgba(220, 38, 38, 0.75)",
    bg:      "transparent"
  },
  dark: {
    ink:     "rgba(96, 165, 250, 0.22)",
    inkBold: "rgba(96, 165, 250, 0.55)",
    accent:  "rgba(96, 165, 250, 0.85)",
    bg:      "transparent"
  },
  blueprint: {
    ink:     "rgba(255, 255, 255, 0.22)",
    inkBold: "rgba(255, 255, 255, 0.55)",
    accent:  "rgba(255, 255, 255, 0.9)",
    bg:      "rgba(15, 76, 129, 0.85)"
  },
  cyberpunk: {
    ink:     "rgba(255, 0, 200, 0.30)",
    inkBold: "rgba(0, 255, 220, 0.65)",
    accent:  "rgba(255, 230, 0, 0.95)",
    bg:      "rgba(10, 0, 20, 0.65)"
  },
  figma: {
    ink:     "rgba(24, 160, 251, 0.20)",
    inkBold: "rgba(24, 160, 251, 0.55)",
    accent:  "rgba(24, 160, 251, 0.85)",
    bg:      "transparent"
  }
};

export function resolveTheme(theme: ThemeName): Exclude<ThemeName, "auto"> {
  if (theme !== "auto") return theme;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

export function applyThemeVars(host: HTMLElement, theme: ThemeName): void {
  const resolved = resolveTheme(theme);
  const palette = THEMES[resolved];
  host.style.setProperty("--gridly-ink", palette.ink);
  host.style.setProperty("--gridly-ink-bold", palette.inkBold);
  host.style.setProperty("--gridly-accent", palette.accent);
  host.style.setProperty("--gridly-bg", palette.bg);
  host.dataset.gridlyTheme = resolved;
}
