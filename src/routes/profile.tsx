import { Check } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProfileAvatar } from "@/components/profile-avatar";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { breathVoice } from "@/lib/audio/breath-voice";
import { LOOKS, type LookId } from "@/lib/looks";
import { CATALOG_ORIGINALITY } from "@/lib/legal";
import { getProfile, saveProfile } from "@/lib/profile";
import { resizeImageFile } from "@/lib/resize-image";
import { useStore } from "@/lib/store";
import type { BreathVoiceGender, ThemePreference } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

const VOICE_OPTIONS: Array<{ id: BreathVoiceGender; label: string; blurb: string }> = [
  { id: "female", label: "Female", blurb: "Soft and soothing" },
  { id: "male", label: "Male", blurb: "Warm and steady" },
];

function ProfilePage() {
  const { user, isPending } = useCurrentUserState();
  const isPremium = useStore((s) => s.isPremium);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const reduced = useStore((s) => s.reducedMotion);
  const setReduced = useStore((s) => s.setReducedMotion);
  const lookId = useStore((s) => s.lookId);
  const setLook = useStore((s) => s.setLook);
  const guestDisplayName = useStore((s) => s.guestDisplayName);
  const guestAvatarUrl = useStore((s) => s.guestAvatarUrl);
  const setGuestProfile = useStore((s) => s.setGuestProfile);
  const voiceMuted = useStore((s) => s.breathVoiceMuted);
  const setVoiceMuted = useStore((s) => s.setBreathVoiceMuted);
  const voiceGender = useStore((s) => s.breathVoiceGender);
  const setVoiceGender = useStore((s) => s.setBreathVoiceGender);
  const clearDeviceData = useStore((s) => s.clearDeviceData);

  const [name, setName] = useState(guestDisplayName);
  const [avatar, setAvatar] = useState<string | null>(guestAvatarUrl);
  const [saving, setSaving] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setName(guestDisplayName);
      setAvatar(guestAvatarUrl);
      return;
    }
    void getProfile()
      .then((row) => {
        setName(row.displayName ?? user.displayName ?? "");
        setAvatar(row.avatarUrl ?? user.profileImageUrl);
        setLook(row.lookId);
      })
      .catch(() => {
        setName(user.displayName ?? "");
        setAvatar(user.profileImageUrl);
      });
  }, [isPending, user, guestDisplayName, guestAvatarUrl, setLook]);

  async function persist(next: {
    displayName?: string;
    avatarUrl?: string | null;
    lookId?: LookId;
  }) {
    const displayName = next.displayName ?? name;
    const avatarUrl = next.avatarUrl !== undefined ? next.avatarUrl : avatar;
    const nextLook = next.lookId ?? lookId;
    if (user) {
      setSaving(true);
      try {
        await saveProfile({
          data: { displayName, avatarUrl, lookId: nextLook },
        });
      } catch {
        toast.error("We couldn't save that just now. Please try again.");
      } finally {
        setSaving(false);
      }
    } else {
      setGuestProfile({ displayName, avatarUrl });
    }
  }

  async function onPickPhoto(file: File) {
    try {
      const url = await resizeImageFile(file);
      setAvatar(url);
      await persist({ avatarUrl: url });
      toast.success("Photo added.");
    } catch {
      toast.error("We couldn't use that image. Please try another photo.");
    }
  }

  async function onClear() {
    await clearDeviceData();
    setName("");
    setAvatar(null);
    setConfirmClear(false);
    toast.success("This device is clear. Your sit is still here.");
  }

  const signedIn = Boolean(user);

  return (
    <main className="page-enter flex flex-col gap-8">
      <header className="flex flex-col items-center text-center">
        <ProfileAvatar
          src={avatar}
          name={name || user?.displayName || "You"}
          editable
          onPick={(file) => void onPickPhoto(file)}
        />
        <h1 className="mt-4 font-display text-2xl tracking-tight">
          {name || (signedIn ? user?.displayName : "Your space") || "Your space"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {signedIn
            ? user?.primaryEmail
            : "Add a photo and name — sign in to keep them."}
        </p>
      </header>

      <label className="block">
        <span className="text-sm text-muted">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => void persist({ displayName: name })}
          placeholder="What should we call you?"
          className="mt-2 h-12 w-full rounded-lg border border-border bg-card px-4 text-fg"
        />
      </label>

      {isPending ? (
        <div className="h-12 animate-pulse rounded-xl bg-surface" />
      ) : signedIn ? (
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <UserButton />
        </div>
      ) : (
        <Button asChild variant="start" size="lg">
          <Link to="/login">Sign in</Link>
        </Button>
      )}

      <section>
        <h2 className="font-display text-xl tracking-tight">Choose a look</h2>
        <p className="mt-1 text-sm text-muted">
          Four atmospheres. Tap one — we’ll refine it after you choose.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {LOOKS.map((look) => (
            <button
              key={look.id}
              type="button"
              onClick={() => {
                setLook(look.id);
                setTheme(look.scheme);
                void persist({ lookId: look.id });
              }}
              className={cn(
                "relative overflow-hidden rounded-xl border border-border bg-card text-left shadow-card",
                lookId === look.id && "border-accent",
              )}
            >
              <img
                src={look.image}
                alt={look.name}
                className="aspect-[3/4] w-full object-cover"
              />
              {lookId === look.id ? (
                <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-accent text-accent-fg">
                  <Check className="size-4" aria-hidden />
                </span>
              ) : null}
              <span className="block px-3 py-2">
                <span className="block text-sm font-medium">{look.name}</span>
                <span className="block text-xs text-muted">{look.blurb}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-card p-5 shadow-card">
        <p className="text-sm tracking-wide text-subtle">
          {isPremium ? "Premium" : "Free"}
        </p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">
          {isPremium ? "Medipeace is yours" : "Unlock Your Peace"}
        </h2>
        <Button asChild className="mt-4">
          <Link to="/premium">{isPremium ? "Manage Premium" : "See Premium"}</Link>
        </Button>
      </section>

      <section>
        <h2 className="font-display text-xl tracking-tight">Appearance</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(["light", "dark", "system"] as ThemePreference[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className="h-11 rounded-lg border border-border bg-card text-sm capitalize data-[on=true]:border-transparent data-[on=true]:bg-accent data-[on=true]:text-accent-fg"
              data-on={theme === value}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Breathing voice</p>
            <p className="text-sm text-muted">
              Guide says breathe in and breathe out.
            </p>
          </div>
          <Switch
            checked={!voiceMuted}
            onCheckedChange={(on) => {
              setVoiceMuted(!on);
              if (!on) breathVoice.stop();
            }}
            aria-label="Breathing voice"
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {VOICE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setVoiceGender(option.id);
                breathVoice.setGender(option.id);
                void breathVoice.prefetch(option.id);
              }}
              className="rounded-lg border border-border bg-bg px-3 py-3 text-left data-[on=true]:border-transparent data-[on=true]:bg-accent data-[on=true]:text-accent-fg"
              data-on={voiceGender === option.id}
            >
              <span className="block text-sm font-medium">{option.label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-xs text-muted",
                  voiceGender === option.id && "text-accent-fg/80",
                )}
              >
                {option.blurb}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-4">
        <div>
          <p className="font-medium">Reduced motion</p>
          <p className="text-sm text-muted">Softer, stiller animations.</p>
        </div>
        <Switch
          checked={reduced}
          onCheckedChange={setReduced}
          aria-label="Reduced motion"
        />
      </section>

      <section className="rounded-xl border border-border bg-card px-4 py-4">
        <p className="font-medium">Privacy & legal</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Your photo and name stay with your account. Personal audio never
          leaves this device. File access is requested only when you add a
          photo or music.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {CATALOG_ORIGINALITY}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/privacy" className="underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          <Link to="/terms" className="underline-offset-2 hover:underline">
            Terms of Use
          </Link>
        </div>
        <Button
          variant="outline"
          className="mt-5 w-full rounded-full"
          onClick={() => setConfirmClear(true)}
        >
          Clear data on this device
        </Button>
      </section>

      <p className="text-center text-xs text-subtle">
        {saving ? "Saving…" : null}
      </p>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this device?</AlertDialogTitle>
            <AlertDialogDescription>
              Journey history, guest profile, and personal music on this device
              will be removed. Signed-in account details stay with your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onClear()}>
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
