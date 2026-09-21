import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Crown, Pause, Play, Plus, Search, Trash2 } from "lucide-react";
import { SoundCard } from "@/components/library/sound-card";
import { Button } from "@/components/ui/button";
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
import {
  CATALOG_SOUNDS,
  CATEGORY_LABELS,
  type CatalogSound,
} from "@/lib/audio/catalog";
import { audioEngine } from "@/lib/audio/engine";
import {
  addUserTrack,
  deleteUserTrack,
  getUserTrackBlob,
  listUserTracks,
  userSoundId,
} from "@/lib/audio/user-library";
import { formatTrackDuration } from "@/lib/format";
import { CATALOG_ORIGINALITY, MUSIC_RIGHTS_BODY, MUSIC_RIGHTS_TITLE } from "@/lib/legal";
import { useStore } from "@/lib/store";
import type { SoundCategory, UserTrack } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({ component: LibraryPage });

const FILTERS: Array<"all" | SoundCategory> = ["all", "nature", "ambient", "sleep"];

function LibraryPage() {
  const navigate = useNavigate();
  const isPremium = useStore((s) => s.isPremium);
  const selected = useStore((s) => s.selectedSoundId);
  const setSound = useStore((s) => s.setSound);
  const favorites = useStore((s) => s.favorites);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<UserTrack[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [rightsOpen, setRightsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPremium) return;
    void listUserTracks()
      .then(setTracks)
      .catch(() => toast.error("We couldn't load your music just now."));
  }, [isPremium]);

  useEffect(() => {
    return () => {
      audioEngine.stop();
    };
  }, []);

  const sounds = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG_SOUNDS.filter((sound) => {
      if (filter !== "all" && sound.category !== filter) return false;
      if (q && !sound.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, query]);

  async function previewCatalog(sound: CatalogSound) {
    if (sound.premium && !isPremium) {
      void navigate({ to: "/premium" });
      return;
    }
    if (previewId === sound.id) {
      audioEngine.pause();
      setPreviewId(null);
      return;
    }
    const ok = await audioEngine.playCatalog(sound.id, 800);
    if (ok) setPreviewId(sound.id);
  }

  function useCatalog(sound: CatalogSound) {
    if (sound.premium && !isPremium) {
      void navigate({ to: "/premium" });
      return;
    }
    setSound(sound.id);
    toast.success(`${sound.name} will play during meditation.`);
  }

  async function onUpload(file: File | undefined) {
    if (!file) return;
    if (!isPremium) {
      void navigate({ to: "/premium" });
      return;
    }
    try {
      const track = await addUserTrack(file);
      setTracks((list) => [track, ...list]);
      toast.success("Added to My Music. It stays private on this device.");
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "storage") {
        toast.error("That file is a little large. Please try a smaller one.");
      } else {
        toast.error(
          "We couldn't add that audio file. Please try another audio format.",
        );
      }
    }
  }

  async function previewUser(track: UserTrack) {
    const id = userSoundId(track.id);
    if (previewId === id) {
      audioEngine.pause();
      setPreviewId(null);
      return;
    }
    const blob = await getUserTrackBlob(track.id);
    if (!blob) {
      toast.error("That audio file is no longer available.");
      return;
    }
    await audioEngine.playBlob(blob, 600);
    setPreviewId(id);
  }

  async function removeUser(track: UserTrack) {
    await deleteUserTrack(track.id);
    setTracks((list) => list.filter((t) => t.id !== track.id));
    if (selected === userSoundId(track.id)) setSound("ocean-calm");
  }

  return (
    <main className="page-enter flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl tracking-tight">Peace Library</h1>
        <button
          type="button"
          aria-label="Search"
          aria-pressed={searchOpen}
          onClick={() => setSearchOpen((o) => !o)}
          className="grid size-11 place-items-center rounded-full text-muted"
        >
          <Search className="size-5" />
        </button>
      </header>

      <p className="text-sm leading-relaxed text-muted">{CATALOG_ORIGINALITY}</p>

      {searchOpen ? (
        <label className="block">
          <span className="sr-only">Search sounds</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sounds"
            className="h-11 w-full rounded-full border border-border bg-card px-4 text-fg"
          />
        </label>
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((id) => (
          <button
            key={id}
            type="button"
            data-active={filter === id}
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={cn(
              "h-11 shrink-0 rounded-full border border-border px-4 text-sm text-muted",
              filter === id && "border-transparent bg-accent text-accent-fg",
            )}
          >
            {id === "all" ? "All" : CATEGORY_LABELS[id]}
          </button>
        ))}
      </div>

      <section className="flex flex-col">
        {sounds.map((sound) => (
          <SoundCard
            key={sound.id}
            sound={sound}
            locked={sound.premium && !isPremium}
            favorite={favorites.includes(sound.id)}
            previewing={previewId === sound.id}
            selected={selected === sound.id}
            onPreview={() => void previewCatalog(sound)}
            onUse={() => useCatalog(sound)}
            onFavorite={() => toggleFavorite(sound.id)}
          />
        ))}
        {sounds.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            No sounds match that search.
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-accent" aria-hidden />
          <h2 className="font-display text-lg tracking-tight">My Music</h2>
          <span className="text-sm text-subtle">(Premium)</span>
        </div>
        <p className="mt-2 text-sm text-muted">
          Upload audio you have the right to play. It stays private on this
          device and is never sent to us.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="audio/mpeg,audio/mp4,audio/wav,audio/aac,audio/x-m4a,audio/x-wav,.mp3,.m4a,.wav,.aac"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            void onUpload(file);
          }}
        />
        <Button
          variant="start"
          className="mt-4 w-full rounded-full"
          onClick={() => {
            if (!isPremium) {
              void navigate({ to: "/premium" });
              return;
            }
            setRightsOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add My Music
        </Button>
        {isPremium && tracks.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {tracks.map((track) => {
              const id = userSoundId(track.id);
              const playing = previewId === id;
              return (
                <li
                  key={track.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{track.name}</p>
                    <p className="text-sm text-subtle">
                      {formatTrackDuration(track.duration)}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label={playing ? "Pause" : "Play"}
                    onClick={() => void previewUser(track)}
                  >
                    {playing ? (
                      <Pause className="size-4" />
                    ) : (
                      <Play className="size-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSound(id);
                      toast.success("This track will play during meditation.");
                    }}
                  >
                    Use
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete"
                    onClick={() => void removeUser(track)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <AlertDialog open={rightsOpen} onOpenChange={setRightsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{MUSIC_RIGHTS_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>{MUSIC_RIGHTS_BODY}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setRightsOpen(false);
                window.setTimeout(() => fileRef.current?.click(), 50);
              }}
            >
              I have the rights
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
