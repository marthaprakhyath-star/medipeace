import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export function useReducedMotion() {
  const userPref = useStore((s) => s.reducedMotion);
  const [osPref, setOsPref] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setOsPref(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return userPref || osPref;
}
