import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Ban,
  BarChart3,
  Crown,
  Leaf,
  Music,
  Wind,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/premium")({ component: PremiumPage });

const BENEFITS = [
  {
    icon: Music,
    title: "Upload your own music",
    copy: "Unlimited personal audio, private on this device.",
  },
  {
    icon: Leaf,
    title: "More meditation sounds",
    copy: "Exclusive premium beds and night textures.",
  },
  {
    icon: Wind,
    title: "Advanced breathing patterns",
    copy: "4-7-8 and Deep Calm, when you want them.",
  },
  {
    icon: BarChart3,
    title: "Detailed insights",
    copy: "Understand your journey without guilt.",
  },
  {
    icon: Ban,
    title: "No supporter messages",
    copy: "Free sits begin with a short notice. Premium never shows it, and nothing ever plays during a live session.",
  },
];

function PremiumPage() {
  const navigate = useNavigate();
  const isPremium = useStore((s) => s.isPremium);
  const setPremium = useStore((s) => s.setPremium);

  function startPremium() {
    setPremium(true);
    toast.success("Welcome. Medipeace is yours now.");
    void navigate({ to: "/" });
  }

  function restore() {
    if (isPremium) {
      toast.success("Your Premium access is already here.");
      return;
    }
    setPremium(true);
    toast.success("Premium restored on this device.");
  }

  return (
    <main className="page-enter relative flex flex-col gap-8">
      <button
        type="button"
        aria-label="Close"
        onClick={() => void navigate({ to: "/" })}
        className="absolute right-0 top-0 grid size-11 place-items-center text-muted"
      >
        <X className="size-5" />
      </button>

      <header className="mt-6 flex flex-col items-center text-center">
        <Crown className="size-10 text-accent" aria-hidden />
        <h1 className="mt-5 font-display text-4xl tracking-tight">
          Unlock Your Peace
        </h1>
        <p className="mt-3 text-muted">Make Medipeace truly yours.</p>
      </header>

      <ul className="flex flex-col gap-3">
        {BENEFITS.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.title}
              className="flex gap-4 rounded-xl bg-card px-4 py-4"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-accent">
                <Icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block font-medium">{item.title}</span>
                <span className="mt-0.5 block text-sm text-muted">
                  {item.copy}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {isPremium ? (
        <div className="rounded-xl bg-surface px-4 py-4 text-center text-sm text-muted">
          Premium is active on this device.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Button
            variant="start"
            size="lg"
            className="rounded-full"
            onClick={startPremium}
          >
            Start Premium
          </Button>
          <Button variant="ghost" onClick={restore}>
            Restore Purchase
          </Button>
          <p className="px-2 text-center text-xs leading-relaxed text-subtle">
            This preview unlocks Premium on this device. Apple and Google
            billing, refunds, and restore will apply when Medipeace is listed
            on the App Store and Google Play.
          </p>
        </div>
      )}
    </main>
  );
}
