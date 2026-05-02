import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import { useMusic } from "@/audio/MusicPlayer";
import endingTrack from "@/assets/music/rain-against-the-pane.mp3";
import { SECTOR_CHATTER, chatterTimestamp } from "@/game/sectorChatter";
import {
  buildEndingBaseFrames,
  ENDING_FLYER_FRAMES,
  ENDING_UI_TEXT,
  ACT2_BRIDGE_UI_TEXT,
} from "@/game/cutscenes";
import { DonationModal } from "@/components/donation/DonationModal";

export function Ending() {
  const { ending, api } = useGame();
  const { musicVolume } = useSettings();
  const { pause: pauseMusic, resume: resumeMusic } = useMusic();
  const [idx, setIdx] = useState(0);
  const [donationOpen, setDonationOpen] = useState(false);
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

  const FRAMES_BASE = buildEndingBaseFrames(npcCount);

  const frames: string[][] = api.hasItem("flyer")
    ? [...FRAMES_BASE, ...ENDING_FLYER_FRAMES]
    : FRAMES_BASE;

  // Abspann-Musik: läuft NUR während des Endings. Die normale Spielmusik
  // wird komplett pausiert (nicht nur stumm geschaltet), damit auf keinen
  // Fall zwei Tracks gleichzeitig laufen. Beim Verlassen des Endings
  // wird die reguläre Wiedergabe wieder fortgesetzt.
  useEffect(() => {
    if (!ending) return;
    pauseMusic();
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
      resumeMusic();
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
    const hold = 3800 + lines * 1700;
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
        <>
          <ChatterAtmosphere burned={api.hasFlag("burnedNode5610")} />
          <div className="slow-fade-in relative z-10 mt-12 space-y-3 text-center">
            <div className="font-mono-crt text-sm uppercase tracking-[0.4em] text-amber-glow amber-glow">
              {ENDING_UI_TEXT.actLabel}
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {ENDING_UI_TEXT.subtitle}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-sm border border-amber-glow/50 px-4 py-2 text-xs uppercase tracking-widest text-amber-glow hover:bg-amber-glow/10"
            >
              {ENDING_UI_TEXT.restart}
            </button>
            <div>
              <button
                type="button"
                onClick={() => {
                  // Akt II startet: Ending-Screen schließen, Bridge-Cutscene
                  // starten. Die Cutscene setzt die Akt-II-Flags und springt
                  // Layard am Ende zurück in seine Wohnung.
                  if (!api.hasFlag("act2Started")) api.setFlag("act2Started");
                  api.clearEnding();
                  api.startCutscene("act2Bridge");
                }}
                className="mt-3 rounded-sm border border-amber-glow px-5 py-2 text-xs uppercase tracking-widest text-amber-glow hover:bg-amber-glow/15 amber-glow"
              >
                {ACT2_BRIDGE_UI_TEXT.continueButton}
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setDonationOpen(true)}
                className="mt-4 inline-block font-mono-crt text-xs uppercase tracking-[0.3em] text-amber-glow/80 underline-offset-4 hover:underline amber-glow"
              >
                {ENDING_UI_TEXT.coffee}
              </button>
            </div>
          </div>
        </>
      )}
      <DonationModal
        open={donationOpen}
        onClose={() => setDonationOpen(false)}
        variant="manual"
      />
    </div>
  );
}

/**
 * Atmosphärische "listen"-Schleife für den Abspann.
 *
 * Zeigt zufällige Sektor-Chatter-Nachrichten in zufälligen Bildschirm-
 * positionen (oben / seitlich / unten), die langsam ein- und ausgefadet
 * werden. Ohne Ton — rein visuell. Es können bis zu drei Nachrichten
 * gleichzeitig stehen, damit der Bildschirm nicht leer wirkt.
 */
interface FloatingMsg {
  id: number;
  top: number; // %
  left: number; // %
  align: "left" | "right" | "center";
  header: string;
  body: string;
}

function ChatterAtmosphere({ burned }: { burned: boolean }) {
  const [msgs, setMsgs] = useState<FloatingMsg[]>([]);

  useEffect(() => {
    let nextId = 1;
    const order = [...SECTOR_CHATTER].sort(() => Math.random() - 0.5);
    let i = 0;
    const FADE_LIFE = 9000; // wie lange eine Nachricht sichtbar bleibt
    // Nach burn ist 104,6 in E67 still — der Chatter-Strom dünnt aus.
    // Spawn-Takt halbiert und ~30 % der Nachrichten erscheinen zerhackt.
    const SPAWN_EVERY = burned ? 4400 : 2200;

    const spawn = () => {
      const m = order[i % order.length];
      i += 1;
      // Vermeide den mittleren Block (40–65% vertikal), da steht der Button.
      const topBands = [8, 16, 24, 72, 80, 88];
      const top = topBands[Math.floor(Math.random() * topBands.length)];
      const align: "left" | "right" | "center" =
        Math.random() < 0.5 ? "left" : Math.random() < 0.7 ? "right" : "center";
      const left =
        align === "left"
          ? 4 + Math.random() * 10
          : align === "right"
            ? 60 + Math.random() * 8
            : 25 + Math.random() * 15;
      const id = nextId++;
      const garbled = burned && Math.random() < 0.3;
      const header = `[${chatterTimestamp()}]  ${m.from}  →  ${m.to}`;
      const body = garbled ? ENDING_UI_TEXT.garbledChatter : `» ${m.text} «`;
      setMsgs((prev) => [...prev, { id, top, left, align, header, body }]);
      window.setTimeout(() => {
        setMsgs((prev) => prev.filter((x) => x.id !== id));
      }, FADE_LIFE);
    };

    // Erstes Paket sofort, danach gleichmäßig.
    spawn();
    const t = window.setInterval(spawn, SPAWN_EVERY);
    return () => window.clearInterval(t);
  }, [burned]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {msgs.map((m) => (
        <div
          key={m.id}
          className="chatter-fade absolute max-w-xs font-mono-crt text-[10px] leading-relaxed text-amber-glow/60 sm:text-xs"
          style={{
            top: `${m.top}%`,
            left: `${m.left}%`,
            textAlign: m.align,
          }}
        >
          <div className="opacity-70">{m.header}</div>
          <div>{m.body}</div>
        </div>
      ))}
    </div>
  );
}
