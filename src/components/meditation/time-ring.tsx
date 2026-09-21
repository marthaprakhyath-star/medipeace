import { cn } from "@/lib/utils";

type Props = {
  progress: number;
  className?: string;
  size?: number;
  trackClassName?: string;
  fillClassName?: string;
  children?: React.ReactNode;
};

export function TimeRing({
  progress,
  className,
  size = 176,
  trackClassName = "text-surface",
  fillClassName = "text-accent",
  children,
}: Props) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full -rotate-90"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className={trackClassName}
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className={fillClassName}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
        />
      </svg>
      <div className="relative z-10 grid place-items-center">{children}</div>
    </div>
  );
}
