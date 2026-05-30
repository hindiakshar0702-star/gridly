# Gridly

> A complete layout debugging & design inspection toolkit.
> 18 grid types, 5 themes, device simulator, and a one-click control panel.

```bash
npm install gridly
```

```ts
import "gridly";
// That's it. A floating "Gridly" button appears bottom-left.
// Click it to open the panel and start designing.
```

…or do it imperatively:

```ts
import { Gridly } from "gridly";

Gridly.show({
  type: "columns",
  columns: 12,
  gutter: 24,
  marginLeft: 32,
  marginRight: 32,
  showColumnNumbers: true,
  showGutterNumbers: true,
  device: "tablet"
});
```

---

## What's new in v0.2.0

- 🟢 **One-click launcher button** — auto-mounts in browsers, click to open the full panel
- 🟢 **5 new grid types** — `flex`, `fibonacci`, `diagonal`, `percentage`, `bootstrap` (now 18 total)
- 🟢 **Asymmetric margins** — `marginLeft` and `marginRight` (with `margin` as fallback)
- 🟢 **Numbered labels** — toggle `gridOverlay_0, gridOverlay_1, …` and `gutter_0, gutter_1, …`
- 🟢 **Device simulator** — preview your site at `mobile` (375), `tablet` (768), `laptop` (1366), `desktop` (1920)
- 🟢 **Live breakpoint editor** — add / remove / edit breakpoints right inside the panel
- 🟢 **Color picker, opacity slider** — built into the panel

## Features at a glance

- **18 grid types**
  | | | |
  |---|---|---|
  | `columns` | `baseline` | `square` |
  | `dots` | `container` | `modular` |
  | `golden` | `thirds` | `isometric` |
  | `hex` | `polar` | `radial` |
  | `responsive` | `flex` | `fibonacci` |
  | `diagonal` | `percentage` | `bootstrap` |
- **5 themes** — `light`, `dark`, `blueprint`, `cyberpunk`, `figma` (+ `auto`)
- **4 device simulators** — `mobile`, `tablet`, `laptop`, `desktop`
- **One-click launcher button** with full control panel
- **Keyboard shortcuts** out of the box
- **React adapter** — `<GridOverlay />`, `<GridBackground />`, `useGridly()`
- **Zero runtime dependencies**, TypeScript types built in

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + G` | Toggle overlay |
| `Ctrl/Cmd + Shift + G` | Cycle grid type |
| `Ctrl/Cmd + D` | Cycle theme |
| `Ctrl/Cmd + Shift + D` | Cycle device simulator |
| `Ctrl/Cmd + P` | Toggle control panel |

## Control Panel

Click the launcher button (or press `Ctrl+P` once the overlay is shown) to open the panel:

| Section | Controls |
|---------|----------|
| **Grid** | Type · Theme · Device |
| **Layout** | Grid Overlay (columns) · Gutter · Margin L · Margin R · Max width · Baseline |
| **Labels** | Show `gridOverlay_n` · Show `gutter_n` |
| **Appearance** | Opacity · Color picker |
| **Breakpoints** | Editable table — add / remove / tweak each breakpoint live |

## Usage

### Vanilla JS / TS

```ts
import { Gridly } from "gridly";

// Show
Gridly.show({
  type: "columns",
  columns: 12,
  gutter: 24,
  marginLeft: 40,
  marginRight: 40,
  maxWidth: 1280,
  showColumnNumbers: true,   // gridOverlay_0, gridOverlay_1, ...
  showGutterNumbers: true,   // gutter_0, gutter_1, ...
  theme: "blueprint",
  device: "tablet"
});

// Update
Gridly.update({ columns: 16 });
Gridly.setType("baseline");
Gridly.setTheme("cyberpunk");
Gridly.setDevice("mobile");

// Toggle / hide
Gridly.toggle();
Gridly.hide();

// Hide the launcher entirely
Gridly.hideLauncher();
```

### React

```tsx
import { GridOverlay } from "gridly/react";

export default function App() {
  return (
    <>
      <GridOverlay
        type="columns"
        columns={12}
        marginLeft={40}
        marginRight={40}
        showColumnNumbers
        showGutterNumbers
        device="laptop"
      />
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
Gridly.show({ type: "columns",    columns: 12, gutter: 24, marginLeft: 40, marginRight: 40 });
Gridly.show({ type: "baseline",   baseline: 8 });
Gridly.show({ type: "square",     size: 40 });
Gridly.show({ type: "dots",       spacing: 24, dotRadius: 1.5 });
Gridly.show({ type: "container",  maxWidth: 1280 });
Gridly.show({ type: "modular",    columns: 12, rows: 6 });
Gridly.show({ type: "golden" });
Gridly.show({ type: "thirds" });
Gridly.show({ type: "isometric",  size: 40 });
Gridly.show({ type: "hex",        hexRadius: 28 });
Gridly.show({ type: "polar",      rings: 6, sectors: 12 });
Gridly.show({ type: "radial",     rings: 6, sectors: 12, showNumbers: true });
Gridly.show({ type: "responsive" });   // auto-detects breakpoint
Gridly.show({ type: "flex" });         // alignment guides
Gridly.show({ type: "fibonacci" });    // phi spiral
Gridly.show({ type: "diagonal" });     // 45-deg cross-hatch
Gridly.show({ type: "percentage" });   // 10/25/50/75% guides
Gridly.show({ type: "bootstrap" });    // Bootstrap container widths
```

## Device Simulator

```ts
Gridly.setDevice("mobile");    // 375 × 812
Gridly.setDevice("tablet");    // 768 × 1024
Gridly.setDevice("laptop");    // 1366 × 768
Gridly.setDevice("desktop");   // 1920 × 1080
Gridly.setDevice("responsive"); // off — full viewport
```

A dimmed letterbox masks anything outside the simulated viewport, and a
labeled frame shows the device dimensions. The grid renders inside the
simulated viewport — perfect for sanity-checking responsive breakpoints.

## Themes

```ts
Gridly.setTheme("light");      // default red on transparent
Gridly.setTheme("dark");       // blue on transparent
Gridly.setTheme("blueprint");  // white on blue (CAD vibe)
Gridly.setTheme("cyberpunk");  // pink/cyan/yellow on dark
Gridly.setTheme("figma");      // soft blue
Gridly.setTheme("auto");       // follows prefers-color-scheme
```

You can also override the ink color directly via the panel color picker
or:

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
| `setDevice(device)` | Switch device simulator. |
| `cycleType(dir?)` | Step through `TYPE_CYCLE`. |
| `cycleTheme(dir?)` | Step through `THEME_CYCLE`. |
| `cycleDevice(dir?)` | Step through `DEVICE_CYCLE`. |
| `showLauncher()` | Mount the launcher button. |
| `hideLauncher()` | Unmount the launcher button. |
| `getOptions()` | Returns the resolved options of the live overlay. |

See [`src/types/index.ts`](./src/types/index.ts) for the full `GridlyOptions` type.

## Roadmap

- Browser extension (Chrome / Firefox)
- Figma plugin parity
- VS Code extension for codebase-wide layout linting
- Vue + Svelte adapters
- Layout recording / preset sharing
- AI layout suggestions

## License

MIT
