export type StopHandle = () => void;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fillNoise(
  ctx: BaseAudioContext,
  type: "white" | "pink" | "brown",
  seed: number,
  seconds = 2,
): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch += 1) {
    const rand = mulberry32(seed + ch * 9973);
    const data = buffer.getChannelData(ch);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0,
      last = 0;
    for (let i = 0; i < data.length; i += 1) {
      const white = rand() * 2 - 1;
      if (type === "white") {
        data[i] = white;
      } else if (type === "pink") {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] =
          (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
    }
  }
  return buffer;
}

function noiseSource(
  ctx: BaseAudioContext,
  type: "white" | "pink" | "brown",
  seed: number,
): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = fillNoise(ctx, type, seed);
  src.loop = true;
  return src;
}

type Stopper = { stop: () => void };

function addChirp(
  ctx: BaseAudioContext,
  dest: AudioNode,
  freq: number,
  dur = 0.16,
  gain = 0.07,
) {
  const start = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, start);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.45, start + dur * 0.45);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(80, freq * 0.72),
    start + dur,
  );
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.018);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function padTone(
  ctx: BaseAudioContext,
  dest: AudioNode,
  freq: number,
  gain: number,
  lfoHz = 0.07,
): Stopper[] {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = gain;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = lfoHz;
  const lfoG = ctx.createGain();
  lfoG.gain.value = gain * 0.28;
  lfo.connect(lfoG);
  lfoG.connect(g.gain);
  osc.connect(g);
  g.connect(dest);
  osc.start();
  lfo.start();
  return [
    { stop: () => osc.stop() },
    { stop: () => lfo.stop() },
  ];
}

function collect(nodes: Stopper[]): StopHandle {
  return () => {
    for (const n of nodes) {
      try {
        n.stop();
      } catch {
        /* already stopped */
      }
    }
  };
}

function renderOcean(ctx: BaseAudioContext, dest: AudioNode): StopHandle {
  const src = noiseSource(ctx, "pink", 11);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 420;
  bp.Q.value = 0.45;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  lp.Q.value = 0.6;
  const rumble = noiseSource(ctx, "brown", 19);
  const rumbleLp = ctx.createBiquadFilter();
  rumbleLp.type = "lowpass";
  rumbleLp.frequency.value = 180;
  const rumbleG = ctx.createGain();
  rumbleG.gain.value = 0.35;
  const gain = ctx.createGain();
  gain.gain.value = 0.32;
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.09;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 0.2;
  lfo.connect(lfoG);
  lfoG.connect(gain.gain);
  const lfo2 = ctx.createOscillator();
  lfo2.type = "sine";
  lfo2.frequency.value = 0.057;
  const lfo2G = ctx.createGain();
  lfo2G.gain.value = 220;
  lfo2.connect(lfo2G);
  lfo2G.connect(lp.frequency);
  src.connect(bp);
  bp.connect(lp);
  lp.connect(gain);
  rumble.connect(rumbleLp);
  rumbleLp.connect(rumbleG);
  rumbleG.connect(gain);
  gain.connect(dest);
  src.start();
  rumble.start();
  lfo.start();
  lfo2.start();
  return collect([
    { stop: () => src.stop() },
    { stop: () => rumble.stop() },
    { stop: () => lfo.stop() },
    { stop: () => lfo2.stop() },
  ]);
}

function renderRain(
  ctx: BaseAudioContext,
  dest: AudioNode,
  soft = false,
): StopHandle {
  const src = noiseSource(ctx, "white", soft ? 41 : 23);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = soft ? 2200 : 1400;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = soft ? 6500 : 7800;
  const gain = ctx.createGain();
  gain.gain.value = soft ? 0.12 : 0.18;
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.22;
  const lfoG = ctx.createGain();
  lfoG.gain.value = soft ? 0.03 : 0.045;
  lfo.connect(lfoG);
  lfoG.connect(gain.gain);
  src.connect(hp);
  hp.connect(lp);
  lp.connect(gain);
  gain.connect(dest);
  src.start();
  lfo.start();
  return collect([{ stop: () => src.stop() }, { stop: () => lfo.stop() }]);
}

