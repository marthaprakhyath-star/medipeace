import { getLook } from "@/lib/looks";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function LookPhoto({ className }: { className?: string }) {
  const look = getLook(useStore((s) => s.lookId));
  return (
    <img
      src={look.image}
      alt=""
      className={cn("size-full object-cover", className)}
    />
  );
}

export function LookBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <LookPhoto />
      <div className="look-veil absolute inset-0" />
    </div>
  );
}
