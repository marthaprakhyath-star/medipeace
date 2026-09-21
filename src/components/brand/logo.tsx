import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("text-accent", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 56C20 42 8 34 14 16c10 8 16 18 18 40Z"
        fill="currentColor"
        opacity="0.42"
      />
      <path
        d="M32 56C44 42 56 34 50 16c-10 8-16 18-18 40Z"
        fill="currentColor"
        opacity="0.42"
      />
      <path
        d="M32 58C25 38 27 14 32 6c5 8 7 32 0 52Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo className="size-8" />
      <span className="font-display text-xl tracking-tight text-fg">
        Medipeace
      </span>
    </div>
  );
}
