import type { BreathCycle } from "@/components/meditation/use-breath-cycle";
import { phaseLabel, type BreathingPattern } from "@/lib/breathing";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Props = {
  pattern: BreathingPattern;
  cycle: BreathCycle;
  running: boolean;
  size?: "session" | "hero";
  showLabel?: boolean;
  sessionProgress?: number;
};

export function BreathingCircle({
  pattern,
  cycle,
  running,
  size = "session",
  showLabel = true,
  sessionProgress,
}: Props) {
  const reduce = useReducedMotion();
  const expanding = cycle.phase === "in";
  const holding = cycle.phase === "holdIn" || cycle.phase === "holdOut";
  const scale = reduce
    ? 1
    : expanding || (holding && cycle.phase === "holdIn")
      ? 1
      : 0.72;
  const duration = reduce ? 0 : cycle.seconds;
  const left = Math.max(1, Math.ceil(cycle.remaining));
  const rPhase = 40;
  const rSession = 46;
  const phaseLen = 2 * Math.PI * rPhase;
  const sessionLen = 2 * Math.PI * rSession;
  const phaseRemain = running ? 1 - cycle.progress : 1;
  const sessionRemain =
    sessionProgress == null ? 1 : Math.min(1, Math.max(0, sessionProgress));

  return (
    <div
      className={cn(
        "relative mx-auto grid place-items-center",
        size === "hero" ? "size-72" : "size-64 sm:size-72",
      )}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        {sessionProgress != null ? (
          <>
            <circle
              cx="50"
              cy="50"
              r={rSession}
              fill="none"
              className="stroke-border"
              strokeWidth="1.6"
            />
            <circle
              cx="50"
              cy="50"
              r={rSession}
              fill="none"
              className="stroke-lavender"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray={sessionLen}
              strokeDashoffset={sessionLen * (1 - sessionRemain)}
            />
          </>
        ) : null}
        <circle
          cx="50"
          cy="50"
          r={rPhase}
          fill="none"
          className="stroke-accent/25"
          strokeWidth="2.4"
        />
        <circle
          cx="50"
          cy="50"
          r={rPhase}
          fill="none"
          className="stroke-accent"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray={phaseLen}
          strokeDashoffset={phaseLen * (1 - phaseRemain)}
        />
      </svg>
      <div
        className="breath-halo pointer-events-none absolute inset-[12%] rounded-full bg-glow"
        aria-hidden
      />
      <div
        className="absolute inset-[20%] rounded-full border border-accent/30"
        style={{
          transform: `scale(${scale})`,
          transition: reduce
            ? "none"
            : `transform ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
        aria-hidden
      />
      {showLabel ? (
        <div className="relative z-10 px-6 text-center">
          <p className="font-display text-lg tracking-wide text-fg">
            {running ? phaseLabel(cycle.phase) : "Ready"}
          </p>
          {running ? (
            <p className="mt-1 text-sm tabular-nums text-muted">
              {left} {left === 1 ? "second" : "seconds"}
            </p>
          ) : (
            <p className="mt-1 text-sm text-subtle">{pattern.summary}</p>
          )}
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {running
          ? `${phaseLabel(cycle.phase)}, ${left} ${left === 1 ? "second" : "seconds"}`
          : `${pattern.name}. Ready.`}
      </p>
    </div>
  );
}
