import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import {
  LEGAL_UPDATED,
  WELLNESS_DISCLAIMER_BODY,
  WELLNESS_DISCLAIMER_TITLE,
} from "@/lib/legal";
import { useStore } from "@/lib/store";

export function LegalGate() {
  const accept = useStore((s) => s.acceptLegal);

  return (
    <div className="relative mx-auto flex h-dvh min-h-dvh w-full max-w-lg flex-col bg-bg text-fg">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex flex-col items-center text-center">
          <Logo className="size-16" />
          <h1 className="mt-5 font-display text-3xl tracking-tight">
            {WELLNESS_DISCLAIMER_TITLE}
          </h1>
          <p className="mt-2 text-sm text-muted">Updated {LEGAL_UPDATED}</p>
        </div>
        <ul className="mt-8 flex flex-col gap-4">
          {WELLNESS_DISCLAIMER_BODY.map((item) => (
            <li
              key={item.slice(0, 32)}
              className="rounded-xl bg-card px-4 py-4 text-sm leading-relaxed text-muted shadow-card"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 pb-6 text-center text-sm text-subtle">
          Read the{" "}
          <Link
            to="/privacy"
            className="text-fg underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            to="/terms"
            className="text-fg underline-offset-2 hover:underline"
          >
            Terms of Use
          </Link>
          .
        </p>
      </div>
      <div className="shrink-0 border-t border-border bg-bg px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Button
          variant="start"
          size="lg"
          className="w-full rounded-full"
          onClick={accept}
        >
          I understand
        </Button>
      </div>
    </div>
  );
}
