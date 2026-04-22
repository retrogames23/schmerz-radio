/**
 * WebAudio-based sound effects, generated procedurally so we don't ship
 * extra binary assets. All sounds respect the global SFX volume.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const W = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctor = W.AudioContext ?? W.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

function envGain(c: AudioContext, dest: AudioNode, vol: number, attack: number, release: number) {
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.linearRampToValueAtTime(0, t + attack + release);
  g.connect(dest);
  return { node: g, end: t + attack + release };
}

function master(c: AudioContext, vol: number) {
  const g = c.createGain();
  g.gain.value = vol;
  g.connect(c.destination);
  return g;
}

export function playDoorbell(volume = 0.7) {
  const c = getCtx();
  if (!c) return;
  const out = master(c, volume);
  const ring = (offset: number, freq: number) => {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    const g = c.createGain();
    const t = c.currentTime + offset;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.6, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 1);
  };
  ring(0, 880);
  ring(0.45, 660);
}

export function playBeep(volume = 0.4) {
  const c = getCtx();
  if (!c) return;
  const out = master(c, volume);
  const o = c.createOscillator();
  o.type = "square";
  o.frequency.value = 720;
  const env = envGain(c, out, 0.25, 0.005, 0.08);
  o.connect(env.node);
  o.start();
  o.stop(env.end + 0.02);
}

export function playKeypress(volume = 0.3) {
  const c = getCtx();
  if (!c) return;
  const out = master(c, volume);
  const o = c.createOscillator();
  o.type = "triangle";
  o.frequency.value = 1100 + Math.random() * 300;
  const env = envGain(c, out, 0.15, 0.002, 0.04);
  o.connect(env.node);
  o.start();
  o.stop(env.end + 0.02);
}

export function playUnlock(volume = 0.7) {
  const c = getCtx();
  if (!c) return;
  const out = master(c, volume);
  // Heavy clunk: low sine + short noise burst
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.value = 110;
  const env = envGain(c, out, 0.5, 0.01, 0.5);
  o.connect(env.node);
  o.start();
  o.stop(env.end + 0.05);

  const buf = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const ng = c.createGain();
  ng.gain.value = 0.25;
  noise.connect(ng).connect(out);
  noise.start();
}

export function playTuningClick(volume = 0.25) {
  const c = getCtx();
  if (!c) return;
  const out = master(c, volume);
  const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2000;
  src.connect(filter).connect(out);
  src.start();
}

/**
 * Looping menacing low-frequency drone. Returns a stop() function.
 */
export function startResonanceDrone(volume = 0.5): () => void {
  const c = getCtx();
  if (!c) return () => {};
  const out = master(c, volume);

  // Two detuned low oscillators
  const o1 = c.createOscillator();
  o1.type = "sawtooth";
  o1.frequency.value = 55;
  const o2 = c.createOscillator();
  o2.type = "sawtooth";
  o2.frequency.value = 56.3;
  const o3 = c.createOscillator();
  o3.type = "sine";
  o3.frequency.value = 27.5;

  // LFO for wobble
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.7;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 6;
  lfo.connect(lfoGain);
  lfoGain.connect(o1.frequency);
  lfoGain.connect(o2.frequency);

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 240;
  lp.Q.value = 4;

  const g = c.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0.9, c.currentTime + 0.6);

  o1.connect(lp);
  o2.connect(lp);
  o3.connect(lp);
  lp.connect(g).connect(out);

  o1.start();
  o2.start();
  o3.start();
  lfo.start();

  let stopped = false;
  return () => {
    if (stopped || !c) return;
    stopped = true;
    const t = c.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.linearRampToValueAtTime(0, t + 0.4);
    setTimeout(() => {
      try {
        o1.stop();
        o2.stop();
        o3.stop();
        lfo.stop();
      } catch {
        /* ignore */
      }
    }, 500);
  };
}

export function unlockAudio() {
  getCtx();
}