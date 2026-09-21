import { AudioLines, Heart, Pause, Play, Sparkles } from "lucide-react";
import { SoundArt } from "@/components/library/sound-art";
import type { CatalogSound } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  sound: CatalogSound;
  locked: boolean;
  favorite: boolean;
  previewing: boolean;
  selected: boolean;
  onPreview: () => void;
  onUse: () => void;
  onFavorite: () => void;
};

export function SoundCard({
  sound,
  locked,
  favorite,
  previewing,
  selected,
  onPreview,
  onUse,
  onFavorite,
}: Props) {
  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-xl px-1 py-2",
        selected && "bg-card",
      )}
    >
      <button
        type="button"
        onClick={onUse}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <SoundArt
          soundId={sound.id}
          className="size-14 shrink-0 rounded-lg"
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-medium text-fg">{sound.name}</span>
            {locked ? (
              <Sparkles className="size-3.5 shrink-0 text-accent" aria-hidden />
            ) : null}
          </span>
          <span className="mt-0.5 block text-sm text-subtle">Loop</span>
        </span>
      </button>
      <button
        type="button"
        aria-label={previewing ? "Pause preview" : selected ? "Selected" : "Play preview"}
        onClick={onPreview}
        className="grid size-11 place-items-center rounded-full text-fg"
      >
        {previewing ? (
          <Pause className="size-5" />
        ) : selected ? (
          <AudioLines className="size-5 text-accent" />
        ) : (
          <Play className="size-5" />
        )}
      </button>
      <button
        type="button"
        aria-label={favorite ? "Remove favorite" : "Add favorite"}
        aria-pressed={favorite}
        onClick={onFavorite}
        className="grid size-11 place-items-center rounded-full text-subtle"
      >
        <Heart className={cn("size-5", favorite && "fill-accent text-accent")} />
      </button>
    </article>
  );
}
