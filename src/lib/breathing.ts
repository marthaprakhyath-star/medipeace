import type { BreathingPattern, BreathingPatternId } from "@/lib/types";

export type { BreathingPattern, BreathingPatternId } from "@/lib/types";

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: "relax",
    name: "Relax",
    inhale: 4,
    holdIn: 0,
    exhale: 6,
    holdOut: 0,
    premium: false,
    summary: "4s in · 6s out",
  },
  {
    id: "box",
    name: "Box Breathing",
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    premium: false,
    summary: "4 · 4 · 4 · 4",
  },
  {
    id: "balanced",
    name: "Balanced",
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    premium: false,
    summary: "5s in · 5s out",
  },
  {
    id: "calm478",
    name: "4-7-8",
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    premium: true,
    summary: "4 in · 7 hold · 8 out",
  },
  {
    id: "deep",
    name: "Deep Calm",
    inhale: 6,
    holdIn: 2,
    exhale: 8,
    holdOut: 0,
    premium: true,
    summary: "6 · 2 · 8",
  },
];

export function getBreathingPattern(id: BreathingPatternId): BreathingPattern {
  return BREATHING_PATTERNS.find((p) => p.id === id) ?? BREATHING_PATTERNS[0];
}

export type BreathPhase = "in" | "holdIn" | "out" | "holdOut";

export function phaseLabel(phase: BreathPhase): string {
  switch (phase) {
    case "in":
      return "Breathe In";
    case "holdIn":
      return "Hold";
    case "out":
      return "Breathe Out";
    case "holdOut":
      return "Hold";
  }
}

export function nextPhase(
  pattern: BreathingPattern,
  phase: BreathPhase,
): { phase: BreathPhase; seconds: number } {
  const order: BreathPhase[] = ["in", "holdIn", "out", "holdOut"];
  const durations: Record<BreathPhase, number> = {
    in: pattern.inhale,
    holdIn: pattern.holdIn,
    out: pattern.exhale,
    holdOut: pattern.holdOut,
  };
  let i = order.indexOf(phase);
  for (let n = 0; n < 4; n += 1) {
    i = (i + 1) % 4;
    const next = order[i];
    if (durations[next] > 0) return { phase: next, seconds: durations[next] };
  }
  return { phase: "in", seconds: pattern.inhale };
}

export function firstPhase(pattern: BreathingPattern): {
  phase: BreathPhase;
  seconds: number;
} {
  return nextPhase(pattern, "holdOut");
}
