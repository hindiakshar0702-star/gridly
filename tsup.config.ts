import { defineConfig } from "tsup";

export default defineConfig([
  // Core (vanilla) bundle
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "es2020",
    splitting: false,
    treeshake: true,
    minify: false,
    injectStyle: false,
    loader: { ".css": "copy" },
    outDir: "dist"
  },
  // React adapter bundle
  {
    entry: { "react/index": "src/react/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    target: "es2020",
    splitting: false,
    treeshake: true,
    external: ["react", "react-dom"],
    outDir: "dist"
  }
]);
