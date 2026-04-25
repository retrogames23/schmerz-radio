import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import { useMusic } from "@/audio/MusicPlayer";
import { speak, stopSpeech } from "@/audio/speech";
import beat1 from "@/assets/cutscene-paramedics-1.jpg";
import beat2 from "@/assets/cutscene-paramedics-2.jpg";
import beat3 from "@/assets/cutscene-paramedics-3.jpg";
import beat4 from "@/assets/cutscene-paramedics-4.jpg";
import beat5 from "@/assets/cutscene-paramedics-5.jpg";
import beat6 from "@/assets/cutscene-paramedics-6.jpg";
import cutsceneMusic from "@/assets/cutscene-paramedics-music.mp3";

type Speaker = "SANITÄTER" | "LAYARD" | "SYSTEM";

interface Line {
  speaker: Speaker;
  /** Anzeige-/Untertiteltext. */
  text: string;
  /** Optional eigener TTS-Text (falls Untertitel verkürzt). */
  speech?: string;
  /** Wie lange diese Zeile auf dem Bildschirm bleibt (ms). */
  hold: number;
}

interface Beat {
  image: string;
  /** Ken-Burns: Skalierungs-Range und Translation. */
  zoom: [number, number];
  pan: [number, number, number, number]; // [x0, y0, x1, y1] in %
  /** Optional einleitende Stille bevor die erste Zeile gesprochen wird. */
  leadIn?: number;
  /** Optional Pause am Ende vor dem Crossfade. */
  tail?: number;
  lines: Line[];
}

/**
 * Hold-Zeit-Heuristik: ~70 ms pro Zeichen, mind. 2.4s, max 7s.
 * Wir kennen die echte Audiolänge nicht (speak() ist fire-and-forget),
 * also wird die Zeile so lange gehalten, dass die TTS-Wiedergabe in
 * aller Regel passt — leicht großzügig, damit Untertitel nicht
 * vorbeihuschen.
 */
function holdFor(text: string, factor = 70): number {
  return Math.max(2400, Math.min(7000, Math.round(text.length * factor + 800)));
}

