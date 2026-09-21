import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

const SPOT_SECONDS = 6;

export function SupporterFlow({
  open,
  onFinished,
  onCancel,
}: {
  open: boolean;
  onFinished: () => void;
  onCancel: () => void;
}) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"notice" | "spot">("notice");
  const [left, setLeft] = useState(SPOT_SECONDS);
  const finishedRef = useRef(onFinished);
  finishedRef.current = onFinished;

  useEffect(() => {
    if (!open) return;
    setPhase("notice");
    setLeft(SPOT_SECONDS);
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "spot") return;
    setLeft(SPOT_SECONDS);
    const started = Date.now();
    const id = window.setInterval(() => {
      const remain = Math.max(
        0,
        SPOT_SECONDS - Math.floor((Date.now() - started) / 1000),
      );
      setLeft(remain);
      if (remain <= 0) {
        window.clearInterval(id);
        finishedRef.current();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [open, phase]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg/90 px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-fg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supporter-title"
    >
      <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center text-center">
        {phase === "notice" ? (
          <>
            <p className="text-xs tracking-wide text-subtle">Supporter message</p>
            <h2
              id="supporter-title"
              className="mt-3 font-display text-3xl tracking-tight"
            >
              A short pause keeps Medipeace free
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Non-subscribers see a brief supporter message before a timed sit.
              Nothing plays during meditation. Premium skips this entirely.
            </p>
            <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
              <Button
                variant="start"
                size="lg"
                className="rounded-full"
                onClick={() => setPhase("spot")}
              >
                Continue
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  onCancel();
                  void navigate({ to: "/premium" });
                }}
              >
                <Crown className="size-4" aria-hidden />
                Skip with Premium
              </Button>
              <button
                type="button"
                className="h-11 text-sm text-muted"
                onClick={onCancel}
              >
                Not now
              </button>
            </div>
          </>
        ) : (
          <>
            <Logo className="size-20" />
            <p className="mt-6 text-xs tracking-wide text-subtle">
              Supporter message · {left}s
            </p>
            <h2
              id="supporter-title"
              className="mt-3 font-display text-3xl tracking-tight"
            >
              Find a quieter day
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Premium removes supporter messages, unlocks My Music, and opens
              every breathing pattern.
            </p>
            <div
              className="mt-8 h-1 w-full max-w-xs overflow-hidden rounded-full bg-surface"
              aria-hidden
            >
              <div
                className="h-full origin-left bg-accent transition-transform duration-200"
                style={{
                  transform: `scaleX(${(SPOT_SECONDS - left) / SPOT_SECONDS})`,
                }}
              />
            </div>
            <Button
              variant="outline"
              className="mt-8 rounded-full"
              onClick={() => {
                onCancel();
                void navigate({ to: "/premium" });
              }}
            >
              <Crown className="size-4" aria-hidden />
              See Premium
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
