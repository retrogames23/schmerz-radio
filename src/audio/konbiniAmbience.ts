/**
 * Klangkulisse des Konbini: Kühlschrank-Surren, Netzbrummen der Röhren und
 * in unregelmäßigen Abständen Gong + japanische Automatenansage. Die
 * Ansagen stammen von den 1979 importierten Kassen- und Kühlmodulen.
 */

const VOICES = [1, 2, 3, 4, 5].map((n) => `/audio/konbini-voice-${n}.mp3`);
const VOICES_E71 = [1, 2, 3, 4].map((n) => `/audio/konbini-e71-voice-${n}.mp3`);

export function startKonbiniAmbience(
  volume = 0.5,
  opts: { quiet?: boolean } = {},
): () => void {
  const voices = opts.quiet ? VOICES_E71 : VOICES;
  if (typeof window === "undefined") return () => {};
  const W = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor = W.AudioContext ?? W.webkitAudioContext;
  if (!Ctor) return () => {};
  const c = new Ctor();
  if (c.state === "suspended") void c.resume();

  const out = c.createGain();
  out.gain.value = 0;
  out.gain.linearRampToValueAtTime(volume, c.currentTime + 1.2);
  out.connect(c.destination);

  // Netzbrummen (50 Hz + Oberton) – leise.
  const hum = c.createOscillator();
  hum.type = "sine";
  hum.frequency.value = 50;
  const hum2 = c.createOscillator();
  hum2.type = "sine";
  hum2.frequency.value = 100;
  const humGain = c.createGain();
  humGain.gain.value = opts.quiet ? 0.05 : 0.08;
  hum.connect(humGain);
  hum2.connect(humGain);
  humGain.connect(out);

  // Kompressor des Kühlschranks: gefiltertes Rauschen mit langsamem Wabern.
  const buf = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    last = (last + 0.03 * (Math.random() * 2 - 1)) / 1.03;
    d[i] = last * 3;
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 160;
  bp.Q.value = 1.2;
  const fridge = c.createGain();
  fridge.gain.value = opts.quiet ? 0.22 : 0.35;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.15;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 0.12;
  lfo.connect(lfoGain).connect(fridge.gain);
  noise.connect(bp).connect(fridge).connect(out);

  hum.start();
  hum2.start();
  noise.start();
  lfo.start();

  const chime = () => {
    const t = c.currentTime;
    [988, 784].forEach((f, i) => {
      const o = c.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      const g = c.createGain();
      g.gain.setValueAtTime(0, t + i * 0.35);
      g.gain.linearRampToValueAtTime(opts.quiet ? 0.14 : 0.25, t + i * 0.35 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.35 + 0.8);
      o.connect(g).connect(out);
      o.start(t + i * 0.35);
      o.stop(t + i * 0.35 + 0.9);
    });
  };

  let stopped = false;
  let audio: HTMLAudioElement | null = null;
  const announce = (src: string) => {
    if (stopped) return;
    chime();
    setTimeout(() => {
      if (stopped) return;
      audio = new Audio(src);
      audio.volume = opts.quiet
        ? Math.min(1, volume * 0.9 + 0.1)
        : Math.min(1, volume * 1.6 + 0.2);
      void audio.play().catch(() => {});
    }, 800);
  };

  let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => announce(voices[0]), 900);
  const schedule = () => {
    timer = setTimeout(() => {
      announce(voices[1 + Math.floor(Math.random() * (voices.length - 1))]);
      schedule();
    }, (opts.quiet ? 30000 : 22000) + Math.random() * 25000);
  };
  schedule();

  return () => {
    if (stopped) return;
    stopped = true;
    if (timer) clearTimeout(timer);
    audio?.pause();
    const t = c.currentTime;
    out.gain.cancelScheduledValues(t);
    out.gain.setValueAtTime(out.gain.value, t);
    out.gain.linearRampToValueAtTime(0, t + 0.4);
    setTimeout(() => void c.close().catch(() => {}), 500);
  };
}
