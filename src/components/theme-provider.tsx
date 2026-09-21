import { useEffect, type ReactNode } from "react";
import { LookBackdrop } from "@/components/look-backdrop";
import { LOOKS } from "@/lib/looks";
import { useStore } from "@/lib/store";
import { useHydration } from "@/lib/use-hydration";
import { useReducedMotion } from "@/lib/use-reduced-motion";

function applyTheme(theme: "light" | "dark" | "system", lookId: string) {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && systemDark);
  root.classList.toggle("dark", dark);
  for (const look of LOOKS) {
    root.classList.toggle(`look-${look.id}`, lookId === look.id);
  }
  const color =
    getComputedStyle(root).getPropertyValue("--mp-bg").trim() ||
    (dark ? "#0d1219" : "#f6f2ec");
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", color);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const hydrated = useHydration();
  const theme = useStore((s) => s.theme);
  const lookId = useStore((s) => s.lookId);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(theme, lookId);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(theme, lookId);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme, lookId, hydrated]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduce);
  }, [reduce]);

  return (
    <>
      <LookBackdrop />
      <div className="relative z-10 min-h-dvh">{children}</div>
    </>
  );
}
