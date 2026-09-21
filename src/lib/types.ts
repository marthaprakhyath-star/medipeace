export type SoundCategory = "nature" | "ambient" | "sleep";

export type CatalogSound = {
  id: string;
  name: string;
  category: SoundCategory;
  description: string;
  premium: boolean;
};

export type BreathingPatternId = "relax" | "box" | "balanced" | "calm478" | "deep";

export type BreathingPattern = {
  id: BreathingPatternId;
  name: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  premium: boolean;
  summary: string;
};

export type SessionStatus = "idle" | "running" | "paused" | "complete";

export type SessionRecord = {
  id: string;
  startedAt: number;
  durationSeconds: number;
  completedSeconds: number;
  soundId: string;
  soundName: string;
  completed: boolean;
};

export type CustomPreset = {
  id: string;
  name: string;
  durationMinutes: number;
  soundId: string;
  breathingPattern: BreathingPatternId;
};

export type UserTrack = {
  id: string;
  name: string;
  duration: number;
  mimeType: string;
  createdAt: number;
};

export type ThemePreference = "light" | "dark" | "system";

export type MoodId = "calm" | "focus" | "sleep" | "relax" | "breathe";

export type BreathVoiceGender = "female" | "male";
