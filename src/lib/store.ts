import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  BreathingPatternId,
  BreathVoiceGender,
  CustomPreset,
  SessionRecord,
  SessionStatus,
  ThemePreference,
} from "@/lib/types";
import { DEFAULT_SOUND_ID } from "@/lib/audio/catalog";
import { clearAllUserTracks } from "@/lib/audio/user-library";
import type { LookId } from "@/lib/looks";

export const DURATION_MIN = 1;
export const DURATION_MAX = 180;

type Persisted = {
  durationMinutes: number;
  selectedSoundId: string;
  volume: number;
  theme: ThemePreference;
  reducedMotion: boolean;
  lastBreathingPattern: BreathingPatternId;
  favorites: string[];
  recentSounds: string[];
  hasOnboarded: boolean;
  isPremium: boolean;
  sessions: SessionRecord[];
  customPresets: CustomPreset[];
  sessionStatus: SessionStatus;
  sessionSoundId: string;
  sessionSoundName: string;
  sessionDurationMs: number;
  sessionEndsAt: number | null;
  sessionRemainingMs: number;
  sessionStartedAt: number | null;
  hideControls: boolean;
  lookId: LookId;
  guestDisplayName: string;
  guestAvatarUrl: string | null;
  breathVoiceMuted: boolean;
  breathVoiceGender: BreathVoiceGender;
  hasAcceptedLegal: boolean;
  hasChosenAuth: boolean;
  firstRunId: number;
};

type Actions = {
  setDuration: (minutes: number) => void;
  bumpDuration: (delta: number) => void;
  setSound: (id: string, name?: string) => void;
  setVolume: (volume: number) => void;
  setTheme: (theme: ThemePreference) => void;
  setReducedMotion: (value: boolean) => void;
  setBreathingPattern: (id: BreathingPatternId) => void;
  toggleFavorite: (id: string) => void;
  completeOnboarding: () => void;
  setPremium: (value: boolean) => void;
  addCustomPreset: (preset: Omit<CustomPreset, "id">) => void;
  removeCustomPreset: (id: string) => void;
  startSession: (opts: { durationMs: number; soundId: string; soundName: string }) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  cancelSession: () => void;
  setHideControls: (value: boolean) => void;
  addSessionRecord: (record: SessionRecord) => void;
  hydrateSessionAfterLoad: () => "idle" | "needs-resume" | "complete";
  setLook: (id: LookId) => void;
  setGuestProfile: (input: { displayName?: string; avatarUrl?: string | null }) => void;
  setBreathVoiceMuted: (value: boolean) => void;
  setBreathVoiceGender: (gender: BreathVoiceGender) => void;
  acceptLegal: () => void;
  completeAuthChoice: () => void;
  clearDeviceData: () => Promise<void>;
};

export type AppState = Persisted & Actions;

function clampDuration(minutes: number) {
  if (!Number.isFinite(minutes)) return 10;
  return Math.min(DURATION_MAX, Math.max(DURATION_MIN, Math.round(minutes)));
}

