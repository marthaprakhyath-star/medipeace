import { Logo } from "@/components/brand/logo";

export function Splash() {
  return (
    <div
      className="grid min-h-dvh place-items-center text-fg"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo className="size-20" />
        <p className="font-display text-4xl tracking-tight">Medipeace</p>
        <p className="text-sm text-muted">A little time for a peaceful mind.</p>
      </div>
    </div>
  );
}
