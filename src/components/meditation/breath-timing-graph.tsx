import { TimeRing } from "@/components/meditation/time-ring";
import type { BreathCycle } from "@/components/meditation/use-breath-cycle";
import type { BreathPhase, BreathingPattern } from "@/lib/breathing";
import { cn } from "@/lib/utils";

const PHASES: { id: BreathPhase; label: string }[] = [
  { id: "in", label: "Inhale" },
  { id: "holdIn", label: "Hold" },
  { id: "out", label: "Exhale" },
  { id: "holdOut", label: "Rest" },
];

type Props = {
  pattern: BreathingPattern;
  cycle: BreathCycle;
  running: boolean;
};

export function BreathTimingGraph({ pattern, cycle, running }: Props) {
  const phases = PHASES.filter((p) => durationOf(pattern, p.id) > 0);
  const compact = phases.length > 2;

  return (
    <div
      className="flex items-end justify-center gap-6"
      aria-label="Breathing timings"
    >
      {phases.map((p) => {
        const total = durationOf(pattern, p.id);
        const active = running && cycle.phase === p.id;
        const fill = active ? cycle.remaining / Math.max(1, cycle.seconds) : 1;
        return (
          <div key={p.id} className="flex flex-col items-center gap-2">
            <TimeRing
              progress={fill}
              size={compact ? 64 : 84}
              trackClassName="text-border"
              fillClassName={active ? "text-accent" : "text-lavender"}
            />
            <p
              className={cn(
                "font-display text-2xl tabular-nums leading-none",
                active && "text-accent",
              )}
            >
              {total}s
            </p>
            <p
              className={cn(
                "text-xs tracking-wide text-muted",
                active && "text-accent",
              )}
            >
              {p.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function durationOf(pattern: BreathingPattern, phase: BreathPhase) {
  if (phase === "in") return pattern.inhale;
  if (phase === "holdIn") return pattern.holdIn;
  if (phase === "out") return pattern.exhale;
  return pattern.holdOut;
}