const initial: Persisted = {
  durationMinutes: 10,
  selectedSoundId: DEFAULT_SOUND_ID,
  volume: 0.72,
  theme: "light",
  reducedMotion: false,
  lastBreathingPattern: "relax",
  favorites: [],
  recentSounds: [DEFAULT_SOUND_ID],
  hasOnboarded: false,
  isPremium: false,
  sessions: [],
  customPresets: [],
  sessionStatus: "idle",
  sessionSoundId: DEFAULT_SOUND_ID,
  sessionDurationMs: 10 * 60 * 1000,
  sessionSoundName: "Ocean Calm",
  sessionEndsAt: null,
  sessionRemainingMs: 10 * 60 * 1000,
  sessionStartedAt: null,
  hideControls: false,
  lookId: "dawn",
  guestDisplayName: "",
  guestAvatarUrl: null,
  breathVoiceMuted: false,
  breathVoiceGender: "female",
  hasAcceptedLegal: false,
  hasChosenAuth: false,
  firstRunId: 3,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,
      setDuration: (minutes) => set({ durationMinutes: clampDuration(minutes) }),
      bumpDuration: (delta) =>
        set({ durationMinutes: clampDuration(get().durationMinutes + delta) }),
      setSound: (id, _name) =>
        set((s) => ({
          selectedSoundId: id,
          recentSounds: [id, ...s.recentSounds.filter((x) => x !== id)].slice(
            0,
            8,
          ),
        })),
      setVolume: (volume) =>
        set({ volume: Math.min(1, Math.max(0, volume)) }),
      setTheme: (theme) => set({ theme }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setBreathingPattern: (lastBreathingPattern) =>
        set({ lastBreathingPattern }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        })),
      completeOnboarding: () => set({ hasOnboarded: true }),
      setPremium: (isPremium) => set({ isPremium }),
      addCustomPreset: (preset) =>
        set((s) => ({
          customPresets: [
            { ...preset, id: crypto.randomUUID() },
            ...s.customPresets,
          ].slice(0, 12),
        })),
      removeCustomPreset: (id) =>
        set((s) => ({
          customPresets: s.customPresets.filter((p) => p.id !== id),
        })),
      startSession: ({ durationMs, soundId, soundName }) =>
        set({
          sessionStatus: "running",
          sessionSoundId: soundId,
          sessionSoundName: soundName,
          sessionDurationMs: durationMs,
          sessionRemainingMs: durationMs,
          sessionEndsAt: Date.now() + durationMs,
          sessionStartedAt: Date.now(),
          hideControls: false,
          selectedSoundId: soundId,
          durationMinutes: clampDuration(durationMs / 60000),
          recentSounds: [
            soundId,
            ...get().recentSounds.filter((x) => x !== soundId),
          ].slice(0, 8),
        }),
      pauseSession: () => {
        const s = get();
        if (s.sessionStatus !== "running") return;
        const remaining = Math.max(0, (s.sessionEndsAt ?? Date.now()) - Date.now());
        set({
          sessionStatus: "paused",
          sessionRemainingMs: remaining,
          sessionEndsAt: null,
        });
      },
      resumeSession: () => {
        const s = get();
        if (s.sessionStatus !== "paused") return;
        set({
          sessionStatus: "running",
          sessionEndsAt: Date.now() + s.sessionRemainingMs,
        });
      },
      completeSession: () =>
        set({
          sessionStatus: "complete",
          sessionEndsAt: null,
          sessionRemainingMs: 0,
          hideControls: false,
        }),
      cancelSession: () =>
        set({
          sessionStatus: "idle",
          sessionEndsAt: null,
          hideControls: false,
        }),
      setHideControls: (hideControls) => set({ hideControls }),
      setLook: (lookId) => set({ lookId }),
      setGuestProfile: (input) =>
        set((s) => ({
          guestDisplayName:
            input.displayName !== undefined
              ? input.displayName.slice(0, 40)
              : s.guestDisplayName,
          guestAvatarUrl:
            input.avatarUrl !== undefined ? input.avatarUrl : s.guestAvatarUrl,
        })),
      setBreathVoiceMuted: (breathVoiceMuted) => set({ breathVoiceMuted }),
      setBreathVoiceGender: (breathVoiceGender) => set({ breathVoiceGender }),
      acceptLegal: () => set({ hasAcceptedLegal: true }),
      completeAuthChoice: () =>
        set((s) => ({
          hasChosenAuth: true,
          // First pass through sign-in always continues to the disclaimer.
          hasAcceptedLegal: s.hasChosenAuth ? s.hasAcceptedLegal : false,
        })),
      clearDeviceData: async () => {
        try {
          await clearAllUserTracks();
        } catch {
          /* storage may already be empty */
        }
        const keep = {
          hasOnboarded: true,
          hasAcceptedLegal: true,
          hasChosenAuth: true,
          lookId: get().lookId,
          theme: get().theme,
          breathVoiceGender: get().breathVoiceGender,
        };
        set({ ...initial, ...keep });
      },
      addSessionRecord: (record) =>
        set((s) => ({ sessions: [record, ...s.sessions].slice(0, 200) })),
      hydrateSessionAfterLoad: () => {
        const s = get();
        if (s.sessionStatus === "complete") return "complete";
        if (s.sessionStatus === "running") {
          const remaining = (s.sessionEndsAt ?? Date.now()) - Date.now();
          if (remaining <= 0) {
            const completedSeconds = Math.round(s.sessionDurationMs / 1000);
            set({
              sessionStatus: "complete",
              sessionRemainingMs: 0,
              sessionEndsAt: null,
              sessions: [
                {
                  id: crypto.randomUUID(),
                  startedAt:
                    s.sessionStartedAt ?? Date.now() - s.sessionDurationMs,
                  durationSeconds: completedSeconds,
                  completedSeconds,
                  soundId: s.sessionSoundId,
                  soundName: s.sessionSoundName,
                  completed: true,
                },
                ...s.sessions,
              ].slice(0, 200),
            });
            return "complete";
          }
          set({
            sessionStatus: "paused",
            sessionRemainingMs: remaining,
            sessionEndsAt: null,
          });
          return "needs-resume";
        }
        if (s.sessionStatus === "paused") return "needs-resume";
        return "idle";
      },
    }),
    {
      name: "medipeace-store",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      merge: (persisted, current) => {
        const p = (persisted as Partial<Persisted> | undefined) ?? {};
        const next = { ...current, ...p };
        if ((p.firstRunId ?? 0) < 3) {
          next.hasOnboarded = false;
          next.hasChosenAuth = false;
          next.hasAcceptedLegal = false;
          next.sessionStatus = "idle";
          next.firstRunId = 3;
        }
        return next;
      },
      partialize: (s) => ({
        durationMinutes: s.durationMinutes,
        selectedSoundId: s.selectedSoundId,
        volume: s.volume,
        theme: s.theme,
        reducedMotion: s.reducedMotion,
        lastBreathingPattern: s.lastBreathingPattern,
        favorites: s.favorites,
        recentSounds: s.recentSounds,
        hasOnboarded: s.hasOnboarded,
        isPremium: s.isPremium,
        sessions: s.sessions,
        customPresets: s.customPresets,
        sessionStatus: s.sessionStatus === "complete" ? "idle" : s.sessionStatus,
        sessionSoundId: s.sessionSoundId,
        sessionSoundName: s.sessionSoundName,
        sessionDurationMs: s.sessionDurationMs,
        sessionEndsAt: s.sessionEndsAt,
        sessionRemainingMs: s.sessionRemainingMs,
        sessionStartedAt: s.sessionStartedAt,
        hideControls: false,
        lookId: s.lookId,
        guestDisplayName: s.guestDisplayName,
        guestAvatarUrl: s.guestAvatarUrl,
        breathVoiceMuted: s.breathVoiceMuted,
        breathVoiceGender: s.breathVoiceGender,
        hasAcceptedLegal: s.hasAcceptedLegal,
        hasChosenAuth: s.hasChosenAuth,
        firstRunId: s.firstRunId,
      }),
    },
  ),
);

export function remainingMs(state: Pick<AppState, "sessionStatus" | "sessionEndsAt" | "sessionRemainingMs">) {
  if (state.sessionStatus === "running" && state.sessionEndsAt) {
    return Math.max(0, state.sessionEndsAt - Date.now());
  }
  return Math.max(0, state.sessionRemainingMs);
}
