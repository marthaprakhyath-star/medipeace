import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  Flower2,
  Leaf,
  Moon,
  Sun,
  Sunrise,
  Target,
  Wind,
} from "lucide-react";
import { StartCard } from "@/components/meditation/start-card";
import { ProfileAvatar } from "@/components/profile-avatar";
import { MOODS, SESSION_PRESETS, getCatalogSound } from "@/lib/audio/catalog";
import { greetingForHour } from "@/lib/format";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({ component: Home });

const MOOD_UI = {
  calm: { Icon: Flower2, tile: "mood-calm" },
  focus: { Icon: Target, tile: "mood-focus" },
  sleep: { Icon: Moon, tile: "mood-sleep" },
  relax: { Icon: Leaf, tile: "mood-relax" },
  breathe: { Icon: Wind, tile: "mood-breathe" },
} as const;

const PRESET_UI = [
  { Icon: Sun, tint: "preset-a" },
  { Icon: Sunrise, tint: "preset-b" },
  { Icon: Leaf, tint: "preset-c" },
] as const;

function Home() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const sessions = useStore((s) => s.sessions);
  const setSound = useStore((s) => s.setSound);
  const setDuration = useStore((s) => s.setDuration);
  const selectedSoundId = useStore((s) => s.selectedSoundId);
  const guestDisplayName = useStore((s) => s.guestDisplayName);
  const guestAvatarUrl = useStore((s) => s.guestAvatarUrl);
  const isPremium = useStore((s) => s.isPremium);
  const [mood, setMood] = useState<string | null>(null);

  const greeting = useMemo(
    () => greetingForHour(new Date().getHours()),
    [],
  );
  const returning = sessions.length > 0;
  const firstName = (
    guestDisplayName ||
    user?.displayName ||
    ""
  )
    .trim()
    .split(" ")[0];
  const avatar = guestAvatarUrl || user?.profileImageUrl || null;

  function applyPreset(soundId: string, minutes: number, freeSoundId?: string) {
    const chosen =
      getCatalogSound(soundId)?.premium && !isPremium
        ? (freeSoundId ?? "ocean-calm")
        : soundId;
    setSound(chosen);
    setDuration(minutes);
  }

  return (
    <main className="page-enter flex flex-col gap-7">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl tracking-tight">
            {firstName ? `${greeting}, ${firstName}` : greeting}
            {firstName ? (
              <Leaf className="size-4 text-accent" aria-hidden />
            ) : null}
          </h1>
          <p className="mt-1 text-sm text-muted">
            How would you like to feel today?
          </p>
        </div>
        <Link to="/profile" aria-label="Profile">
          <ProfileAvatar src={avatar} name={firstName || "You"} size="sm" />
        </Link>
      </header>

      <section
        className="grid grid-cols-5 gap-2"
        aria-label="How would you like to feel"
      >
        {MOODS.map((item) => {
          const ui = MOOD_UI[item.id];
          const Icon = ui.Icon;
          const active = mood === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-active={active}
              onClick={() => {
                if (item.id === "breathe") {
                  void navigate({ to: "/breathe" });
                  return;
                }
                setMood(item.id);
                if (item.soundId) setSound(item.soundId);
                if (item.durationMinutes) setDuration(item.durationMinutes);
              }}
              className={cn(
                "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl px-1 text-xs transition-[background-color,color] duration-150",
                ui.tile,
                active && "bg-accent text-accent-fg",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {item.label}
            </button>
          );
        })}
      </section>

      <StartCard returning={returning} />

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg tracking-tight">Quick Presets</h2>
          <button
            type="button"
            onClick={() => void navigate({ to: "/meditate" })}
            className="text-sm text-muted"
          >
            See all
          </button>
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {SESSION_PRESETS.slice(0, 3).map((preset, i) => {
            const ui = PRESET_UI[i] ?? PRESET_UI[0];
            const Icon = ui.Icon;
            return (
              <li key={preset.id}>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset(
                      preset.soundId,
                      preset.durationMinutes,
                      "freeSoundId" in preset ? preset.freeSoundId : undefined,
                    )
                  }
                  className={cn(
                    "flex h-full min-h-28 w-full flex-col items-start rounded-xl p-3 text-left",
                    ui.tint,
                  )}
                >
                  <Icon className="size-5 text-accent" aria-hidden />
                  <span className="mt-3 text-sm font-medium leading-tight">
                    {preset.name}
                  </span>
                  <span className="mt-1 text-xs text-muted">
                    {preset.durationMinutes} min
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <span className="sr-only">{selectedSoundId}</span>
    </main>
  );
}
