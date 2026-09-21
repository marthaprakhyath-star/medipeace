import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { LegalGate } from "@/components/legal-gate";
import { Onboarding } from "@/components/onboarding";
import { SessionHost } from "@/components/meditation/session-overlay";
import { Splash } from "@/components/splash";
import { Toaster, toast } from "sonner";
import { audioEngine } from "@/lib/audio/engine";
import { useEffect } from "react";
import { useHydration } from "@/lib/use-hydration";
import { useStore } from "@/lib/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import appCss from "../styles.css?url";

const APP_NAME = "Medipeace";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: APP_NAME },
      {
        name: "description",
        content: "A little time for a peaceful mind.",
      },
      { name: "theme-color", content: "#0d1219" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "format-detection", content: "telephone=no" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Outfit:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" className="look-dawn antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem("medipeace-store")||"{}");var t=(s.state&&s.state.theme)||"light";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);var look=(s.state&&s.state.lookId)||"dawn";["moonlit","dawn","forest","zen"].forEach(function(id){document.documentElement.classList.toggle("look-"+id,id===look);});}catch(e){}`,
          }}
        />
        <PreviewHostBridge />
        <AuthProvider>
          <ThemeProvider>
            <AppGate />
            <Toaster
              position="top-center"
              offset={24}
              toastOptions={{
                className:
                  "font-sans border border-border bg-card text-fg shadow-card",
              }}
            />
          </ThemeProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

const LEGAL_PATHS = new Set(["/privacy", "/terms"]);

function AppGate() {
  const hydrated = useHydration();
  const hasOnboarded = useStore((s) => s.hasOnboarded);
  const hasAcceptedLegal = useStore((s) => s.hasAcceptedLegal);
  const hasChosenAuth = useStore((s) => s.hasChosenAuth);
  const sessionStatus = useStore((s) => s.sessionStatus);
  const { isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const legalPath = LEGAL_PATHS.has(pathname);
  const sessionOpen = sessionStatus !== "idle";

  useEffect(() => {
    if (!hydrated) return;
    useStore.getState().hydrateSessionAfterLoad();
  }, [hydrated]);

  useEffect(() => {
    const unsub = audioEngine.on((event, detail) => {
      if (event === "error" && detail) toast.error(detail);
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const unlock = () => {
      void audioEngine.unlock();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  if (!hydrated) return <Splash />;
  if (!hasOnboarded && !legalPath) return <Onboarding />;
  if (!hasChosenAuth && !legalPath) {
    if (isPending) return <Splash />;
    return <AuthGate />;
  }
  if (!hasAcceptedLegal && !legalPath) return <LegalGate />;

  return (
    <>
      <AppShell inert={sessionOpen}>
        <Outlet />
      </AppShell>
      <SessionHost />
    </>
  );
}
