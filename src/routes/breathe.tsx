import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Play } from "lucide-react";
import { BreathingCircle } from "@/components/meditation/breathing-circle";
import { BreathTimingGraph } from "@/components/meditation/breath-timing-graph";
import { VoiceMuteButton } from "@/components/meditation/voice-mute-button";
import { useBreathCycle } from "@/components/meditation/use-breath-cycle";
import { Button } from "@/components/ui/button";
import { LookPhoto } from "@/components/look-backdrop";
import { audioEngine } from "@/lib/audio/engine";
import { breathVoice } from "@/lib/audio/breath-voice";
import { BREATHING_PATTERNS, getBreathingPattern } from "@/lib/breathing";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/breathe")({ component: BreathePage });

function BreathePage() {
  const navigate = useNavigate();
  const isPremium = useStore((s) => s.isPremium);
  const last = useStore((s) => s.lastBreathingPattern);
  const setPattern = useStore((s) => s.setBreathingPattern);
  const gender = useStore((s) => s.breathVoiceGender);
  const [running, setRunning] = useState(false);
  const pattern = getBreathingPattern(last);
  const cycle = useBreathCycle(pattern, running, true);

  async function toggle() {
    if (!running) {
      try {
        await audioEngine.unlock();
        breathVoice.setGender(gender);
        await breathVoice.prepare(gender);
      } catch {
        /* visual guide still works */
      }
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } else {
      breathVoice.stop();
    }
    setRunning((r) => !r);
  }

  return (
    <main className="session-screen relative flex min-h-dvh flex-col overflow-hidden text-fg">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <LookPhoto />
        <div className="absolute inset-0 bg-bg/70" />
      </div>
      <div className="relative flex min-h-dvh flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8">
        <div className="grid grid-cols-3 items-center">
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              breathVoice.stop();
              void navigate({ to: "/" });
            }}
            className="justify-self-start text-muted"
            aria-label="Back"
          >
            <ChevronLeft className="size-6" />
          </button>
          <h1 className="text-center font-display text-lg tracking-tight">
            Breathe
          </h1>
          <div className="justify-self-end">
            <VoiceMuteButton />
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {BREATHING_PATTERNS.map((item) => {
            const locked = item.premium && !isPremium;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (locked) {
                    void navigate({ to: "/premium" });
                    return;
                  }
                  setRunning(false);
                  breathVoice.stop();
                  setPattern(item.id);
                }}
                className={cn(
                  "h-10 shrink-0 rounded-full border border-border bg-card px-4 text-sm",
                  last === item.id &&
                    "border-transparent bg-accent text-accent-fg",
                  locked && "opacity-60",
                )}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <BreathingCircle
            pattern={pattern}
            cycle={cycle}
            running={running}
            size="hero"
          />
          <BreathTimingGraph
            pattern={pattern}
            cycle={cycle}
            running={running}
          />
        </div>

        <Button
          variant="start"
          size="lg"
          className="mt-4 w-full rounded-full"
          onClick={() => void toggle()}
        >
          {running ? null : <Play className="size-5" aria-hidden />}
          {running ? "Pause" : "Start"}
        </Button>
      </div>
    </main>
  );
}
