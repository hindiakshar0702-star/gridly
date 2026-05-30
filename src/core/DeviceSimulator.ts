import type { DevicePreset, DeviceSpec, ResolvedOptions } from "../types";
import { svg } from "../utils/createElement";

/**
 * Built-in device presets used by the simulator.
 * Widths are typical viewport widths in CSS pixels.
 */
export const DEVICE_SPECS: Record<DevicePreset, DeviceSpec | null> = {
  responsive: null,
  mobile:  { key: "mobile",  label: "Mobile",  width: 375,  height: 812  },
  tablet:  { key: "tablet",  label: "Tablet",  width: 768,  height: 1024 },
  laptop:  { key: "laptop",  label: "Laptop",  width: 1366, height: 768  },
  desktop: { key: "desktop", label: "Desktop", width: 1920, height: 1080 }
};

export const DEVICE_LIST: DevicePreset[] = [
  "responsive", "mobile", "tablet", "laptop", "desktop"
];

export interface SimulationResult {
  /** True when device simulation is active (not "responsive"). */
  active: boolean;
  /** Effective drawing width for grid renderers. */
  width: number;
  /** Effective drawing height. */
  height: number;
  /** Horizontal offset used to center the simulated viewport. */
  offsetX: number;
  /** The matched DeviceSpec, or null when responsive. */
  spec: DeviceSpec | null;
}

/**
 * Compute the effective rendering rectangle given the current options.
 * If `device` is "responsive", returns full viewport dims with offsetX=0.
 */
export function computeSimulation(
  options: ResolvedOptions,
  fullWidth: number,
  fullHeight: number
): SimulationResult {
  const spec = DEVICE_SPECS[options.device];
  if (!spec) {
    return {
      active: false,
      width: fullWidth,
      height: fullHeight,
      offsetX: 0,
      spec: null
    };
  }

  // Cap the simulated width to the actual viewport so it stays visible.
  const simWidth = Math.min(spec.width, fullWidth);
  const offsetX = Math.max(0, (fullWidth - simWidth) / 2);

  return {
    active: true,
    width: simWidth,
    height: fullHeight,
    offsetX,
    spec
  };
}

/**
 * Draws the dimmed letterbox bands on either side of the simulated viewport
 * plus the device frame outline + label.
 *
 * Should be called *before* the grid renders so the grid sits on top of
 * the letterbox but underneath the frame border.
 */
export function drawDeviceBackdrop(
  host: SVGElement,
  sim: SimulationResult,
  fullWidth: number,
  fullHeight: number
): void {
  if (!sim.active || !sim.spec) return;

  // Left letterbox
  host.appendChild(svg("rect", {
    x: 0, y: 0, width: sim.offsetX, height: fullHeight,
    fill: "rgba(0,0,0,0.55)"
  }));
  // Right letterbox
  host.appendChild(svg("rect", {
    x: sim.offsetX + sim.width, y: 0,
    width: fullWidth - sim.offsetX - sim.width, height: fullHeight,
    fill: "rgba(0,0,0,0.55)"
  }));
}

export function drawDeviceFrame(
  host: SVGElement,
  sim: SimulationResult,
  _fullWidth: number,
  fullHeight: number
): void {
  if (!sim.active || !sim.spec) return;

  // Frame border
  host.appendChild(svg("rect", {
    x: sim.offsetX + 0.5, y: 0.5,
    width: sim.width - 1, height: fullHeight - 1,
    fill: "none",
    stroke: "rgba(255,255,255,0.85)",
    "stroke-width": 1.5
  }));

  // Device label badge
  const labelW = 170;
  host.appendChild(svg("rect", {
    x: sim.offsetX + 12, y: fullHeight - 36,
    width: labelW, height: 24, rx: 4,
    fill: "rgba(0,0,0,0.7)"
  }));
  host.appendChild(svg("text", {
    x: sim.offsetX + 22, y: fullHeight - 19,
    fill: "white",
    "font-family": "ui-monospace, Menlo, Consolas, monospace",
    "font-size": 11,
    "font-weight": 600
  }, [`${sim.spec.label} \u00b7 ${sim.spec.width}\u00d7${sim.spec.height ?? "auto"}`]));
}
