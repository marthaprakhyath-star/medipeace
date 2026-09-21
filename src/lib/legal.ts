export const LEGAL_UPDATED = "September 2026";

export const WELLNESS_DISCLAIMER_TITLE = "Before you begin";

export const WELLNESS_DISCLAIMER_BODY = [
  "Medipeace is a wellness app for relaxation and meditation. It is not medical advice, diagnosis, or treatment, and it is not a substitute for care from a qualified professional.",
  "If you feel unwell, dizzy, or distressed while breathing or sitting, stop, sit up slowly, and seek help if you need it. Do not use Medipeace while driving or anywhere you must stay fully alert.",
  "The Peace Library sounds are original textures created inside the app — not commercial recordings. If you add your own music, you confirm you have the right to play it privately on this device.",
  "The free experience may show a short supporter message before a timed sit, so Medipeace can stay available. Premium skips those messages. Nothing plays during a live session.",
] as const;

export const MUSIC_RIGHTS_TITLE = "Your music, your rights";

export const MUSIC_RIGHTS_BODY =
  "Only add audio you created or have permission to play. Files stay on this device and are never uploaded. Commercial tracks from streaming services, albums, or other apps usually cannot be copied here without a license.";

export const CATALOG_ORIGINALITY =
  "Library sounds are original Medipeace textures, synthesised in the app. They are not licensed commercial recordings.";

export const PRIVACY_SECTIONS = [
  {
    title: "What Medipeace stores on this device",
    body: "Session history, preferences, look, and guest name or photo live in this browser. Personal music lives in on-device storage and never leaves the device. We do not sell personal data.",
  },
  {
    title: "If you sign in",
    body: "Your display name, photo, and chosen look can be saved with your account so they return on this device. Meditation audio you upload is still private to the device and is not sent to our servers.",
  },
  {
    title: "Voice, photos, and files",
    body: "Breathing-guide clips are included with the app. Camera, photo, and file access are requested only when you add a profile photo or your own music.",
  },
  {
    title: "Supporter messages",
    body: "Free sits may show a short first-party supporter message before a session starts. These are not third-party ad networks and they never play during a live sit. Premium removes them.",
  },
  {
    title: "Clearing data",
    body: "You can clear local history, settings, and personal music from Profile. Signing out does not erase on-device music unless you clear it.",
  },
] as const;

export const TERMS_SECTIONS = [
  {
    title: "A wellness product, not clinical care",
    body: "By using Medipeace you agree it is for general wellness and relaxation only. You use breathing exercises at your own pace and discretion.",
  },
  {
    title: "Accounts and Premium",
    body: "Sign-in is optional. Premium features on this version are unlocked on the device you choose. Store billing, refunds, and restorations will follow Apple or Google rules when the native apps are listed.",
  },
  {
    title: "Sound and music",
    body: "Catalog audio and breathing-guide voices are original to Medipeace. You may not extract, resell, or redistribute them. Your uploads remain yours; you grant only a local licence for playback inside the app on this device.",
  },
  {
    title: "Acceptable use",
    body: "Do not upload unlawful content, malware, or audio you do not have rights to. We may remove access if the app is misused.",
  },
  {
    title: "Limitation",
    body: "Medipeace is provided as-is. To the extent allowed by law, we are not liable for indirect or wellness outcomes from using the app. Your consumer rights remain unchanged.",
  },
] as const;
