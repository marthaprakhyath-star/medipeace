import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null;
  name: string;
  size?: "sm" | "lg";
  editable?: boolean;
  onPick?: (file: File) => void;
};

export function ProfileAvatar({
  src,
  name,
  size = "lg",
  editable = false,
  onPick,
}: Props) {
  const initial = (name.trim().charAt(0) || "M").toUpperCase();
  const dim = size === "lg" ? "size-24" : "size-10";

  const inner = src ? (
    <img
      src={src}
      alt={editable ? "" : `${name} profile photo`}
      className="size-full object-cover"
    />
  ) : (
    <span className="grid size-full place-items-center bg-surface font-display text-accent">
      {initial}
    </span>
  );

  if (!editable) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-full border border-border bg-card",
          dim,
        )}
      >
        {inner}
      </div>
    );
  }

  return (
    <label
      className={cn("relative block cursor-pointer", dim)}
      aria-label="Add a profile photo"
    >
      <span className="block size-full overflow-hidden rounded-full border border-border bg-card">
        {inner}
      </span>
      <span className="absolute right-0 bottom-0 grid size-8 place-items-center rounded-full bg-accent text-accent-fg">
        <Camera className="size-4" aria-hidden />
      </span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick?.(file);
        }}
      />
    </label>
  );
}
