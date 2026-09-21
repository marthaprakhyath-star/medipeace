import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, BookOpen, Flower2, Home, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/meditate", label: "Meditate", icon: Flower2 },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/journey", label: "Journey", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 bg-bg/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
      aria-label="Main"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 border-t border-border">
        {ITEMS.map((item) => {
          const active =
            item.to === "/"
              ? pathname === "/"
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-xs tracking-wide",
                  active ? "text-accent" : "text-subtle",
                )}
              >
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2.2 : 1.7}
                  aria-hidden
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
