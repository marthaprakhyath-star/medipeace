import { audioEngine } from "@/lib/audio/engine";
import { getCatalogSound } from "@/lib/audio/catalog";
import { getUserTrackBlob, parseUserSoundId } from "@/lib/audio/user-library";
import { useStore } from "@/lib/store";

let wakeLock: WakeLockSentinel | null = null;
let completeTimer: number | null = null;
let ticking = false;

async function requestWakeLock() {
  try {
    if (typeof navigator !== "undefined" && navigator.wakeLock) {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => {
        wakeLock = null;
      });
    }
  } catch {
    wakeLock = null;
  }
}

function releaseWakeLock() {
  void wakeLock?.release().catch(() => undefined);
  wakeLock = null;
}

function clearCompleteTimer() {
  if (completeTimer != null) {
    window.clearTimeout(completeTimer);
    completeTimer = null;
  }
}

function scheduleComplete() {
  clearCompleteTimer();
  const { sessionStatus, sessionEndsAt } = useStore.getState();
  if (sessionStatus !== "running" || !sessionEndsAt) return;
  const delay = Math.max(0, sessionEndsAt - Date.now());
  completeTimer = window.setTimeout(() => {
    void finishNaturally();
  }, delay + 30);
}

export async function finishNaturally() {
  const state = useStore.getState();
  if (state.sessionStatus !== "running" && state.sessionStatus !== "paused") {
    return;
  }
  clearCompleteTimer();
  releaseWakeLock();
  try {
    await audioEngine.fadeOut(3200);
  } catch {
    audioEngine.stop();
  }
  await audioEngine.playBell();
  const completedSeconds = Math.round(state.sessionDurationMs / 1000);
  useStore.getState().addSessionRecord({
    id: crypto.randomUUID(),
    startedAt: state.sessionStartedAt ?? Date.now() - state.sessionDurationMs,
    durationSeconds: completedSeconds,
    completedSeconds,
    soundId: state.sessionSoundId,
    soundName: state.sessionSoundName,
    completed: true,
  });
  useStore.getState().completeSession();
}

export async function endEarly() {
  const state = useStore.getState();
  clearCompleteTimer();
  releaseWakeLock();
  const remaining =
    state.sessionStatus === "running" && state.sessionEndsAt
      ? Math.max(0, state.sessionEndsAt - Date.now())
      : state.sessionRemainingMs;
  const completedSeconds = Math.max(
    0,
    Math.round((state.sessionDurationMs - remaining) / 1000),
  );
  try {
    await audioEngine.fadeOut(1200);
  } catch {
    audioEngine.stop();
  }
  if (completedSeconds >= 15) {
    useStore.getState().addSessionRecord({
      id: crypto.randomUUID(),
      startedAt: state.sessionStartedAt ?? Date.now(),
      durationSeconds: Math.round(state.sessionDurationMs / 1000),
      completedSeconds,
      soundId: state.sessionSoundId,
      soundName: state.sessionSoundName,
      completed: false,
    });
  }
  audioEngine.stop();
  useStore.getState().cancelSession();
}

export async function pauseMeditation() {
  useStore.getState().pauseSession();
  audioEngine.pause();
  clearCompleteTimer();
}

export async function resumeMeditation() {
  useStore.getState().resumeSession();
  await audioEngine.resume();
  scheduleComplete();
  void requestWakeLock();
}

export async function replaySound() {
  const { sessionSoundId, volume } = useStore.getState();
  audioEngine.setVolume(volume);
  await audioEngine.unlock();
  const userId = parseUserSoundId(sessionSoundId);
  if (userId) {
    const blob = await getUserTrackBlob(userId);
    if (blob) await audioEngine.playBlob(blob, 2500);
    return;
  }
  const catalog = getCatalogSound(sessionSoundId);
  await audioEngine.playCatalog(catalog?.id ?? "ocean-calm", 2500);
}

export function startSessionWatchers() {
  if (ticking) return () => undefined;
  ticking = true;
  scheduleComplete();
  void requestWakeLock();

  const onVis = () => {
    if (document.visibilityState !== "visible") return;
    const s = useStore.getState();
    if (s.sessionStatus === "running" && s.sessionEndsAt && Date.now() >= s.sessionEndsAt) {
      void finishNaturally();
      return;
    }
    scheduleComplete();
    if (!wakeLock) void requestWakeLock();
  };

  const onEngine = (event: string) => {
    if (event === "interrupted") {
      const s = useStore.getState();
      if (s.sessionStatus === "running") {
        useStore.getState().pauseSession();
        clearCompleteTimer();
      }
    }
  };

  document.addEventListener("visibilitychange", onVis);
  const unsub = audioEngine.on(onEngine);

  if (navigator.mediaSession) {
    try {
      navigator.mediaSession.setActionHandler("pause", () => {
        void pauseMeditation();
      });
      navigator.mediaSession.setActionHandler("play", () => {
        void resumeMeditation();
      });
      navigator.mediaSession.setActionHandler("stop", () => {
        void endEarly();
      });
    } catch {
      /* some handlers unsupported */
    }
  }

  return () => {
    ticking = false;
    document.removeEventListener("visibilitychange", onVis);
    unsub();
    clearCompleteTimer();
    releaseWakeLock();
  };
}
