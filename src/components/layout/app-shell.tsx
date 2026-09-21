import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";

const HIDE_NAV = new Set([
  "/breathe",
  "/premium",
  "/onboarding",
  "/login",
  "/privacy",
  "/terms",
]);
const BLEED = new Set(["/breathe"]);

export function AppShell({
  children,
  inert,
}: {
  children: ReactNode;
  inert?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideNav = HIDE_NAV.has(pathname);
  const bleed = BLEED.has(pathname);

  return (
    <div
      className="relative mx-auto min-h-dvh w-full max-w-lg"
      inert={inert || undefined}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:text-fg"
      >
        Skip to content
      </a>
      <div
        id="main-content"
        tabIndex={-1}
        className={cn(
          "min-h-dvh",
          bleed
            ? "p-0"
            : "px-5 pt-[max(1.25rem,env(safe-area-inset-top))]",
          hideNav || bleed ? "pb-8" : "pb-28",
        )}
      >
        {children}
      </div>
      {hideNav ? null : <BottomNav />}
    </div>
  );
}
