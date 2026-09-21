import { useState } from "react";
import { Clock, Minus, Plus } from "lucide-react";
import { ProgressRing } from "@/components/meditation/progress-ring";
import { Button } from "@/components/ui/button";
import { DURATION_CHIPS } from "@/lib/audio/catalog";
import { formatClock } from "@/lib/format";
import { DURATION_MAX, DURATION_MIN, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DurationPicker() {
  const minutes = useStore((s) => s.durationMinutes);
  const setDuration = useStore((s) => s.setDuration);
  const bumpDuration = useStore((s) => s.bumpDuration);
  const [customOpen, setCustomOpen] = useState(false);
  const [draft, setDraft] = useState(String(minutes));

  const isChip = (DURATION_CHIPS as readonly number[]).includes(minutes);
  const ring = Math.min(1, minutes / 15);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="icon"
          aria-label="Decrease duration"
          onClick={() => bumpDuration(-1)}
        >
          <Minus className="size-5" />
        </Button>
        <ProgressRing progress={ring} className="size-40">
          <p
            className="font-display text-4xl leading-none tracking-tight tabular-nums text-fg"
            aria-live="polite"
          >
            {formatClock(minutes * 60 * 1000)}
          </p>
        </ProgressRing>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Increase duration"
          onClick={() => bumpDuration(1)}
        >
          <Plus className="size-5" />
        </Button>
      </div>

      <div className="flex w-full flex-wrap justify-center gap-2">
        {DURATION_CHIPS.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={minutes === m}
            data-active={minutes === m}
            onClick={() => setDuration(m)}
            className={cn(
              "h-11 min-w-11 rounded-full border border-border px-3 text-sm text-muted transition-[background-color,color,border-color] duration-150",
              minutes === m && "border-transparent bg-accent text-accent-fg",
            )}
          >
            {m}m
          </button>
        ))}
      </div>

      <button
        type="button"
        data-active={!isChip}
        aria-pressed={!isChip}
        onClick={() => {
          setDraft(String(minutes));
          setCustomOpen((o) => !o);
        }}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm text-muted",
          !isChip && "text-accent",
        )}
      >
        <Clock className="size-4" aria-hidden />
        Custom time
      </button>

      {customOpen ? (
        <form
          className="flex w-full items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(draft);
            if (Number.isFinite(n)) setDuration(n);
            setCustomOpen(false);
          }}
        >
          <label className="sr-only" htmlFor="custom-minutes">
            Custom minutes
          </label>
          <input
            id="custom-minutes"
            inputMode="numeric"
            min={DURATION_MIN}
            max={DURATION_MAX}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-11 flex-1 rounded-md border border-border bg-card px-3 text-fg"
          />
          <Button type="submit" size="sm">
            Set
          </Button>
        </form>
      ) : null}
    </div>
  );
}
