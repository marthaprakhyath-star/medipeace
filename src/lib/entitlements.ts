import { useStore } from "@/lib/store";

export function isPremiumUser(): boolean {
  return useStore.getState().isPremium;
}

export function usePremium(): boolean {
  return useStore((s) => s.isPremium);
}

export function canUsePremiumSound(premium: boolean, isPremium: boolean) {
  return !premium || isPremium;
}
