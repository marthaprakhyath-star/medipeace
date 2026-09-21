import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import {
  ChevronLeft,
  EyeOff,
  Leaf,
  Pause,
  Play,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { BreathingCircle } from "@/components/meditation/breathing-circle";
import { VoiceMuteButton } from "@/components/meditation/voice-mute-button";
import { useBreathCycle } from "@/components/meditation/use-breath-cycle";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Logo } from "@/components/brand/logo";
import { LookPhoto } from "@/components/look-backdrop";
import { getBreathingPattern } from "@/lib/breathing";
import { formatClock, formatMinutesLabel } from "@/lib/format";
import {
  endEarly,
  finishNaturally,
  pauseMeditation,
  replaySound,
  resumeMeditation,
  startSessionWatchers,
} from "@/lib/session-controller";
import { remainingMs, useStore } from "@/lib/store";
import { audioEngine } from "@/lib/audio/engine";
import { breathVoice } from "@/lib/audio/breath-voice";
import { cn } from "@/lib/utils";

export function SessionHost() {
  const status = useStore((s) => s.sessionStatus);
  if (status === "idle") return null;
  if (status === "complete") return <CompletionScreen />;
  return <SessionScreen />;
}

function SessionScreen() {
  const status = useStore((s) => s.sessionStatus);
  const soundName = useStore((s) => s.sessionSoundName);
  const hide = useStore((s) => s.hideControls);
  const setHide = useStore((s) => s.setHideControls);
  const volume = useStore((s) => s.volume);
  const setVolume = useStore((s) => s.setVolume);
  const durationMs = useStore((s) => s.sessionDurationMs);
  const pattern = getBreathingPattern(useStore((s) => s.lastBreathingPattern));
  const [ms, setMs] = useState(() => remainingMs(useStore.getState()));
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const running = status === "running";
  const cycle = useBreathCycle(pattern, running, true);
  const sessionProgress = durationMs > 0 ? ms / durationMs : 0;

  useEffect(() => {
    const id = window.setInterval(() => {
      const state = useStore.getState();
      const left = remainingMs(state);
      setMs(left);
      if (state.sessionStatus === "running" && left <= 0) {
        void finishNaturally();
      }
    }, 200);
    const stop = startSessionWatchers();
    return () => {
      window.clearInterval(id);
      stop();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (status === "running") void pauseMeditation();
        else void resumeMeditation();
      }
      if (e.key === "Escape") setConfirmEnd(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  useEffect(() => {
    const marker = { medipeaceSession: true };
    window.history.pushState(marker, "");
    const onPop = () => {
      setConfirmEnd(true);
      window.history.pushState(marker, "");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const unsub = audioEngine.on((event) => {
      if (event === "interrupted") setNeedsGesture(true);
      if (event === "playing") setNeedsGesture(false);
    });
    return () => {
      unsub();
    };
  }, []);

  async function onResume() {
    setNeedsGesture(false);
    await replaySound();
    await resumeMeditation();
  }

  return (
    <div
      className="session-screen fixed inset-0 z-50 flex flex-col overflow-hidden overscroll-none bg-bg text-fg"
      role="dialog"
      aria-modal="true"
      aria-label="Meditation session"
      onClick={() => {
        if (hide) setHide(false);
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <LookPhoto />
        <div className="absolute inset-0 bg-bg/70" />
      </div>
      <div
        className={cn(
          "relative z-10 flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] transition-opacity duration-200",
          hide ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        <button
          type="button"
          aria-label="End session"
          className="grid size-11 place-items-center text-muted"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmEnd(true);
          }}
        >
          <ChevronLeft className="size-6" />
        </button>
        <div className="flex items-center gap-1">
          <VoiceMuteButton />
          <button
            type="button"
            className="h-11 px-2 text-sm text-muted"
            onClick={(e) => {
              e.stopPropagation();
              setHide(true);
            }}
          >
            <span className="inline-flex items-center gap-1.5">
              <EyeOff className="size-4" aria-hidden />
              Hide Controls
            </span>
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-6">
        <BreathingCircle
          pattern={pattern}
          cycle={cycle}
          running={running}
          showLabel={!hide}
          sessionProgress={sessionProgress}
        />
        <p
          className="mt-4 font-display text-6xl tracking-tight tabular-nums sm:text-7xl"
          role="timer"
          aria-live="off"
        >
          {formatClock(ms)}
        </p>
        <p className={cn("mt-3 text-sm text-muted", hide && "opacity-0")}>
          {soundName}
        </p>
        {needsGesture ? (
          <Button className="mt-6" onClick={() => void onResume()}>
            Tap to continue your sound
          </Button>
        ) : null}
      </div>

      <div
        className={cn(
          "relative z-10 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-opacity duration-200",
          hide ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        {volumeOpen ? (
          <div className="mx-auto mb-5 flex max-w-xs items-center gap-3">
            <VolumeX className="size-4 text-subtle" aria-hidden />
            <Slider
              min={0}
              max={100}
              value={[Math.round(volume * 100)]}
              onValueChange={([v]) => {
                const next = (v ?? 70) / 100;
                setVolume(next);
                audioEngine.setVolume(next);
              }}
              aria-label="Volume"
            />
          </div>
        ) : null}
        <div className="mx-auto flex max-w-sm items-start justify-center gap-8">
          <SessionControl
            label={status === "running" ? "Pause" : "Resume"}
            onClick={(e) => {
              e.stopPropagation();
              if (status === "running") {
                breathVoice.stop();
                void pauseMeditation();
              } else void onResume();
            }}
          >
            {status === "running" ? (
              <Pause className="size-5" />
            ) : (
              <Play className="size-5" />
            )}
          </SessionControl>
          <SessionControl
            label="End"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmEnd(true);
            }}
          >
            <Square className="size-5" />
          </SessionControl>
          <SessionControl
            label="Volume"
            onClick={(e) => {
              e.stopPropagation();
              setVolumeOpen((o) => !o);
            }}
          >
            <Volume2 className="size-5" />
          </SessionControl>
        </div>
      </div>

      <AlertDialog open={confirmEnd} onOpenChange={setConfirmEnd}>
        <AlertDialogContent className="session-screen">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this session?</AlertDialogTitle>
            <AlertDialogDescription>
              Your quiet space will still be here whenever you return.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                breathVoice.stop();
                void endEarly();
              }}
            >
              End
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SessionControl({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex flex-col items-center gap-2 text-muted"
    >
      <span className="grid size-16 place-items-center rounded-full border border-border bg-card text-fg">
        {children}
      </span>
      <span className="text-xs tracking-wide">{label}</span>
    </button>
  );
}

function CompletionScreen() {
  const durationMs = useStore((s) => s.sessionDurationMs);
  const cancelSession = useStore((s) => s.cancelSession);
  const startSession = useStore((s) => s.startSession);
  const soundId = useStore((s) => s.sessionSoundId);
  const soundName = useStore((s) => s.sessionSoundName);
  const volume = useStore((s) => s.volume);
  const gender = useStore((s) => s.breathVoiceGender);
  const minutes = Math.max(1, Math.round(durationMs / 60000));

  async function again() {
    audioEngine.setVolume(volume);
    await audioEngine.unlock();
    breathVoice.setGender(gender);
    await breathVoice.prepare(gender);
    startSession({
      durationMs,
      soundId,
      soundName,
    });
    await replaySound();
  }

  return (
    <div
      className="completion-screen fixed inset-0 z-50 flex flex-col overflow-hidden overscroll-none bg-bg text-fg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-title"
    >
      <div className="relative mx-auto flex h-full w-full max-w-lg flex-col px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8">
        <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] grid size-11 place-items-center text-muted"
          onClick={() => cancelSession()}
        >
          <X className="size-5" />
        </button>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Logo className="size-24" />
          <h1
            id="complete-title"
            className="mt-6 font-display text-4xl tracking-tight"
          >
            Peacefully Done
          </h1>
          <p className="mt-3 max-w-sm text-muted">
            You gave yourself {formatMinutesLabel(minutes)} of peace today.
          </p>
          <div className="mt-8 w-full max-w-xs rounded-xl bg-card px-5 py-4">
            <p className="text-xs tracking-wide text-subtle">
              Today's Meditation
            </p>
            <p className="mt-2 flex items-center justify-center gap-2 font-display text-2xl">
              <Leaf className="size-5 text-accent" aria-hidden />
              {formatMinutesLabel(minutes)}
            </p>
          </div>
          <p className="mt-6 max-w-xs text-sm italic text-muted">
            A calmer mind leads to a brighter day.
          </p>
        </div>
        <div className="relative z-10 flex w-full flex-col gap-3">
          <Button
            variant="start"
            size="lg"
            className="w-full rounded-full"
            onClick={() => void again()}
          >
            <RotateCcw className="size-4" aria-hidden />
            Meditate Again
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => cancelSession()}>
            Done
          </Button>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-36 overflow-hidden"
          aria-hidden
        >
          <LookPhoto className="size-full object-cover object-bottom opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-bg" />
        </div>
      </div>
    </div>
  );
}
