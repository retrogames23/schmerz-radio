import { useEffect, useState } from "react";
import { useGame } from "@/game/GameContext";

// Jede Frame-Gruppe ist eine kurze, in sich geschlossene Texttafel.
// Sie wird vollständig eingeblendet, gehalten und gegen die nächste
// Tafel ausgetauscht. Das ist ruhiger als ein endlos wachsender Lauftext.
const FRAMES_BASE: string[][] = [
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
    "Er hat heute mit drei Menschen geredet, die er gestern nicht kannte.",
    "Mit zwei davon werden andere reden, sobald er das Zimmer verlässt.",
  ],
  [
    "Auf 104,6 — heute zum ersten Mal — kein Klopfen.",
    "Nur ein Rauschen. Vielleicht trägt es etwas. Vielleicht nicht.",
    "Layard nimmt die Datenkapsel in die Hand.",
    "Sie ist leichter, als sie heute Morgen war.",
  ],
];

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
  const [idx, setIdx] = useState(0);

  const frames = api.hasItem("flyer")
    ? [...FRAMES_BASE, ...FRAMES_FLYER_EXTRA]
    : FRAMES_BASE;

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
