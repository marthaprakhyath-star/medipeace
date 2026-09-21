import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { GoogleMark, XMark, friendlyAuthError } from "@/components/auth-marks";
import {
  GROK_PROVIDERS,
  authClient,
  authEnabled,
  signIn,
} from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const completeAuthChoice = useStore((s) => s.completeAuthChoice);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <div className="h-12 w-12 animate-pulse rounded-full bg-surface" />
      </main>
    );
  }
  if (user) return <Navigate to="/" />;

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
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

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6 py-10">
      <Logo className="size-12" />
      <h1 className="mt-6 font-display text-3xl tracking-tight">
        {mode === "up" ? "Make it yours" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Sign in to keep your photo, name, and look with you. Meditation still
        works without an account.
      </p>

      {authEnabled ? (
        <div className="mt-8 flex flex-col gap-3">
          {GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              variant="secondary"
              className="w-full"
              onClick={() => signIn(p.providerId, { callbackURL: "/" })}
            >
              {p.idp === "google" ? <GoogleMark /> : <XMark />}
              Continue with {p.label}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted">Sign-in is disabled.</p>
      )}

      <div className="my-8 flex items-center gap-3 text-xs tracking-wide text-subtle uppercase">
        <span className="h-px flex-1 bg-border" />
        or email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="flex flex-col gap-3" onSubmit={(e) => void onEmail(e)}>
        {mode === "up" ? (
          <label className="block">
            <span className="sr-only">Your name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="h-12 rounded-lg border border-border bg-card px-4 text-fg"
            />
          </label>
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
            className="h-12 rounded-lg border border-border bg-card px-4 text-fg"
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
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            className="h-12 rounded-lg border border-border bg-card px-4 text-fg"
          />
        </label>
        {message ? (
          <p className="text-sm text-muted" role="alert">
            {message}
          </p>
        ) : null}
        <Button type="submit" variant="start" size="lg" disabled={busy}>
          {mode === "up" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <button
        type="button"
        className="mt-4 text-sm text-muted"
        onClick={() => {
          setMode((m) => (m === "in" ? "up" : "in"));
          setMessage(null);
        }}
      >
        {mode === "up"
          ? "Already have an account? Sign in"
          : "New here? Create an account"}
      </button>

      <Link
        to="/"
        className="mt-8 text-center text-sm text-subtle"
        onClick={() => completeAuthChoice()}
      >
        Continue without an account
      </Link>
      <p className="mt-6 text-center text-xs text-subtle">
        <Link to="/privacy" className="underline-offset-2 hover:underline">
          Privacy
        </Link>
        {" · "}
        <Link to="/terms" className="underline-offset-2 hover:underline">
          Terms
        </Link>
      </p>
    </main>
  );
}

