# Gridly

> A complete layout debugging & design inspection toolkit.
> Toggle 13+ grid types over any website with a single keyboard shortcut.

```bash
npm install gridly
```

```ts
import { Gridly } from "gridly";

Gridly.show({ type: "columns", columns: 12, gutter: 24 });
```

That's it. The grid is now overlaid on your site. Press `Ctrl+G` to toggle.

---

## Why Gridly?

Designers and frontend developers spend a lot of time eyeballing alignment.
Gridly drops a real, configurable design grid on top of your live site so you
can see *exactly* where things should snap. No browser extension required —
it's just an NPM package you import in dev.

## Features

- **13 grid types** — columns, baseline, square, dots, container, modular, golden, thirds, isometric, hex, polar, radial, responsive
- **5 themes** — `light`, `dark`, `blueprint`, `cyberpunk`, `figma` (+ `auto`)
- **Keyboard shortcuts** out of the box (Ctrl+G, Ctrl+Shift+G, Ctrl+D, Ctrl+P)
- **React adapter** — `<GridOverlay />`, `<GridBackground />`, `useGridly()`
- **Zero dependencies** in the core package
- **TypeScript** types built in
- **SVG-based** rendering — crisp at any zoom level

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + G` | Toggle overlay |
| `Ctrl/Cmd + Shift + G` | Cycle through grid types |
| `Ctrl/Cmd + D` | Cycle through themes (when visible) |
| `Ctrl/Cmd + P` | Toggle floating control panel |

## Usage

### Vanilla JS / TS

```ts
import { Gridly } from "gridly";

// Show
Gridly.show({ type: "columns", columns: 12, gutter: 24, theme: "dark" });

// Update
Gridly.update({ columns: 16 });
Gridly.setType("baseline");
Gridly.setTheme("cyberpunk");

// Toggle / hide
Gridly.toggle();
Gridly.hide();
```

### React

```tsx
import { GridOverlay } from "gridly/react";

export default function App() {
  return (
    <>
      <GridOverlay type="columns" columns={12} theme="dark" />
      <YourApp />
    </>
  );
}
```

```tsx
// Scoped grid as a section background
import { GridBackground } from "gridly/react";

<GridBackground type="dots" spacing={20} style={{ height: 320 }}>
  <Hero />
</GridBackground>
```

```tsx
// Imperative hook
import { useGridly } from "gridly/react";

useGridly({ type: "baseline", baseline: 8 });
```

### Next.js

```tsx
"use client";
import dynamic from "next/dynamic";

const GridOverlay = dynamic(
  () => import("gridly/react").then((m) => m.GridOverlay),
  { ssr: false }
);
```

## Grid Types

```ts
Gridly.show({ type: "columns",    columns: 12, gutter: 24, maxWidth: 1280 });
Gridly.show({ type: "baseline",   baseline: 8 });
Gridly.show({ type: "square",     size: 40 });
Gridly.show({ type: "dots",       spacing: 24, dotRadius: 1.5 });
Gridly.show({ type: "container",  maxWidth: 1280, margin: 32 });
Gridly.show({ type: "modular",    columns: 12, rows: 6, gutter: 24 });
Gridly.show({ type: "golden" });
Gridly.show({ type: "thirds" });
Gridly.show({ type: "isometric",  size: 40 });
Gridly.show({ type: "hex",        hexRadius: 28 });
Gridly.show({ type: "polar",      rings: 6, sectors: 12 });
Gridly.show({ type: "radial",     rings: 6, sectors: 12, showNumbers: true });
Gridly.show({ type: "responsive" }); // auto-detects breakpoint
```

## Themes

```ts
Gridly.setTheme("light");      // default red on transparent
Gridly.setTheme("dark");       // blue on transparent
Gridly.setTheme("blueprint");  // white on blue (CAD vibe)
Gridly.setTheme("cyberpunk");  // pink/cyan/yellow on dark
Gridly.setTheme("figma");      // soft blue
Gridly.setTheme("auto");       // follows prefers-color-scheme
```

You can also override the ink color directly:

```ts
Gridly.show({ color: "#ff00aa", opacity: 0.5 });
```

## Custom Stylesheet (optional)

The CSS is bundled inline and injected on first use, so you don't need to
import a stylesheet. If you want to override the default styles or use SSR,
import the standalone CSS:

```ts
import "gridly/style.css";
```

All classes are prefixed with `gridly-` and CSS variables (`--gridly-ink`,
`--gridly-ink-bold`, `--gridly-accent`, `--gridly-bg`) can be overridden.

## API

### `Gridly` singleton

| Method | Description |
|--------|-------------|
| `show(options?)` | Mount overlay (or update if already mounted). |
| `hide()` | Unmount overlay. |
| `toggle(options?)` | Show if hidden, hide if shown. |
| `isVisible()` | Returns `true` when mounted. |
| `update(patch)` | Patch options on the live overlay. |
| `setType(type)` | Switch grid type. |
| `setTheme(theme)` | Switch theme. |
| `cycleType(dir?)` | Step through `TYPE_CYCLE` (default forward). |
| `cycleTheme(dir?)` | Step through `THEME_CYCLE`. |
| `getOptions()` | Returns the resolved options of the live overlay. |

### `GridlyOptions`

See [`src/types/index.ts`](./src/types/index.ts) for the full type. Highlights:

```ts
interface GridlyOptions {
  type?: GridType;
  theme?: ThemeName;
  color?: string;
  opacity?: number;        // 0..1
  zIndex?: number;
  showPanel?: boolean;
  keyboard?: boolean;

  // Column / container / modular
  columns?: number;
  gutter?: number;
  margin?: number;
  maxWidth?: number;
  rows?: number;

  // Baseline
  baseline?: number;

  // Square / dots / isometric
  size?: number;
  spacing?: number;
  dotRadius?: number;

  // Hex
  hexRadius?: number;

  // Polar / radial
  rings?: number;
  sectors?: number;

  // Responsive
  breakpoints?: Breakpoint[];

  showNumbers?: boolean;
}
```

## Roadmap

- Browser extension (Chrome / Firefox)
- Figma plugin parity
- VS Code extension for codebase-wide layout linting
- Vue + Svelte adapters
- Layout recording / preset sharing
- AI layout suggestions

## Contributing

```bash
git clone https://github.com/hindiakshar0702-star/gridly.git
cd gridly
npm install
npm run dev
```

## License

MIT
