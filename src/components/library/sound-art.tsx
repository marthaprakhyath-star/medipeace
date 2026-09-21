import { cn } from "@/lib/utils";

const PHOTOS: Record<string, string> = {
  "ocean-calm": "/looks/moonlit.jpg",
  "gentle-rain": "/looks/dawn.jpg",
  "forest": "/looks/forest.jpg",
  "river": "/looks/zen.jpg",
  "birds": "/looks/forest.jpg",
  "deep-sleep": "/looks/moonlit.jpg",
  "night-calm": "/looks/moonlit.jpg",
  "soft-rain": "/looks/dawn.jpg",
};

export function SoundArt({
  soundId,
  className,
}: {
  soundId: string;
  className?: string;
}) {
  const photo = PHOTOS[soundId];
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className={cn("object-cover", className)}
      />
    );
  }

  const n = soundId.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const variant = n % 3;

  return (
    <div
      className={cn("relative overflow-hidden bg-surface text-accent", className)}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" className="size-full">
        {variant === 0 ? (
          <>
            <circle cx="32" cy="32" r="22" fill="currentColor" opacity="0.16" />
            <circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.55" />
            <circle cx="32" cy="32" r="6" fill="currentColor" opacity="0.8" />
          </>
        ) : variant === 1 ? (
          <>
            <path
              d="M4 40c8-10 12-10 20 0s12 10 20 0 12-10 20 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              opacity="0.45"
            />
            <path
              d="M4 50c8-10 12-10 20 0s12 10 20 0 12-10 20 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              opacity="0.7"
            />
          </>
        ) : (
          <>
            <rect x="14" y="22" width="8" height="28" rx="4" fill="currentColor" opacity="0.35" />
            <rect x="28" y="14" width="8" height="36" rx="4" fill="currentColor" opacity="0.55" />
            <rect x="42" y="26" width="8" height="24" rx="4" fill="currentColor" opacity="0.8" />
          </>
        )}
      </svg>
    </div>
  );
}
