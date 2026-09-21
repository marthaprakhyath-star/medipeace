import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { GoogleMark, XMark, friendlyAuthError } from "@/components/auth-marks";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Button } from "@/components/ui/button";
import {
  GROK_PROVIDERS,
  authClient,
  authEnabled,
  signIn,
} from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { saveProfile } from "@/lib/profile";
import { resizeImageFile } from "@/lib/resize-image";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function AuthGate() {
  const { user, isPending } = useCurrentUserState();
  const guestDisplayName = useStore((s) => s.guestDisplayName);
  const guestAvatarUrl = useStore((s) => s.guestAvatarUrl);
  const lookId = useStore((s) => s.lookId);
  const setGuestProfile = useStore((s) => s.setGuestProfile);
  const completeAuthChoice = useStore((s) => s.completeAuthChoice);

  const [name, setName] = useState(guestDisplayName);
  const [avatar, setAvatar] = useState<string | null>(guestAvatarUrl);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName((current) => current || user.displayName || "");
    setAvatar((current) => current || user.profileImageUrl);
  }, [user]);

  async function persistLocal() {
    const displayName = name.trim().slice(0, 40);
    setGuestProfile({ displayName, avatarUrl: avatar });
    if (user) {
      try {
        await saveProfile({
          data: { displayName, avatarUrl: avatar, lookId },
        });
      } catch {
        /* local name still applies */
      }
    }
  }

  async function continueOn() {
    await persistLocal();
    completeAuthChoice();
  }

  async function onPickPhoto(file: File) {
    try {
      const url = await resizeImageFile(file);
      setAvatar(url);
      setGuestProfile({ avatarUrl: url });
      toast.success("Photo added.");
    } catch {
      toast.error("We couldn't use that image. Please try another photo.");
    }
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await persistLocal();
      if (mode === "up") {
        const { error } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.split("@")[0] || "Friend",
        });
        if (error) {
          setMessage(friendlyAuthError(error.message));
          return;
        }
      } else {
        const { error } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (error) {
          setMessage(friendlyAuthError(error.message));
          return;
        }
      }
      completeAuthChoice();
      window.location.assign("/");
    } catch {
      setMessage("We couldn't complete that just now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const signedIn = Boolean(user);

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-bg px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-fg">
      <header className="flex flex-col items-center text-center">
        <ProfileAvatar
          src={avatar}
          name={name || user?.displayName || "You"}
          editable
          onPick={(file) => void onPickPhoto(file)}
        />
        <h1 className="mt-5 font-display text-3xl tracking-tight">
          {signedIn
            ? `Welcome, ${(name || user?.displayName || "friend").split(" ")[0]}`
            : "Make it yours"}
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
          {signedIn
            ? "Your account is ready. Add a photo if you like, then continue."
            : "Sign in to keep your photo, name, and look with you. Meditation still works without an account."}
        </p>
      </header>

      <label className="mt-8 block">
        <span className="text-sm text-muted">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="What should we call you?"
          className="mt-2 h-12 w-full rounded-lg border border-border bg-card px-4 text-fg"
        />
      </label>

      {isPending ? (
        <div
          className="mt-8 h-12 animate-pulse rounded-xl bg-surface"
          aria-hidden
        />
      ) : signedIn ? (
        <Button
          variant="start"
          size="lg"
          className="mt-8 w-full rounded-full"
          onClick={() => void continueOn()}
        >
          Continue
        </Button>
      ) : (
        <>
          {authEnabled ? (
            <div className="mt-8 flex flex-col gap-3">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  variant="secondary"
                  className="w-full rounded-full"
                  onClick={() => {
                    void persistLocal();
                    signIn(p.providerId, { callbackURL: "/" });
                  }}
                >
                  {p.idp === "google" ? <GoogleMark /> : <XMark />}
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="my-6 flex items-center gap-3 text-xs tracking-wide text-subtle uppercase">
            <span className="h-px flex-1 bg-border" />
            or email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => void onEmail(e)}
          >
            {mode === "up" ? (
              <p className="text-sm text-muted">
                Create an account with the name above.
              </p>
            ) : null}
            <label className="block">
              <span className="sr-only">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="h-12 w-full rounded-lg border border-border bg-card px-4 text-fg"
              />
            </label>
            <label className="block">
              <span className="sr-only">Password</span>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={
                  mode === "up" ? "new-password" : "current-password"
                }
                className="h-12 w-full rounded-lg border border-border bg-card px-4 text-fg"
              />
            </label>
            {message ? (
              <p className="text-sm text-muted" role="alert">
                {message}
              </p>
            ) : null}
            <Button
              type="submit"
              variant="start"
              size="lg"
              className="rounded-full"
              disabled={busy}
            >
              {mode === "up" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <button
            type="button"
            className="mt-4 min-h-11 text-sm text-muted"
            onClick={() => {
              setMode((m) => (m === "in" ? "up" : "in"));
              setMessage(null);
            }}
          >
            {mode === "up"
              ? "Already have an account? Sign in"
              : "New here? Create an account"}
          </button>

          <button
            type="button"
            className="mt-6 min-h-11 text-sm text-subtle"
            onClick={() => void continueOn()}
          >
            Continue without an account
          </button>
        </>
      )}

      <p className="mt-auto pt-8 text-center text-xs text-subtle">
        <Link to="/privacy" className="underline-offset-2 hover:underline">
          Privacy
        </Link>
        {" · "}
        <Link to="/terms" className="underline-offset-2 hover:underline">
          Terms
        </Link>
      </p>
    </div>
  );
}
