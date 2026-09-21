import { useCallback, useState } from "react";
import { Play } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { DurationPicker } from "@/components/meditation/duration-picker";
import { SupporterFlow } from "@/components/supporter-message";
import { Button } from "@/components/ui/button";
import { getCatalogSound } from "@/lib/audio/catalog";
import { breathVoice } from "@/lib/audio/breath-voice";
import { audioEngine } from "@/lib/audio/engine";
import { getUserTrackBlob, parseUserSoundId } from "@/lib/audio/user-library";
import { useStore } from "@/lib/store";

export function StartCard({ returning }: { returning?: boolean }) {
  const navigate = useNavigate();
  const durationMinutes = useStore((s) => s.durationMinutes);
  const selectedSoundId = useStore((s) => s.selectedSoundId);
  const volume = useStore((s) => s.volume);
  const isPremium = useStore((s) => s.isPremium);
  const gender = useStore((s) => s.breathVoiceGender);
  const startSession = useStore((s) => s.startSession);
  const [supporterOpen, setSupporterOpen] = useState(false);

  const catalog = getCatalogSound(selectedSoundId);
  const userId = parseUserSoundId(selectedSoundId);
  const soundName = catalog?.name ?? (userId ? "My Music" : "Ocean Calm");

  const beginSit = useCallback(async () => {
    setSupporterOpen(false);
    audioEngine.setVolume(volume);
    try {
      await audioEngine.unlock();
      breathVoice.setGender(gender);
      await breathVoice.prepare(gender);
    } catch {
      /* play() will surface a friendly error if needed */
    }

    let blob: Blob | null = null;
    if (userId) {
      blob = await getUserTrackBlob(userId);
      if (!blob) {
        toast.error("That audio file is no longer available.");
        return;
      }
    }

    startSession({
      durationMs: durationMinutes * 60 * 1000,
      soundId: selectedSoundId,
      soundName,
    });
    try {
      if (blob) {
        await audioEngine.playBlob(blob, 4000);
      } else {
        await audioEngine.playCatalog(catalog?.id ?? "ocean-calm", 4000);
      }
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch {
      toast.error("We couldn't start playback. Please try again.");
    }
  }, [
    catalog?.id,
    durationMinutes,
    gender,
    selectedSoundId,
    soundName,
    startSession,
    userId,
    volume,
  ]);

  async function onStart() {
    if (catalog?.premium && !isPremium) {
      void navigate({ to: "/premium" });
      return;
    }
    if (userId) {
      const blob = await getUserTrackBlob(userId);
      if (!blob) {
        toast.error("That audio file is no longer available.");
        return;
      }
    }
    if (!isPremium) {
      setSupporterOpen(true);
      return;
    }
    await beginSit();
  }

  return (
    <section className="rounded-2xl bg-card p-6 shadow-card">
      <p className="text-center text-sm tracking-wide text-muted">
        {returning ? "Ready for another moment of peace?" : "Start Meditation"}
      </p>
      <div className="mt-6">
        <DurationPicker />
      </div>
      <Button
        variant="start"
        size="xl"
        className="mt-7 w-full rounded-full"
        onClick={() => void onStart()}
      >
        <Play className="size-5" aria-hidden />
        Start
      </Button>
      <button
        type="button"
        onClick={() => void navigate({ to: "/library" })}
        className="mt-4 w-full text-center text-sm text-muted"
      >
        {soundName}
        <span className="text-subtle"> · Change sound</span>
      </button>
      <SupporterFlow
        open={supporterOpen}
        onFinished={() => void beginSit()}
        onCancel={() => setSupporterOpen(false)}
      />
    </section>
  );
}
