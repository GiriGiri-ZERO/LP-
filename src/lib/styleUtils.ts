import type { GradientConfig, TextShadowConfig } from "@/types";

export function resolveBackground(solidColor: string, gradient?: GradientConfig): string {
  if (!gradient) return solidColor;
  const stops = gradient.stops.map((s) => `${s.color} ${s.position}%`).join(", ");
  return `linear-gradient(${gradient.angle}deg, ${stops})`;
}

export function resolveShadow(ts?: TextShadowConfig): string | undefined {
  if (!ts) return undefined;
  return `${ts.offsetX}px ${ts.offsetY}px ${ts.blur}px ${ts.color}`;
}
