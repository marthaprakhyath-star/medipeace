import type { CatalogSound } from "@/lib/types";

export type { CatalogSound, SoundCategory } from "@/lib/types";

export const CATALOG_SOUNDS: CatalogSound[] = [
  {
    id: "ocean-calm",
    name: "Ocean Calm",
    category: "nature",
    description: "Slow waves against a quiet shore",
    premium: false,
  },
  {
    id: "gentle-rain",
    name: "Gentle Rain",
    category: "nature",
    description: "Soft rainfall on a still afternoon",
    premium: false,
  },
  {
    id: "forest",
    name: "Forest",
    category: "nature",
    description: "Wind in the trees and distant birds",
    premium: false,
  },
  {
    id: "river",
    name: "River",
    category: "nature",
    description: "A nearby stream, unhurried",
    premium: false,
  },
  {
    id: "birds",
    name: "Birds",
    category: "nature",
    description: "Light birdsong over a quiet grove",
    premium: true,
  },
  {
    id: "deep-calm",
    name: "Deep Calm",
    category: "ambient",
    description: "A low, steady place to rest attention",
    premium: false,
  },
  {
    id: "inner-peace",
    name: "Inner Peace",
    category: "ambient",
    description: "Warm singing-bowl harmonics",
    premium: false,
  },
  {
    id: "quiet-space",
    name: "Quiet Space",
    category: "ambient",
    description: "Almost silence, with a distant tone",
    premium: true,
  },
  {
    id: "healing-ambient",
    name: "Healing Ambient",
    category: "ambient",
    description: "Slow, open chords that barely move",
    premium: true,
  },
  {
    id: "meditation-drone",
    name: "Meditation Drone",
    category: "ambient",
    description: "A grounded harmonic drone",
    premium: true,
  },
  {
    id: "deep-sleep",
    name: "Deep Sleep",
    category: "sleep",
    description: "Low, dark, and unhurried",
    premium: false,
  },
  {
    id: "night-calm",
    name: "Night Calm",
    category: "sleep",
    description: "A still night with distant crickets",
    premium: true,
  },
  {
    id: "soft-rain",
    name: "Soft Rain",
    category: "sleep",
    description: "Barely-there rain for drifting off",
    premium: true,
  },
];

export const DEFAULT_SOUND_ID = "ocean-calm";

export const CATEGORY_LABELS: Record<CatalogSound["category"], string> = {
  nature: "Nature",
  ambient: "Ambient",
  sleep: "Sleep",
};

export function getCatalogSound(id: string): CatalogSound | undefined {
  return CATALOG_SOUNDS.find((s) => s.id === id);
}

export const DURATION_PRESETS = [1, 3, 5, 10, 15, 20, 30, 45, 60] as const;
export const DURATION_CHIPS = [1, 3, 5, 10, 15] as const;

export const SESSION_PRESETS = [
  {
    id: "quick-reset",
    name: "Quick Reset",
    durationMinutes: 5,
    soundId: "gentle-rain",
    blurb: "A short pause between things",
  },
  {
    id: "morning-peace",
    name: "Morning Peace",
    durationMinutes: 10,
    soundId: "birds",
    freeSoundId: "forest",
    blurb: "Arrive gently into the day",
  },
  {
    id: "focus",
    name: "Focus",
    durationMinutes: 15,
    soundId: "deep-calm",
    blurb: "Settle the mind for work",
  },
  {
    id: "deep-relaxation",
    name: "Deep Relaxation",
    durationMinutes: 20,
    soundId: "ocean-calm",
    blurb: "Let the body unclench",
  },
  {
    id: "sleep",
    name: "Sleep",
    durationMinutes: 30,
    soundId: "deep-sleep",
    blurb: "Drift without trying",
  },
] as const;

export const MOODS = [
  { id: "calm", label: "Calm", soundId: "ocean-calm", durationMinutes: 10 },
  { id: "focus", label: "Focus", soundId: "deep-calm", durationMinutes: 15 },
  { id: "sleep", label: "Sleep", soundId: "deep-sleep", durationMinutes: 30 },
  { id: "relax", label: "Relax", soundId: "gentle-rain", durationMinutes: 10 },
  { id: "breathe", label: "Breathe", soundId: null, durationMinutes: null },
] as const;