function scheduleChirps(
  ctx: BaseAudioContext,
  dest: AudioNode,
  freqs: number[],
  gap: [number, number],
): StopHandle {
  let stopped = false;
  let timer: number | null = null;
  const tick = () => {
    if (stopped) return;
    const freq = freqs[Math.floor(Math.random() * freqs.length)] ?? 2800;
    addChirp(ctx, dest, freq, 0.14, 0.055);
    timer = window.setTimeout(
      tick,
      gap[0] + Math.random() * (gap[1] - gap[0]),
    );
  };
  tick();
  return () => {
    stopped = true;
    if (timer != null) window.clearTimeout(timer);
  };
}

function renderForest(ctx: BaseAudioContext, dest: AudioNode): StopHandle {
  const wind = noiseSource(ctx, "brown", 61);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 620;
  const gain = ctx.createGain();
  gain.gain.value = 0.22;
  wind.connect(lp);
  lp.connect(gain);
  gain.connect(dest);
  wind.start();
  const chirpBus = ctx.createGain();
  chirpBus.connect(dest);
  const chirps = scheduleChirps(
    ctx,
    chirpBus,
    [2400, 3100, 2700, 3600, 2200, 2900, 3300],
    [1800, 5200],
  );
  return collect([{ stop: () => wind.stop() }, { stop: chirps }]);
}

function renderRiver(ctx: BaseAudioContext, dest: AudioNode): StopHandle {
  const src = noiseSource(ctx, "pink", 73);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 700;
  bp.Q.value = 0.55;
  const gain = ctx.createGain();
  gain.gain.value = 0.22;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 280;
  lfo.connect(lfoG);
  lfoG.connect(bp.frequency);
  const gurgle = ctx.createOscillator();
  gurgle.frequency.value = 3.2;
  const gurgleG = ctx.createGain();
  gurgleG.gain.value = 0.04;
  gurgle.connect(gurgleG);
  gurgleG.connect(gain.gain);
  src.connect(bp);
  bp.connect(gain);
  gain.connect(dest);
  src.start();
  lfo.start();
  gurgle.start();
  return collect([
    { stop: () => src.stop() },
    { stop: () => lfo.stop() },
    { stop: () => gurgle.stop() },
  ]);
}

function renderBirds(ctx: BaseAudioContext, dest: AudioNode): StopHandle {
  const bed = noiseSource(ctx, "brown", 91);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 400;
  const g = ctx.createGain();
  g.gain.value = 0.08;
  bed.connect(lp);
  lp.connect(g);
  g.connect(dest);
  bed.start();
  const pads = padTone(ctx, dest, 196, 0.015, 0.05);
  const chirps = scheduleChirps(
    ctx,
    dest,
    [2800, 3400, 2200, 3000, 3800, 2500, 3200, 2700, 3600],
    [900, 2800],
  );
  return collect([...pads, { stop: () => bed.stop() }, { stop: chirps }]);
}

function renderDeepCalm(ctx: BaseAudioContext, dest: AudioNode): StopHandle {
  const pads = [
    ...padTone(ctx, dest, 110, 0.11, 0.05),
    ...padTone(ctx, dest, 164.8, 0.07, 0.07),
    ...padTone(ctx, dest, 220, 0.04, 0.04),
  ];
  const noise = noiseSource(ctx, "brown", 101);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 220;
  const g = ctx.createGain();
  g.gain.value = 0.08;
  noise.connect(lp);
  lp.connect(g);
  g.connect(dest);
  noise.start();
  return collect([...pads, { stop: () => noise.stop() }]);
}

function renderInnerPeace(ctx: BaseAudioContext, dest: AudioNode): StopHandle {
  const pads = [256, 384, 512, 640, 768].flatMap((f, i) =>
    padTone(ctx, dest, f, 0.045 - i * 0.006, 0.04 + i * 0.01),
  );
  return collect(pads);
}

function renderQuietSpace(ctx: BaseAudioContext, dest: AudioNode): StopHandle {
  const noise = noiseSource(ctx, "brown", 121);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 180;
  const g = ctx.createGain();
  g.gain.value = 0.05;
  noise.connect(lp);
  lp.connect(g);
  g.connect(dest);
  noise.start();
  return collect([
    { stop: () => noise.stop() },
    ...padTone(ctx, dest, 528, 0.012, 0.03),
    ...padTone(ctx, dest, 396, 0.01, 0.045),
  ]);
}

