import { useEffect, useMemo, useState } from "react";
import { breathVoice } from "@/lib/audio/breath-voice";
import {
  firstPhase,
  nextPhase,
  type BreathPhase,
  type BreathingPattern,
} from "@/lib/breathing";
import { useStore } from "@/lib/store";

export type BreathCycle = {
  phase: BreathPhase;
  seconds: number;
  remaining: number;
  progress: number;
};

export function useBreathCycle(
  pattern: BreathingPattern,
  running: boolean,
  haptic = false,
): BreathCycle {
  const first = useMemo(() => firstPhase(pattern), [pattern]);
  const [phase, setPhase] = useState<BreathPhase>(first.phase);
  const [seconds, setSeconds] = useState(first.seconds);
  const [remaining, setRemaining] = useState(first.seconds);
  const voiceMuted = useStore((s) => s.breathVoiceMuted);
  const gender = useStore((s) => s.breathVoiceGender);

  useEffect(() => {
    breathVoice.setGender(gender);
    void breathVoice.prefetch(gender);
  }, [gender]);

  useEffect(() => {
    const next = firstPhase(pattern);
    setPhase(next.phase);
    setSeconds(next.seconds);
    setRemaining(next.seconds);
  }, [pattern]);

  useEffect(() => {
    if (!running) {
      setRemaining(seconds);
      return;
    }
    const started = Date.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, seconds - (Date.now() - started) / 1000);
      setRemaining(left);
    }, 80);
    const hop = window.setTimeout(() => {
      const n = nextPhase(pattern, phase);
      setPhase(n.phase);
      setSeconds(n.seconds);
      setRemaining(n.seconds);
    }, seconds * 1000);
    if (haptic && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(12);
    }
    return () => {
      window.clearInterval(id);
      window.clearTimeout(hop);
    };
  }, [running, phase, seconds, pattern, haptic]);

  useEffect(() => {
    if (!running || voiceMuted) {
      breathVoice.stop();
      return;
    }
    if (phase === "in" || phase === "out") {
      void breathVoice.speak(phase);
    }
  }, [running, phase, voiceMuted, gender]);

  const progress = seconds <= 0 ? 0 : 1 - remaining / seconds;

  return { phase, seconds, remaining, progress };
}
