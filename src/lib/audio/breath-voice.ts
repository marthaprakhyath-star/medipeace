import { audioEngine } from "@/lib/audio/engine";
import type { BreathVoiceGender } from "@/lib/types";

export type BreathCue = "in" | "out";
export type { BreathVoiceGender };

const CLIPS: Record<BreathVoiceGender, Record<BreathCue, string>> = {
  female: {
    in: "/voice/female-breathe-in.mp3",
    out: "/voice/female-breathe-out.mp3",
  },
  male: {
    in: "/voice/male-breathe-in.mp3",
    out: "/voice/male-breathe-out.mp3",
  },
};

class BreathVoice {
  private gender: BreathVoiceGender = "female";
  private raw = new Map<string, ArrayBuffer>();
  private buffers = new Map<string, AudioBuffer>();
  private source: AudioBufferSourceNode | null = null;
  private fetchAll: Promise<void> | null = null;
  private fetchKey: BreathVoiceGender | null = null;

  setGender(gender: BreathVoiceGender) {
    if (this.gender === gender) return;
    this.stop();
    this.gender = gender;
    this.buffers.clear();
    this.fetchAll = null;
    this.fetchKey = null;
  }

  currentGender() {
    return this.gender;
  }

  prefetch(gender: BreathVoiceGender = this.gender) {
    if (this.fetchAll && this.fetchKey === gender) return this.fetchAll;
    this.gender = gender;
    this.fetchKey = gender;
    const clips = CLIPS[gender];
    this.fetchAll = (async () => {
      try {
        await Promise.all(
          (Object.keys(clips) as BreathCue[]).map(async (id) => {
            const key = `${gender}:${id}`;
            if (this.raw.has(key)) return;
            const res = await fetch(clips[id]);
            if (!res.ok) return;
            this.raw.set(key, await res.arrayBuffer());
          }),
        );
      } catch {
        this.fetchAll = null;
        this.fetchKey = null;
      }
    })();
    return this.fetchAll;
  }

  async prepare(gender: BreathVoiceGender = this.gender) {
    try {
      this.setGender(gender);
      await this.prefetch(gender);
      await audioEngine.unlock();
      const ctx = audioEngine.context();
      if (!ctx) return;
      for (const id of Object.keys(CLIPS[gender]) as BreathCue[]) {
        const key = `${gender}:${id}`;
        if (this.buffers.has(key)) continue;
        const bytes = this.raw.get(key);
        if (!bytes) continue;
        const buffer = await ctx.decodeAudioData(bytes.slice(0));
        this.buffers.set(key, buffer);
      }
    } catch {
      /* visual labels still work if a clip fails */
    }
  }

  async speak(phase: BreathCue) {
    this.stop();
    await this.prepare(this.gender);
    const ctx = audioEngine.context();
    const out = audioEngine.voiceOutput();
    const buffer = this.buffers.get(`${this.gender}:${phase}`);
    if (!ctx || !out || !buffer) return;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(out);
    src.onended = () => {
      if (this.source === src) this.source = null;
    };
    this.source = src;
    try {
      src.start();
    } catch {
      this.source = null;
    }
  }

  stop() {
    try {
      this.source?.stop();
    } catch {
      /* already stopped */
    }
    this.source = null;
  }
}

export const breathVoice = new BreathVoice();
