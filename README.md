# Medipeace

A quiet meditation app: set your time, choose your sound, find your peace.

## Features

- Home dashboard with greeting, moods, and one-tap Start
- Meditation timer with breathing circle, pause, and completion bell
- Peace Library of original ambient sounds
- Premium personal music from your device
- My Journey history, streaks, and presets
- Breathe mode
- Four atmospheres (Moonlit Night, Dawn Mist, Forest Canopy, Desert Zen)
- Profile photo, name, and sign-in (Google, X, or email)
- First-run wellness disclaimer after sign-in

## Stack

TanStack Start, React 19, Tailwind CSS, Zustand, Better Auth, Postgres (Neon in production, PGLite locally).

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL. Sign-in uses Google, X, and email/password. Without a production database URL, data lives in a local Postgres fallback.

```bash
npm run build
npm run typecheck
```

## First-run flow

1. Welcome
2. Sign in, create an account, or continue as a guest
3. Wellness disclaimer — **I understand** stays at the bottom
4. Home

## Project layout

```
src/routes/          pages (home, meditate, library, journey, profile, login, privacy, terms)
src/components/      UI, session overlay, brand, first-run gates
src/lib/audio/       live Web Audio engine and sound catalog
src/lib/auth/        Better Auth wiring
src/lib/legal.ts     privacy, terms, and wellness copy
migrations/          auth + profile schema
public/looks/        atmosphere backgrounds
public/voice/        breathe-in / breathe-out guides
```

## Before pushing to GitHub

- Do not commit `.env`, API keys, or database URLs. `.gitignore` already excludes them.
- Do not commit `node_modules/`, `.vercel/`, `screenshots/`, or zip archives.
- Keep `public/voice/*.mp3` and `public/looks/*.jpg` — the app needs those files.
- Confirm Privacy Policy and Terms of Use still match what the app actually stores.
- Create an empty GitHub repo named `medipeace`, then push this source. The connected GitHub account needs permission to create repositories.

## Before Play Store and App Store

This build is the web app. Store listings need a native wrap (Capacitor for both stores, or TWA for Android only) plus:

| Must have | Why |
|---|---|
| Apple/Google in-app purchases | Replace on-device “Start Premium”. Web unlocks will be rejected. |
| Sign in with Apple on iOS | Required if Google or X login is offered on iPhone. |
| In-app account deletion | Apple 5.1.1(v) if accounts exist. |
| Privacy Policy & Terms URLs | Live https links in store listings and in the app. |
| Data safety / privacy nutrition | Play Data safety form; Apple privacy labels. |
| Health disclaimer | Already in-app; repeat in store description (not a medical device). |
| Music rights | Catalog is original synthesis. User uploads stay on-device with a rights confirm. |
| Ads declaration | Free tier uses a first-party supporter pause, never during a sit. Declare it. No AdMob until a native SDK is added. |
| 1024px icon, screenshots, age rating | Store chrome. Age 4+ / Everyone if no user-generated chat. |
| Accessibility | WCAG 2.2 AA, 44pt iOS targets, VoiceOver/TalkBack pass. |
| Test on real devices | iOS silent switch, Android back during a sit, background audio, Dynamic Type. |

Do not ship the current “Start Premium” as a paid store product until native billing is wired.

## License

Personal project. Original sounds are synthesized in the browser and are not third-party recordings.
