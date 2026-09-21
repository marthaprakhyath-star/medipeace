import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { StartCard } from "@/components/meditation/start-card";
import { Button } from "@/components/ui/button";
import { SESSION_PRESETS, getCatalogSound } from "@/lib/audio/catalog";
import { useStore } from "@/lib/store";
import { formatMinutesLabel } from "@/lib/format";

export const Route = createFileRoute("/meditate")({ component: MeditatePage });

function MeditatePage() {
  const isPremium = useStore((s) => s.isPremium);
  const setSound = useStore((s) => s.setSound);
  const setDuration = useStore((s) => s.setDuration);
  const setBreathing = useStore((s) => s.setBreathingPattern);
  const custom = useStore((s) => s.customPresets);
  const addCustom = useStore((s) => s.addCustomPreset);
  const removeCustom = useStore((s) => s.removeCustomPreset);
  const durationMinutes = useStore((s) => s.durationMinutes);
  const selectedSoundId = useStore((s) => s.selectedSoundId);
  const lastBreathingPattern = useStore((s) => s.lastBreathingPattern);
  const [name, setName] = useState("");

  function applyPreset(soundId: string, minutes: number, freeSoundId?: string) {
    const chosen =
      getCatalogSound(soundId)?.premium && !isPremium
        ? (freeSoundId ?? "ocean-calm")
        : soundId;
    setSound(chosen);
    setDuration(minutes);
  }

  return (
    <main className="page-enter flex flex-col gap-8">
      <header>
        <p className="text-sm tracking-wide text-muted">Meditate</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight">
          Choose a beginning
        </h1>
      </header>

      <ul className="flex flex-col gap-2">
        {SESSION_PRESETS.map((preset) => (
          <li key={preset.id}>
            <button
              type="button"
              onClick={() =>
                applyPreset(
                  preset.soundId,
                  preset.durationMinutes,
                  preset.id === "morning-peace" ? "forest" : undefined,
                )
              }
              className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-4 text-left"
            >
              <span>
                <span className="block font-medium text-fg">{preset.name}</span>
                <span className="mt-0.5 block text-sm text-muted">
                  {preset.blurb}
                </span>
              </span>
              <span className="text-sm text-subtle">
                {formatMinutesLabel(preset.durationMinutes)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {custom.length > 0 ? (
        <section>
          <h2 className="font-display text-xl tracking-tight">Your sessions</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {custom.map((preset) => (
              <li
                key={preset.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => {
                    setSound(preset.soundId);
                    setDuration(preset.durationMinutes);
                    setBreathing(preset.breathingPattern);
                  }}
                >
                  <span className="block font-medium">{preset.name}</span>
                  <span className="text-sm text-muted">
                    {formatMinutesLabel(preset.durationMinutes)}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustom(preset.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isPremium ? (
        <form
          className="rounded-xl border border-border bg-card p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = name.trim();
            if (!trimmed) return;
            addCustom({
              name: trimmed.slice(0, 24),
              durationMinutes,
              soundId: selectedSoundId,
              breathingPattern: lastBreathingPattern,
            });
            setName("");
          }}
        >
          <label htmlFor="preset-name" className="text-sm text-muted">
            Save this setup
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="preset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Morning at the desk"
              className="h-11 flex-1 rounded-md border border-border bg-bg px-3 text-fg"
            />
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>
      ) : null}

      <StartCard />
    </main>
  );
}
