/**
 * Example React usage. Drop into any Vite/Next.js app.
 *
 *   npm install gridly react react-dom
 */
import { useState } from "react";
import { GridOverlay, GridBackground, useGridly } from "gridly/react";
import type { GridType, ThemeName } from "gridly/react";

export default function App(): JSX.Element {
  const [type, setType] = useState<GridType>("columns");
  const [theme, setTheme] = useState<ThemeName>("light");
  const [enabled, setEnabled] = useState(true);

  return (
    <div style={{ fontFamily: "system-ui", padding: 32 }}>
      <h1>Gridly + React</h1>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <select value={type} onChange={(e) => setType(e.target.value as GridType)}>
          {[
            "columns","baseline","square","dots","container","modular",
            "golden","thirds","isometric","hex","polar","radial","responsive"
          ].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeName)}>
          {["light","dark","blueprint","cyberpunk","figma","auto"].map((t) =>
            <option key={t} value={t}>{t}</option>
          )}
        </select>

        <button onClick={() => setEnabled((v) => !v)}>
          {enabled ? "Hide" : "Show"} overlay
        </button>
      </div>

      {/* Global overlay */}
      <GridOverlay type={type} theme={theme} enabled={enabled} columns={12} />

      {/* Scoped grid background */}
      <GridBackground
        type="dots"
        theme={theme}
        spacing={20}
        style={{ height: 240, borderRadius: 12 }}
      >
        <div style={{ padding: 24 }}>
          <h2>Scoped grid background</h2>
          <p>The dot grid is rendered inside this card only.</p>
        </div>
      </GridBackground>

      <DemoChild />
    </div>
  );
}

function DemoChild() {
  // Imperative hook example
  useGridly({ type: "baseline", baseline: 8 }, false);
  return null;
}
