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

  // Dudelige Automaten-Melodien (Ladentür-/Kassenjingles der 1979er Geräte).
  const N = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
  const JINGLES: [number, number][][] = [
    // Türmelodie (FamilyMart-artig)
    [[78, 0.2], [74, 0.2], [69, 0.2], [74, 0.2], [76, 0.2], [81, 0.4], [0, 0.1], [76, 0.2], [78, 0.2], [76, 0.2], [69, 0.2], [74, 0.6]],
    // Westminster-Kassengong in Dur, beschwingt
    [[72, 0.18], [76, 0.18], [79, 0.18], [84, 0.36], [79, 0.18], [84, 0.54]],
    // Kühlregal-Erinnerung
    [[84, 0.12], [83, 0.12], [81, 0.12], [79, 0.12], [77, 0.24], [79, 0.24], [72, 0.48], [0, 0.12], [76, 0.12], [77, 0.12], [79, 0.48]],
    // Werbe-Dudelei
    [[67, 0.15], [72, 0.15], [76, 0.15], [72, 0.15], [74, 0.15], [77, 0.15], [81, 0.3], [79, 0.15], [77, 0.15], [76, 0.15], [74, 0.15], [72, 0.45]],
  ];
  const playJingle = (notes: [number, number][]): number => {
    let t = c.currentTime + 0.05;
    const peak = opts.quiet ? 0.07 : 0.12;
    for (const [m, dur] of notes) {
      if (m > 0) {
        [1, 2].forEach((mult, k) => {
          const o = c.createOscillator();
          o.type = k === 0 ? "square" : "triangle";
          o.frequency.value = N(m) * mult;
          const g = c.createGain();
          const p = k === 0 ? peak : peak * 0.5;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(p, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.95);
          o.connect(g).connect(out);
          o.start(t);
          o.stop(t + dur);
        });
      }
      t += dur;
    }
    return (t - c.currentTime) * 1000;
  };

  let stopped = false;
  let audio: HTMLAudioElement | null = null;
  const speak = (src: string) => {
    if (stopped) return;
    audio = new Audio(src);
    audio.volume = opts.quiet
      ? Math.min(1, volume * 0.9 + 0.1)
      : Math.min(1, volume * 1.6 + 0.2);
    void audio.play().catch(() => {});
  };
  const announce = (src: string) => {
    if (stopped) return;
    chime();
    setTimeout(() => speak(src), 800);
  };
  const randomVoice = () => voices[1 + Math.floor(Math.random() * (voices.length - 1))];

  let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => announce(voices[0]), 900);
  const schedule = () => {
    timer = setTimeout(() => {
      announce(randomVoice());
      schedule();
    }, (opts.quiet ? 30000 : 22000) + Math.random() * 25000);
  };
  schedule();

  let jingleTimer: ReturnType<typeof setTimeout> | null = null;
  const scheduleJingle = (first = false) => {
    jingleTimer = setTimeout(
      () => {
        if (stopped) return;
        const ms = playJingle(JINGLES[Math.floor(Math.random() * JINGLES.length)]);
        setTimeout(() => speak(randomVoice()), ms + 400);
        scheduleJingle();
      },
      first ? 12000 : (opts.quiet ? 55000 : 40000) + Math.random() * 30000,
    );
  };
  scheduleJingle(true);

  return () => {
    if (stopped) return;
    stopped = true;
    if (timer) clearTimeout(timer);
    if (jingleTimer) clearTimeout(jingleTimer);
    audio?.pause();
    const t = c.currentTime;
    out.gain.cancelScheduledValues(t);
    out.gain.setValueAtTime(out.gain.value, t);
    out.gain.linearRampToValueAtTime(0, t + 0.4);
    setTimeout(() => void c.close().catch(() => {}), 500);
  };
}