function buildBeats(): Beat[] {
  return [
    {
      // 1) Sanitäter & Techniker vor 2615.
      image: beat1,
      zoom: [1.04, 1.12],
      pan: [0, 0, -2, -1],
      leadIn: 400,
      lines: [
        {
          speaker: "SANITÄTER",
          text: "Gehen Sie zurück. Wir brechen die Tür auf.",
          hold: holdFor("Gehen Sie zurück. Wir brechen die Tür auf."),
        },
      ],
      tail: 200,
    },
    {
      // 2) Layard im Türrahmen. Zaghafte Frage. Keine Antwort.
      image: beat2,
      zoom: [1.06, 1.14],
      pan: [1, 0, -1, -2],
      lines: [
        {
          speaker: "LAYARD",
          text: "Sie brauchen mich nicht mehr?",
          hold: holdFor("Sie brauchen mich nicht mehr?"),
        },
        {
          speaker: "SYSTEM",
          text: "Sie antworten nicht. Hochkonzentriert. Routine.",
          hold: holdFor("Sie antworten nicht. Hochkonzentriert. Routine."),
        },
      ],
      tail: 200,
    },
    {
      // 3) Tür birst auf. Action-Beat — kurz halten.
      image: beat3,
      zoom: [1.0, 1.18],
      pan: [0, 0, 0, 0],
      lines: [
        {
          speaker: "SYSTEM",
          text: "Beim dritten Schlag knackt das Schloss. Die Tür schwingt auf.",
          hold: holdFor("Beim dritten Schlag knackt das Schloss. Die Tür schwingt auf."),
        },
      ],
      tail: 300,
    },
    {
      // 4) Innen: ausgemergelter Mann klopft gegen Wand.
      image: beat4,
      zoom: [1.02, 1.10],
      pan: [-2, 0, 2, -1],
      leadIn: 300,
      lines: [
        {
          speaker: "SYSTEM",
          text: "Ein ausgemergelter Mann. Fahle Haut. Schlägt rhythmisch gegen die Wand.",
          hold: holdFor(
            "Ein ausgemergelter Mann. Fahle Haut. Schlägt rhythmisch gegen die Wand.",
          ),
        },
        {
          speaker: "SYSTEM",
          text: "Layard nimmt seinen Mut zusammen und schaut ihm in die Augen.",
          hold: holdFor("Layard nimmt seinen Mut zusammen und schaut ihm in die Augen."),
        },
      ],
      tail: 200,
    },
    {
      // 5) Close-up der grünen Augen.
      image: beat5,
      zoom: [1.10, 1.22],
      pan: [0, 1, 0, -1],
      lines: [
        {
          speaker: "SYSTEM",
          text: "Er erwartet tote, glasige Augen. Er findet eine seltsame Klarheit.",
          hold: holdFor(
            "Er erwartet tote, glasige Augen. Er findet eine seltsame Klarheit.",
          ),
        },
        {
          speaker: "SYSTEM",
          text: "Wie ein Portal in ein mystisches Universum. Layard wird das Bild nicht mehr los.",
          hold: holdFor(
            "Wie ein Portal in ein mystisches Universum. Layard wird das Bild nicht mehr los.",
          ),
        },
      ],
      tail: 400,
    },
    {
      // 6) Bergung & Protokoll-Übergabe.
      image: beat6,
      zoom: [1.04, 1.10],
      pan: [-1, -1, 1, 1],
      lines: [
        {
          speaker: "SANITÄTER",
          text: "Kein A-, B- oder C-Problem. Transport mit Trage.",
          hold: holdFor("Kein A-, B- oder C-Problem. Transport mit Trage."),
        },
        {
          speaker: "LAYARD",
          text: "Brauchen Sie mich noch?",
          hold: holdFor("Brauchen Sie mich noch?"),
        },
        {
          speaker: "SANITÄTER",
          text: "Ja. Ich drucke Ihnen das Protokoll. Verschlüsselt — für E67.",
          hold: holdFor("Ja. Ich drucke Ihnen das Protokoll. Verschlüsselt — für E67."),
        },
        {
          speaker: "SANITÄTER",
          text: "Wir schicken es per Rohrpost. Aber bitte werfen Sie es heute noch ein.",
          hold: holdFor(
            "Wir schicken es per Rohrpost. Aber bitte werfen Sie es heute noch ein.",
          ),
        },
        {
          speaker: "LAYARD",
          text: "In Ordnung.",
          hold: holdFor("In Ordnung.") + 300,
        },
        {
          speaker: "SYSTEM",
          text: "Warum hat er ja gesagt? Er hätte nein sagen können.",
          hold: holdFor("Warum hat er ja gesagt? Er hätte nein sagen können.") + 400,
        },
      ],
      tail: 600,
    },
  ];
}

