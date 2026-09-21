import type { UserTrack } from "@/lib/types";

const DB_NAME = "medipeace";
const DB_VERSION = 1;
const STORE = "user-audio";

const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/aac",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/x-m4a",
  "audio/m4a",
  "audio/webm",
];

const ALLOWED_EXT = [".mp3", ".m4a", ".wav", ".aac", ".mp4"];
const MAX_BYTES = 25 * 1024 * 1024;

export function isSupportedAudioFile(file: File): boolean {
  const typeOk = !file.type || ALLOWED_TYPES.includes(file.type.toLowerCase());
  const name = file.name.toLowerCase();
  const extOk = ALLOWED_EXT.some((ext) => name.endsWith(ext));
  return typeOk || extOk;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

type StoredTrack = UserTrack & { blob: Blob };

export async function listUserTracks(): Promise<UserTrack[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as StoredTrack[]).map(
        ({ blob: _blob, ...meta }) => meta,
      );
      rows.sort((a, b) => b.createdAt - a.createdAt);
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getUserTrackBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => {
      const row = req.result as StoredTrack | undefined;
      resolve(row?.blob ?? null);
    };
    req.onerror = () => reject(req.error);
  });
}

function readDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    const url = URL.createObjectURL(file);
    const done = (value: number) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    audio.onloadedmetadata = () =>
      done(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.onerror = () => done(0);
    audio.src = url;
  });
}

export async function addUserTrack(file: File): Promise<UserTrack> {
  if (file.size > MAX_BYTES) {
    throw new Error("storage");
  }
  if (!isSupportedAudioFile(file)) {
    throw new Error("format");
  }
  const duration = await readDuration(file);
  if (!duration) {
    throw new Error("format");
  }
  const track: StoredTrack = {
    id: crypto.randomUUID(),
    name: file.name.replace(/\.[^/.]+$/, "") || "Untitled",
    duration,
    mimeType: file.type || "audio/mpeg",
    createdAt: Date.now(),
    blob: file,
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(track);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  const { blob: _blob, ...meta } = track;
  return meta;
}

export async function deleteUserTrack(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllUserTracks(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function userSoundId(trackId: string) {
  return `user:${trackId}`;
}

export function parseUserSoundId(soundId: string): string | null {
  return soundId.startsWith("user:") ? soundId.slice(5) : null;
}
