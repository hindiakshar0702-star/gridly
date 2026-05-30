#!/usr/bin/env node
/**
 * Copy the source CSS into dist/ so consumers can `import "gridly/style.css"`.
 * Runs as a post-step after `tsup`.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "..", "src", "styles", "gridly.css");
const dest = resolve(here, "..", "dist", "gridly.css");

await mkdir(dirname(dest), { recursive: true });
await copyFile(src, dest);

console.log(`[gridly] copied ${src} -> ${dest}`);
