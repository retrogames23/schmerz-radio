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

/**
 * Fahrgeräusch eines alten Linienbusses: tiefes Motorbrummen, Reifenrollen
 * (gefiltertes Rauschen) und ein langsames Lastwechsel-LFO. Gelegentlich ein
 * Bremszischen. Gibt eine stop()-Funktion zurück.
 */
export function startBusAmbience(volume = 0.5): () => void {
  const c = getCtx();
  if (!c) return () => {};
  const out = master(c, volume);

  // Motor: zwei leicht verstimmte tiefe Sägezähne durch Tiefpass.
  const o1 = c.createOscillator();
  o1.type = "sawtooth";
  o1.frequency.value = 62;
  const o2 = c.createOscillator();
  o2.type = "sawtooth";
  o2.frequency.value = 63.7;
  const o3 = c.createOscillator();
  o3.type = "sine";
  o3.frequency.value = 31;

  const engineLp = c.createBiquadFilter();
  engineLp.type = "lowpass";
  engineLp.frequency.value = 180;
  engineLp.Q.value = 2;
  const engineGain = c.createGain();
  engineGain.gain.value = 0;
  engineGain.gain.linearRampToValueAtTime(0.55, c.currentTime + 1.2);
  o1.connect(engineLp);
  o2.connect(engineLp);
  o3.connect(engineLp);
  engineLp.connect(engineGain).connect(out);

  // Lastwechsel: langsames Auf und Ab der Drehzahl.
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 9;
  lfo.connect(lfoGain);
  lfoGain.connect(o1.frequency);
  lfoGain.connect(o2.frequency);

  // Rollgeräusch: gefiltertes Rauschen in Schleife.
  const noiseLen = 4;
  const buf = c.createBuffer(1, c.sampleRate * noiseLen, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.2;
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const noiseBp = c.createBiquadFilter();
  noiseBp.type = "bandpass";
  noiseBp.frequency.value = 420;
  noiseBp.Q.value = 0.6;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0;
  noiseGain.gain.linearRampToValueAtTime(0.5, c.currentTime + 1.5);
  noise.connect(noiseBp).connect(noiseGain).connect(out);

  o1.start();
  o2.start();
  o3.start();
  lfo.start();
  noise.start();

  // Bremszischen in unregelmäßigen Abständen.
  let hissTimer: ReturnType<typeof setTimeout> | null = null;
  const scheduleHiss = () => {
    hissTimer = setTimeout(
      () => {
        const src = c.createBufferSource();
        src.buffer = buf;
        const bp = c.createBiquadFilter();
        bp.type = "highpass";
        bp.frequency.value = 1800;
        const g = c.createGain();
        const t = c.currentTime;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.28, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        src.connect(bp).connect(g).connect(out);
        src.start(t);
        src.stop(t + 1);
        scheduleHiss();
      },
      18000 + Math.random() * 26000,
    );
  };
  scheduleHiss();

  let stopped = false;
  return () => {
    if (stopped || !c) return;
    stopped = true;
    if (hissTimer) clearTimeout(hissTimer);
    const t = c.currentTime;
    for (const g of [engineGain, noiseGain]) {
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 0.5);
    }
    setTimeout(() => {
      try {
        o1.stop();
        o2.stop();
        o3.stop();
        lfo.stop();
        noise.stop();
      } catch {
        /* ignore */
      }
    }, 700);
  };
}
function noiseBuffer(c: AudioContext, seconds: number) {
  const b = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

function click(c: AudioContext, out: AudioNode, t: number, freq: number, vol: number, len = 0.04) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, len);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = 6;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + len);
  src.connect(bp).connect(g).connect(out);
  src.start(t);
}

/** Würfelklappern: Wurf + ausrollende, leiser werdende Aufschläge. */
export function playDiceRoll(volume = 0.5) {
  const c = getCtx();
  if (!c) return;
  const out = master(c, volume);
  let t = c.currentTime;
  for (let i = 0; i < 9; i++) {
    t += 0.03 + i * 0.012 + Math.random() * 0.02;
    click(c, out, t, 2200 + Math.random() * 1800, 0.9 * Math.pow(0.8, i));
  }
}

/** Metallischer Treffer im Kampf. */
export function playSwordClash(volume = 0.4) {
  const c = getCtx();
  if (!c) return;
  const out = master(c, volume);
  const t = c.currentTime;
  click(c, out, t, 3500, 0.8, 0.08);
  for (const f of [1870, 2630, 3410]) {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.55);
  }
}

/** Dumpfer Schlag für Schaden / Verfehlen. */
export function playThud(volume = 0.4) {
  const c = getCtx();
  if (!c) return;
  const out = master(c, volume);
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(50, t + 0.18);
  const g = c.createGain();
  g.gain.setValueAtTime(0.7, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.25);
}

/** Schimmernder Zauberklang (steigende Glocken); `fail` klingt fallend. */
export function playSpellChime(fail = false, volume = 0.3) {
  const c = getCtx();
  if (!c) return;
  const out = master(c, volume);
  const notes = fail ? [660, 520, 390] : [523, 784, 1046, 1318];
  notes.forEach((f, i) => {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = c.createGain();
    const t = c.currentTime + i * 0.07;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.65);
  });
}
