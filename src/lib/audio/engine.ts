import { connectCatalogSound, playBell, type StopHandle } from "@/lib/audio/render";

export type AudioEngineEvent =
  | "interrupted"
  | "ended"
  | "error"
  | "playing"
  | "paused";

type Listener = (event: AudioEngineEvent, detail?: string) => void;

const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private fade: GainNode | null = null;
  private keepAlive: HTMLAudioElement | null = null;
  private stopCurrent: StopHandle | null = null;
  private bufferSource: AudioBufferSourceNode | null = null;
  private voiceGain: GainNode | null = null;
  private userPaused = true;
  private listeners = new Set<Listener>();
  private fadeToken = 0;
  volume = 0.72;
  playing = false;

  on(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: AudioEngineEvent, detail?: string) {
    this.listeners.forEach((l) => l(event, detail));
  }

  private ensureGraph() {
    if (typeof window === "undefined") return null;
    if (this.ctx) return this.ctx;
    const Ctx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = this.volume;
    const fade = ctx.createGain();
    fade.gain.value = 1;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 18;
    compressor.ratio.value = 2.2;
    compressor.attack.value = 0.03;
    compressor.release.value = 0.25;
    fade.connect(compressor);
    compressor.connect(master);
    master.connect(ctx.destination);

    const keepAlive = new Audio(SILENT_WAV);
    keepAlive.loop = true;
    keepAlive.setAttribute("playsinline", "true");
    keepAlive.setAttribute("webkit-playsinline", "true");

    this.ctx = ctx;
    this.master = master;
    this.fade = fade;
    this.keepAlive = keepAlive;
    return ctx;
  }

  /** Shared graph for ambient sound and the breathing guide. */
  context() {
    return this.ensureGraph();
  }

  voiceOutput() {
    const ctx = this.ensureGraph();
    if (!ctx) return null;
    if (!this.voiceGain) {
      const gain = ctx.createGain();
      gain.gain.value = 0.86;
      gain.connect(ctx.destination);
      this.voiceGain = gain;
    }
    return this.voiceGain;
  }

  async unlock() {
    const ctx = this.ensureGraph();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        /* gesture may be required again */
      }
    }
    try {
      await this.keepAlive?.play();
    } catch {
      /* keep-alive is best-effort */
    }
  }

  setVolume(value: number) {
    this.volume = Math.min(1, Math.max(0, value));
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(
        this.volume,
        this.ctx.currentTime,
        0.04,
      );
    }
  }

  private async fadeTo(target: number, ms: number) {
    const ctx = this.ctx;
    const fade = this.fade;
    if (!ctx || !fade) return;
    const token = ++this.fadeToken;
    const start = fade.gain.value;
    const duration = Math.max(40, ms) / 1000;
    fade.gain.cancelScheduledValues(ctx.currentTime);
    fade.gain.setValueAtTime(Math.max(0.0001, start), ctx.currentTime);
    fade.gain.linearRampToValueAtTime(
      Math.max(0.0001, target),
      ctx.currentTime + duration,
    );
    await new Promise((r) => setTimeout(r, ms));
    if (token !== this.fadeToken) return;
    if (target === 0) fade.gain.setValueAtTime(0, ctx.currentTime);
  }

  private haltSource() {
    this.stopCurrent?.();
    this.stopCurrent = null;
    try {
      this.bufferSource?.stop();
    } catch {
      /* already stopped */
    }
    this.bufferSource = null;
  }

  async playCatalog(id: string, fadeInMs = 4000): Promise<boolean> {
    const ctx = this.ensureGraph();
    if (!ctx || !this.fade) {
      this.emit("error", "Audio isn't available in this browser.");
      return false;
    }
    try {
      await this.unlock();
      this.haltSource();
      this.fade.gain.cancelScheduledValues(ctx.currentTime);
      this.fade.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.stopCurrent = connectCatalogSound(ctx, this.fade, id);
      this.userPaused = false;
      this.playing = true;
      this.emit("playing");
      this.applyMediaSession();
      void this.fadeTo(1, fadeInMs);
      return true;
    } catch {
      this.emit("error", "We couldn't play that sound. Please try another.");
      return false;
    }
  }

  async playBlob(blob: Blob, fadeInMs = 4000): Promise<boolean> {
    const ctx = this.ensureGraph();
    if (!ctx || !this.fade) {
      this.emit("error", "Audio isn't available in this browser.");
      return false;
    }
    try {
      await this.unlock();
      const bytes = await blob.arrayBuffer();
      const buffer = await ctx.decodeAudioData(bytes.slice(0));
      this.haltSource();
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.connect(this.fade);
      this.fade.gain.cancelScheduledValues(ctx.currentTime);
      this.fade.gain.setValueAtTime(0.0001, ctx.currentTime);
      src.start();
      this.bufferSource = src;
      this.userPaused = false;
      this.playing = true;
      this.emit("playing");
      this.applyMediaSession();
      void this.fadeTo(1, fadeInMs);
      return true;
    } catch {
      this.emit(
        "error",
        "We couldn't play that audio file. Please try another audio format.",
      );
      return false;
    }
  }

  pause() {
    this.userPaused = true;
    this.playing = false;
    if (this.ctx?.state === "running") {
      void this.ctx.suspend();
    }
    this.keepAlive?.pause();
    this.emit("paused");
  }

  async resume() {
    try {
      await this.unlock();
      this.userPaused = false;
      this.playing = true;
      this.emit("playing");
    } catch {
      this.emit("error", "Tap to continue your sound.");
    }
  }

  async fadeOut(ms = 3500) {
    this.userPaused = true;
    await this.fadeTo(0, ms);
    this.haltSource();
    this.playing = false;
  }

  stop() {
    this.userPaused = true;
    this.playing = false;
    this.fadeToken += 1;
    if (this.fade && this.ctx) {
      this.fade.gain.cancelScheduledValues(this.ctx.currentTime);
      this.fade.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    this.haltSource();
    this.keepAlive?.pause();
  }

  async playBell() {
    const ctx = this.ensureGraph();
    if (!ctx) return;
    try {
      await this.unlock();
      playBell(ctx, this.volume);
    } catch {
      /* bell is optional if audio graph fails */
    }
  }

  private applyMediaSession() {
    if (typeof navigator === "undefined" || !navigator.mediaSession) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: "Meditation",
        artist: "Medipeace",
        album: "Peace Library",
      });
    } catch {
      /* unsupported */
    }
  }
}

export const audioEngine = new AudioEngine();
