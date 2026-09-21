import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { LookPhoto } from "@/components/look-backdrop";
import { useStore } from "@/lib/store";

export function Onboarding() {
  const complete = useStore((s) => s.completeOnboarding);

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-hidden text-fg">
      <div className="absolute inset-0" aria-hidden>
        <LookPhoto />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/25 via-bg/45 to-bg/85" />
      </div>
      <div className="relative flex min-h-dvh flex-col px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-10">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Logo className="size-24" />
          <h1 className="mt-6 font-display text-5xl tracking-tight">
            Medipeace
          </h1>
          <p className="mt-3 text-muted">
            A little time for a peaceful mind.
          </p>
        </div>
        <div className="flex flex-col items-center gap-6">
          <p className="text-center text-sm leading-7 text-fg">
            Breathe
            <br />
            Be Present
            <br />
            Find Your Peace
          </p>
          <Button
            variant="start"
            size="lg"
            className="w-full rounded-full"
            onClick={complete}
          >
            Get Started
          </Button>
          <button
            type="button"
            className="text-sm text-muted"
            onClick={complete}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
