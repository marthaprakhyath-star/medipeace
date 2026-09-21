import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { breathVoice } from "@/lib/audio/breath-voice";
import { useStore } from "@/lib/store";

export function VoiceMuteButton({
  className,
}: {
  className?: string;
}) {
  const muted = useStore((s) => s.breathVoiceMuted);
  const setMuted = useStore((s) => s.setBreathVoiceMuted);

  return (
    <Button
      variant="secondary"
      size="icon"
      className={className}
      aria-label={muted ? "Unmute breathing voice" : "Mute breathing voice"}
      aria-pressed={muted}
      onClick={(e) => {
        e.stopPropagation();
        const next = !muted;
        setMuted(next);
        if (next) breathVoice.stop();
      }}
    >
      {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
    </Button>
  );
}