const CROSSFADE_MS = 600;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function ParamedicsCutscene() {
  const { cutscene, endCutscene, api } = useGame();
  const { sfxVolume, musicVolume, musicEnabled } = useSettings();
  const music = useMusic();
  const beats = useMemo(buildBeats, []);
  const [beatIdx, setBeatIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(-1); // -1 = leadIn
  const [visible, setVisible] = useState(true);
  const startedRef = useRef(false);
  const cancelledRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[] | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicFadeTimerRef = useRef<number | null>(null);

  const active = cutscene === "paramedics";

  // Lautstärke der Cutscene-Musik live an Settings koppeln, solange sie spielt.
  // Wir liegen bewusst ein Stück unter musicVolume, damit Dialog/TTS klar oben
  // sitzt — die Musik ist nur Untermalung.
  useEffect(() => {
    if (!musicAudioRef.current) return;
    const target = musicEnabled ? clamp01(musicVolume * 0.55) : 0;
    if (musicFadeTimerRef.current == null) {
      musicAudioRef.current.volume = target;
    }
  }, [musicVolume, musicEnabled]);

  // Reset wenn die Cutscene endet.
  useEffect(() => {
    if (!active) {
      cancelledRef.current = true;
      stopSpeech();
      if (timersRef.current) {
        for (const t of timersRef.current) clearTimeout(t);
        timersRef.current = null;
      }
      stopCutsceneMusic();
      music.resume();
      startedRef.current = false;
      setBeatIdx(0);
      setLineIdx(-1);
      setVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Hauptablauf: einmal beim Start die komplette Zeitleiste planen.
  useEffect(() => {
    if (!active) return;
    if (startedRef.current) return;
    startedRef.current = true;
    cancelledRef.current = false;

    // Hintergrundmusik komplett anhalten und eigene Cutscene-Musik starten.
    music.pause();
    startCutsceneMusic();

    const timers: ReturnType<typeof setTimeout>[] = [];
    timersRef.current = timers;
    let cursor = 0;

    beats.forEach((beat, bi) => {
      // Bildwechsel + leadIn
      const isFirst = bi === 0;
      if (!isFirst) {
        // Crossfade zum nächsten Bild
        timers.push(
          setTimeout(() => {
            if (cancelledRef.current) return;
            setVisible(false);
          }, cursor),
        );
        cursor += CROSSFADE_MS / 2;
        timers.push(
          setTimeout(() => {
            if (cancelledRef.current) return;
            setBeatIdx(bi);
            setLineIdx(-1);
            setVisible(true);
          }, cursor),
        );
        cursor += CROSSFADE_MS / 2;
      }
      const lead = beat.leadIn ?? 200;
      cursor += lead;

      beat.lines.forEach((ln, li) => {
        timers.push(
          setTimeout(() => {
            if (cancelledRef.current) return;
            setLineIdx(li);
            void speak(ln.speaker, ln.speech ?? ln.text, sfxVolume);
          }, cursor),
        );
        cursor += ln.hold;
      });

      cursor += beat.tail ?? 200;
    });

    // Abschluss: Flag setzen, Cutscene schließen.
    timers.push(
      setTimeout(() => {
        if (cancelledRef.current) return;
        setVisible(false);
      }, cursor),
    );
    cursor += CROSSFADE_MS;
    timers.push(
      setTimeout(() => {
        if (cancelledRef.current) return;
        finish();
      }, cursor),
    );

    return () => {
      for (const t of timers) clearTimeout(t);
      timersRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const finish = () => {
    cancelledRef.current = true;
    stopSpeech();
    if (timersRef.current) {
      for (const t of timersRef.current) clearTimeout(t);
      timersRef.current = null;
    }
    fadeOutAndStopCutsceneMusic();
    music.resume();
    // Folgen, die früher die Dialoge `paramedicsArrive` und `paramedic`
    // gesetzt haben — die Cutscene ersetzt beide Räume und Dialoge.
    api.setFlag("doorBrokenOpen");
    api.setFlag("paramedicsCutsceneSeen");
    if (!api.hasFlag("protocolReceived")) {
      api.setFlag("protocolReceived");
      api.addItem({
        id: "protocol",
        name: "Einsatzprotokoll (verschlüsselt)",
        description:
          "Eine versiegelte Datenkapsel. Ziel: Sektor E71, Zimmer 1534. Etikett: „Fall-ID 5245@E67@2613“.",
      });
      api.setKnowledge("responsibilityE67");
      // Aufzugssystem meldet danach eine „lokale Übersteuerung“ und
      // legt eine Wartungssperre — wie zuvor im `paramedic`-Dialog.
      api.setFlag("elevatorMaintBlocked");
    }
    endCutscene();
    // Spieler wechselt direkt in den Korridor — die Cutscene hat die
    // Türöffnung und die Protokoll-Übergabe bereits gezeigt; die 2615
    // ist im Korridor jetzt mit gelbem Band versiegelt.
    api.goTo("hallway");
  };

  // ── Cutscene-Musik (separater Audio-Layer neben der Playlist) ──────
  function musicTargetVolume(): number {
    if (!musicEnabled) return 0;
    // Etwas leiser als die Hauptmusik, damit Dialog/TTS klar oben sitzt.
    return clamp01(musicVolume * 0.55);
  }

  function startCutsceneMusic() {
    if (musicAudioRef.current) return;
    const a = new Audio(cutsceneMusic);
    a.loop = true;
    a.volume = 0;
    musicAudioRef.current = a;
    void a.play().catch(() => {
      /* autoplay kann blockiert sein — leise scheitern. */
    });
    // Sanftes Einblenden über ~1.2 s.
    const target = musicTargetVolume();
    const startedAt = performance.now();
    const duration = 1200;
    if (musicFadeTimerRef.current) window.clearInterval(musicFadeTimerRef.current);
    musicFadeTimerRef.current = window.setInterval(() => {
      if (!musicAudioRef.current) {
        if (musicFadeTimerRef.current) window.clearInterval(musicFadeTimerRef.current);
        musicFadeTimerRef.current = null;
        return;
      }
      const t = Math.min(1, (performance.now() - startedAt) / duration);
      musicAudioRef.current.volume = clamp01(target * t);
      if (t >= 1) {
        if (musicFadeTimerRef.current) window.clearInterval(musicFadeTimerRef.current);
        musicFadeTimerRef.current = null;
      }
    }, 50);
  }

  function fadeOutAndStopCutsceneMusic() {
    const audio = musicAudioRef.current;
    if (!audio) return;
    const startVol = audio.volume;
    const startedAt = performance.now();
    const duration = 700;
    if (musicFadeTimerRef.current) window.clearInterval(musicFadeTimerRef.current);
    musicFadeTimerRef.current = window.setInterval(() => {
      if (!musicAudioRef.current) {
        if (musicFadeTimerRef.current) window.clearInterval(musicFadeTimerRef.current);
        musicFadeTimerRef.current = null;
        return;
      }
      const t = Math.min(1, (performance.now() - startedAt) / duration);
      musicAudioRef.current.volume = clamp01(startVol * (1 - t));
      if (t >= 1) {
        stopCutsceneMusic();
      }
    }, 50);
  }

  function stopCutsceneMusic() {
    if (musicFadeTimerRef.current) {
      window.clearInterval(musicFadeTimerRef.current);
      musicFadeTimerRef.current = null;
    }
    const audio = musicAudioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
      musicAudioRef.current = null;
    }
  }

  // Esc / Klick "Überspringen" -> direkt finishen.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  const beat = beats[beatIdx];
  const currentLine = lineIdx >= 0 ? beat.lines[lineIdx] : null;
  // Ken-Burns: 0..1 Fortschritt durch den aktuellen Beat.
  const progress = lineIdx < 0 ? 0 : Math.min(1, (lineIdx + 1) / beat.lines.length);
  const scale = beat.zoom[0] + (beat.zoom[1] - beat.zoom[0]) * progress;
  const tx = beat.pan[0] + (beat.pan[2] - beat.pan[0]) * progress;
  const ty = beat.pan[1] + (beat.pan[3] - beat.pan[1]) * progress;

  return (
    // Fullscreen-Overlay: liegt über TopBar, Inventar und allen anderen
    // UI-Elementen. So erscheint die Cutscene wie ein eigener Filmmodus
    // ohne sichtbare Bedienleiste.
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      {/* Bild-Layer mit Ken-Burns + Crossfade */}
      <div className="relative flex-1 overflow-hidden">
        <img
          key={beatIdx}
          src={beat.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity"
          style={{
            opacity: visible ? 1 : 0,
            transitionDuration: `${CROSSFADE_MS}ms`,
            transform: `scale(${scale.toFixed(3)}) translate(${tx}%, ${ty}%)`,
            transitionProperty: "opacity, transform",
            // Ken-Burns soll langsam laufen — ungefähr in der Geschwindigkeit
            // der Beat-Lines. 4s ist ein guter Mittelwert.
            transitionTimingFunction: "ease-out",
            // Eigene transition-duration für transform separat:
          }}
        />
        {/* CRT-Vignette + Scanlines */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 1px, transparent 3px)",
          }}
        />

        {/* Skip-Button */}
        <button
          type="button"
          onClick={finish}
          className="absolute right-4 top-4 rounded border border-amber-glow/40 bg-black/50 px-3 py-1.5 font-mono-crt text-xs text-amber-glow/80 transition-colors hover:bg-black/70 hover:text-amber-glow"
        >
          Überspringen ⏵⏵
        </button>
      </div>

      {/* Untertitel-Box */}
      <div className="relative h-[28%] min-h-[140px] border-t border-amber-glow/20 bg-black/85 px-6 py-5 sm:px-10">
        {currentLine && (
          <div
            key={`${beatIdx}-${lineIdx}`}
            className="mx-auto flex max-w-3xl flex-col gap-2 animate-fade-in"
          >
            <div className="font-mono-crt text-xs uppercase tracking-[0.3em] text-amber-glow/60">
              {currentLine.speaker === "SYSTEM" ? "—" : currentLine.speaker}
            </div>
            <div
              className={
                currentLine.speaker === "SYSTEM"
                  ? "font-mono-crt text-base italic text-amber-glow/70 sm:text-lg"
                  : "font-mono-crt text-lg text-amber-glow sm:text-xl"
              }
            >
              {currentLine.text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}