function renderHealing(ctx: BaseAudioContext, dest: AudioNode): StopHandle {
  return collect(
    [130.8, 164.8, 196, 246.9].flatMap((f, i) =>
      padTone(ctx, dest, f, 0.06 - i * 0.008, 0.035 + i * 0.012),
    ),
  );
}

function renderDrone(ctx: BaseAudioContext, dest: AudioNode): StopHandle {
  return collect([
    ...padTone(ctx, dest, 55, 0.16, 0.03),
    ...padTone(ctx, dest, 110, 0.09, 0.045),
    ...padTone(ctx, dest, 165, 0.05, 0.06),
    ...padTone(ctx, dest, 220, 0.03, 0.04),
  ]);
}

function renderDeepSleep(ctx: BaseAudioContext, dest: AudioNode): StopHandle {
  const noise = noiseSource(ctx, "brown", 141);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 90;
  const g = ctx.createGain();
  g.gain.value = 0.1;
  noise.connect(lp);
  lp.connect(g);
  g.connect(dest);
  noise.start();
  return collect([
    ...padTone(ctx, dest, 48, 0.18, 0.025),
    ...padTone(ctx, dest, 72, 0.1, 0.033),
    { stop: () => noise.stop() },
  ]);
}

function renderNightCalm(ctx: BaseAudioContext, dest: AudioNode): StopHandle {
  const noise = noiseSource(ctx, "brown", 151);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 300;
  const g = ctx.createGain();
  g.gain.value = 0.07;
  noise.connect(lp);
  lp.connect(g);
  g.connect(dest);
  noise.start();
  const cricket = noiseSource(ctx, "white", 157);
  const hp = ctx.createBiquadFilter();
  hp.type = "bandpass";
  hp.frequency.value = 4200;
  hp.Q.value = 8;
  const cg = ctx.createGain();
  cg.gain.value = 0.012;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 18;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 0.01;
  lfo.connect(lfoG);
  lfoG.connect(cg.gain);
  cricket.connect(hp);
  hp.connect(cg);
  cg.connect(dest);
  cricket.start();
  lfo.start();
  return collect([
    ...padTone(ctx, dest, 98, 0.07, 0.04),
    ...padTone(ctx, dest, 147, 0.04, 0.055),
    { stop: () => noise.stop() },
    { stop: () => cricket.stop() },
    { stop: () => lfo.stop() },
  ]);
}

export function connectCatalogSound(
  ctx: AudioContext,
  dest: AudioNode,
  id: string,
): StopHandle {
  switch (id) {
    case "ocean-calm":
      return renderOcean(ctx, dest);
    case "gentle-rain":
      return renderRain(ctx, dest, false);
    case "soft-rain":
      return renderRain(ctx, dest, true);
    case "forest":
      return renderForest(ctx, dest);
    case "river":
      return renderRiver(ctx, dest);
    case "birds":
      return renderBirds(ctx, dest);
    case "deep-calm":
      return renderDeepCalm(ctx, dest);
    case "inner-peace":
      return renderInnerPeace(ctx, dest);
    case "quiet-space":
      return renderQuietSpace(ctx, dest);
    case "healing-ambient":
      return renderHealing(ctx, dest);
    case "meditation-drone":
      return renderDrone(ctx, dest);
    case "deep-sleep":
      return renderDeepSleep(ctx, dest);
    case "night-calm":
      return renderNightCalm(ctx, dest);
    default:
      return renderOcean(ctx, dest);
  }
}

export function playBell(ctx: AudioContext, volume: number) {
  const freqs = [220, 330, 440, 554, 660, 880];
  const gains = [0.28, 0.16, 0.12, 0.08, 0.05, 0.03];
  const now = ctx.currentTime;
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime((gains[i] ?? 0.04) * volume, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 5.2);
    const beat = ctx.createOscillator();
    beat.type = "sine";
    beat.frequency.value = freq * 1.003;
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0.0001, now);
    bg.gain.exponentialRampToValueAtTime(
      (gains[i] ?? 0.04) * 0.4 * volume,
      now + 0.03,
    );
    bg.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
    beat.connect(bg);
    bg.connect(ctx.destination);
    beat.start(now);
    beat.stop(now + 5.2);
  });
}
