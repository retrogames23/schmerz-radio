import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import endingTrack from "@/assets/music/rain-against-the-pane.mp3";

/** Spelt-out German numbers for small counts in the closing text. */
const NUM_WORDS = [
  "null",
  "einem",
  "zwei",
  "drei",
  "vier",
  "fünf",
  "sechs",
  "sieben",
  "acht",
  "neun",
  "zehn",
] as const;

function spell(n: number): string {
  return NUM_WORDS[n] ?? String(n);
}

// Jede Frame-Gruppe ist eine kurze, in sich geschlossene Texttafel.
// Sie wird vollständig eingeblendet, gehalten und gegen die nächste
// Tafel ausgetauscht. Das ist ruhiger als ein endlos wachsender Lauftext.
function buildBaseFrames(npcCount: number): string[][] {
  // Singular-Form, falls Layard heute nur mit einer Person geredet hat
  // (sehr unwahrscheinlich, aber sauber gehandhabt).
  const peopleLine =
    npcCount === 1
      ? "Er hat heute mit einem Menschen geredet, den er gestern nicht kannte."
      : `Er hat heute mit ${spell(npcCount)} Menschen geredet, die er gestern nicht kannte.`;
  return [
    [
      "Layard legt den Hörer zurück.",
      "Auf dem Tisch: die Datenkapsel. Unverändert. Unzustellbar.",
      "Daneben: das Telefon. Schwarzer Bakelit. Warm vom Hörer.",
    ],
    [
      "In seinem Kopf, langsam: Insas Stimme.",
      "„Bringen Sie es mir vorbei. Persönlich.“",
      "Und davor, leiser: „Das überrascht mich nicht.“",
    ],
    [
      "Layard tritt ans Fenster. Innenhof. Solaranlage. 48 Stunden Notstrom.",
      peopleLine,
      "Über manche von ihnen werden andere reden, sobald er das Zimmer verlässt.",
    ],
    [
      "Auf 104,6 — heute zum ersten Mal — kein Klopfen.",
      "Nur ein Rauschen. Vielleicht trägt es etwas. Vielleicht nicht.",
      "Layard nimmt die Datenkapsel in die Hand.",
      "Sie ist leichter, als sie heute Morgen war.",
    ],
  ];
}

const FRAMES_FLYER_EXTRA: string[][] = [
  [
    "Neben der Kapsel liegt ein gefaltetes Blatt.",
    "Ein Mädchen auf einer Etage, deren Nummer er sich nicht gemerkt hat.",
    "„Wer hält das andere Ende?“ — Z.K.S.",
  ],
  [
    "Er zerreißt das Blatt nicht. Er faltet es kleiner.",
    "Es passt jetzt unter die Kapsel.",
  ],
];

export function Ending() {
  const { ending, api } = useGame();
  const { musicVolume } = useSettings();
  const [idx, setIdx] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Zähle, mit wie vielen verschiedenen Personen Layard tatsächlich
  // gesprochen hat. Reine Sicht-/Schild-Begegnungen zählen nicht — es
  // muss ein echtes Gespräch zustande gekommen sein. Insa und der
  // Sanitäter sind im Pflichtpfad enthalten.
  const npcFlags = [
    "metPhilippe", // Philippe (Tür / Wohnung)
    "calledLeitstelle", // Insa (1. Anruf, Pflicht)
    "paramedicsArrived", // Sanitäter
    "metReceptionist", // Empfang E71
    "metMikael", // Mikael
    "metBodo", // Bodo Marschke
    "metHelka", // Helka Vint
    "metEnnis", // Ennis Korr
    "metMira", // Mira
    "calledStegmann", // Stegmann (Zentrales Netz)
  ] as const;
  const npcCount = npcFlags.reduce(
    (acc, f) => acc + (api.hasFlag(f) ? 1 : 0),
    0,
  );

  const FRAMES_BASE = buildBaseFrames(npcCount);

  const frames: string[][] = api.hasItem("flyer")
    ? [...FRAMES_BASE, ...FRAMES_FLYER_EXTRA]
    : FRAMES_BASE;

  // Abspann-Musik: läuft NUR während des Endings, on top der bestehenden
  // Spielmusik (die wir bewusst nicht anfassen). Eigenes Audio-Element,
  // damit der MusicPlayer nicht unterbrochen wird.
  useEffect(() => {
    if (!ending) return;
    const a = new Audio(endingTrack);
    a.loop = true;
    a.volume = 0;
    audioRef.current = a;
    void a.play().catch(() => {
      /* autoplay may be blocked — silent fallback */
    });
    // Sanftes Einblenden über ~3 Sekunden.
    const target = Math.max(0, Math.min(1, musicVolume));
    const steps = 60;
    let step = 0;
    const t = window.setInterval(() => {
      step += 1;
      const p = Math.min(1, step / steps);
      a.volume = Math.max(0, Math.min(1, target * p));
      if (p >= 1) window.clearInterval(t);
    }, 50);
    return () => {
      window.clearInterval(t);
      a.pause();
      a.src = "";
      audioRef.current = null;
    };
    // musicVolume bewusst nicht in deps: wir setzen das Ziel beim Start,
    // spätere Lautstärke-Änderungen sollen den Fade nicht resetten.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ending]);

  // Lautstärke-Änderungen während das Ending läuft live übernehmen.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = Math.max(0, Math.min(1, musicVolume));
  }, [musicVolume]);

  useEffect(() => {
    if (!ending) return;
    if (idx >= frames.length) return;
    // Längere Tafeln länger halten, damit der Leser nachkommt.
    const lines = frames[idx]?.length ?? 0;
    const hold = 2400 + lines * 1100;
    const t = setTimeout(() => setIdx((i) => i + 1), hold);
    return () => clearTimeout(t);
  }, [ending, frames, idx]);

  if (!ending) return null;

  const done = idx >= frames.length;
  const current = !done ? frames[idx] : null;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black px-6 text-center">
      {current && (
        <div key={idx} className="slow-fade-in mx-auto max-w-2xl space-y-4">
          {current.map((line, i) => (
            <p
              key={i}
              className="font-display text-lg text-foreground sm:text-xl"
            >
              {line}
            </p>
          ))}
        </div>
      )}

      {done && (
        <div className="slow-fade-in mt-12 space-y-3 text-center">
          <div className="font-mono-crt text-sm uppercase tracking-[0.4em] text-amber-glow amber-glow">
            AKT II — ENDE
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Schmerz-Radio auf 104,6 — Fortsetzung folgt
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-sm border border-amber-glow/50 px-4 py-2 text-xs uppercase tracking-widest text-amber-glow hover:bg-amber-glow/10"
          >
            ▸ Neu beginnen
          </button>
        </div>
      )}
    </div>
  );
}
