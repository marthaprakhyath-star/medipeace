import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ProgressRing({
  progress,
  className,
  children,
}: {
  progress: number;
  className?: string;
  children?: ReactNode;
}) {
  const p = Math.min(1, Math.max(0, progress));
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative grid place-items-center", className)}>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          className="stroke-border"
          strokeWidth="4"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          className="stroke-accent"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
