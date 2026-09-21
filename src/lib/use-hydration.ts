import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useStore.persist.onFinishHydration(finish);
    void useStore.persist.rehydrate();
    if (useStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  return hydrated;
}
