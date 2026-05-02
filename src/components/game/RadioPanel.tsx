import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import {
  playDoorbell,
  playTuningClick,
  startResonanceDrone,
} from "@/audio/sfx";
import { CloseButton } from "./CloseButton";
import { ACT2_BRIDGE_UI_TEXT } from "@/game/cutscenes";

// Schmerz-Radio-Erweiterung — i18n-freundliche UI-/Erzähltexte
// gehören in eine zentrale Konstante, nicht hartkodiert in JSX.
const RADIO_EXT_TEXT = {
  hiddenFreqIntro: [
    ">> WARTUNGS-FUNKGERÄT 5610 — TRÄGER GEFUNDEN",
    "Aus dem alten Lautsprecher klickt es. Eine müde Männerstimme:",
    "„Wenn das hier jemand hört … hier ist Krummbein, Hausmeister-Vorgänger.“",
    "„Ich lege ein Stück Antennen-Draht in das Schubfach unter dem Funk.“",
    "„Wer das Band kippen will, braucht beides: Kristall und Draht.“",
    "Ein Klacken. Im Schubfach: eine kleine Spule Kupferdraht.",
  ],
  duelIntro: [
    ">> SCHMERZ-RADIO — TRAUER-BAND",
    "Mira hat ihre Antenne aus dem Fenster gehängt.",
    "Auf demselben Band, das das Haus seit Jahren als Trauer kennt,",
    "drückt jetzt eine zweite Welle dagegen — Wut, ungeduldig, jung.",
    "Halte die Frequenz stabil bei 104,0. Lass nicht los, bis das Band kippt.",
  ],
  duelHoldLabel: "FREQUENZ HALTEN",
  duelTargetLabel: "Ziel: 104,0 ±0,1 MHz",
  duelProgressLabel: "Wut überlagert Trauer",
  duelSuccess: [
    ">> BAND GEKIPPT — 103,5–104,5 SENDET JETZT WUT",
    "Layard lässt los. Mira lacht kurz auf — dann wird sie still.",
    "„Jetzt hören sie das, was ich meine. Wenigstens für eine Weile.“",
    "Sie nickt zu ihrem Terminal hinüber. „Wenn du was suchen willst — los.“",
  ],
  duelFailure: [
    "Die Wut-Welle verliert die Spur. Trauer wischt sie weg wie Asche.",
    "Mira flucht leise. „Nochmal. Beim nächsten Mal halt sie ruhiger.“",
  ],
};

/** Ziel-Frequenz des Hidden-Frequency-Rätsels (Hinweise: zwischen
 * Einsamkeit und Trauer; siebte Stufe nach unten ab 103,4 = 102,7). */
const HIDDEN_TARGET_FREQ = 102.7;
/** Das Trauer-Band — hier passiert das Resonanz-Duell. */
const DUEL_TARGET_FREQ = 104.0;
const DUEL_TOLERANCE = 0.1;
/** Wie lange (ms) die Frequenz im Toleranzfenster gehalten werden muss. */
const DUEL_HOLD_MS = 5000;

const BANDS = [
  {
    from: 100.0,
    to: 101.9,
    label: "Angst / Panik",
    art: "Statisch, zitternd",
    style: "panic" as const,
    color: "bg-destructive",
  },
  {
    from: 102.0,
    to: 103.4,
    label: "Einsamkeit",
    art: "Dumpf, wogend",
    style: "lonely" as const,
    color: "bg-phosphor-dim",
  },
  {
    from: 103.5,
    to: 104.5,
    label: "Trauer",
    art: "Fließend, warm",
    style: "grief" as const,
    color: "bg-amber-glow/70",
  },
  {
    from: 104.6,
    to: 104.6,
    label: "Engel-Trauer",
    art: "Kristallklar, tief",
    style: "angel" as const,
    color: "bg-amber-glow",
  },
  {
    from: 105.0,
    to: 106.5,
    label: "Sehnsucht",
    art: "Pulsierend",
    style: "longing" as const,
    color: "bg-primary",
  },
  {
    from: 107.0,
    to: 108.0,
    label: "Gestörte Signale",
    art: "Rauschen",
    style: "noise" as const,
    color: "bg-muted-foreground",
  },
];

function bandFor(freq: number) {
  return BANDS.find((b) => freq >= b.from && freq <= b.to) ?? null;
}

export function RadioPanel() {
  const {
    radioOpen,
    closeRadio,
    api,
    setRadioActive,
    bumpResonance,
    resetResonance,
    resonance,
    flags,
    scene,
  } = useGame();
  const { sfxVolume } = useSettings();

  const [freq, setFreq] = useState(102.3);
  const [volume, setVolume] = useState(0.5);
  const lastTickRef = useRef<number | null>(null);
  const droneStopRef = useRef<(() => void) | null>(null);
  const lastFreqRef = useRef(freq);
  const [tick, setTick] = useState(0);

  // ── Akt-II-Resonanz-Pause (Dr. Okwu, weich) ─────────────────────
  // Solange `radioOnPause` gesetzt ist und Layard die Pause noch nicht
  // einmal innerhalb dieser Session bewusst übergangen hat, blockiert
  // ein Warnhinweis das Panel. Zwei Optionen: lassen (schließt das Panel)
  // oder trotzdem einschalten (setzt `cheatedRadioOnPause`).
  const [pauseAck, setPauseAck] = useState(false);
  const showPauseGate =
    radioOpen &&
    flags.has("radioOnPause") &&
    !flags.has("cheatedRadioOnPause") &&
    !pauseAck;

  // Reset des Session-Acks, sobald das Radio wieder geschlossen wird.
  useEffect(() => {
    if (!radioOpen) setPauseAck(false);
  }, [radioOpen]);

  // ── Resonanz-Duell (Mira-Verstärker) ────────────────────────────
  // Aktiv, sobald Layard Miras Antenne übergeben hat (`miraHasAmplifier`)
  // und sich auf Etage 4 oder in Miras Wohnung befindet. Solange er
  // im Trauer-Band hält, läuft die Hold-Bar hoch; verlässt er das
  // Fenster, läuft sie wieder zurück.
  const [duelHoldMs, setDuelHoldMs] = useState(0);
  const duelActive =
    radioOpen &&
    flags.has("miraHasAmplifier") &&
    !flags.has("miraSentAnger") &&
    (scene === "aptMira4601" || scene === "corridor46");
  const duelInWindow =
    duelActive &&
    Math.abs(freq - DUEL_TARGET_FREQ) <= DUEL_TOLERANCE &&
    volume >= 0.6;

  useEffect(() => {
    if (!duelActive) {
      if (duelHoldMs !== 0) setDuelHoldMs(0);
      return;
    }
    const id = setInterval(() => {
      setDuelHoldMs((prev) => {
        const next = duelInWindow ? prev + 200 : Math.max(0, prev - 300);
        return Math.min(DUEL_HOLD_MS, next);
      });
    }, 200);
    return () => clearInterval(id);
  }, [duelActive, duelInWindow, duelHoldMs]);

  // Erfolg: Hold-Bar voll → Flag setzen, Mira-Terminal freischalten.
  useEffect(() => {
    if (!duelActive) return;
    if (duelHoldMs < DUEL_HOLD_MS) return;
    if (flags.has("miraSentAnger")) return;
    api.setFlag("miraSentAnger");
    api.setFlag("miraTerminalUnlocked");
    setRadioActive(false);
    closeRadio();
    api.showText(RADIO_EXT_TEXT.duelSuccess);
  }, [duelActive, duelHoldMs, flags, api, setRadioActive, closeRadio]);

  // Einmaliger Intro-Text, wenn das Duell zum ersten Mal scharf ist.
  const duelIntroSeenRef = useRef(false);
  useEffect(() => {
    if (!duelActive) {
      duelIntroSeenRef.current = false;
      return;
    }
    if (duelIntroSeenRef.current) return;
    duelIntroSeenRef.current = true;
    api.showText(RADIO_EXT_TEXT.duelIntro);
  }, [duelActive, api]);

  // ── Hidden Frequency 102,7 — Wartungs-Funkgerät 5610 ────────────
  // Layard muss im Serverraum sein, das Schmerz-Radio offen haben,
  // den Tuning-Kristall im Inventar tragen und die Frequenz innerhalb
  // einer engen Toleranz exakt auf 102,7 stellen. Belohnung: ein
  // Stück Antennen-Draht (Bridge zu Rätsel 2).
  useEffect(() => {
    if (!radioOpen) return;
    if (scene !== "serverRoom5610") return;
    if (flags.has("hiddenFrequencyFound")) return;
    if (!api.hasItem("tuningCrystal")) return;
    if (!flags.has("sawWartungsFunk5610")) return;
    if (Math.abs(freq - HIDDEN_TARGET_FREQ) > 0.05) return;
    const t = setTimeout(() => {
      api.setFlag("hiddenFrequencyFound");
      setRadioActive(false);
      closeRadio();
      api.addItem({
        id: "antennaWire",
        name: "Antennen-Draht (Spule)",
        description:
          "Eine kleine Spule isolierter Kupferdraht aus dem Schubfach des alten Wartungs-Funks. Genug, um eine improvisierte Antenne zu bauen.",
      });
      api.addItem({
        id: "wartungsDiktat",
        name: "Wartungs-Diktat (Krummbein)",
        description:
          "Ein Notizfetzen, der aus dem Funk fiel: »Kristall + Draht = Verstärker. Wer das Band kippen will, sendet damit, nicht dagegen.«",
      });
      api.showText(RADIO_EXT_TEXT.hiddenFreqIntro);
    }, 900);
    return () => clearTimeout(t);
  }, [radioOpen, scene, freq, flags, api, setRadioActive, closeRadio]);

  // Silence-Test (für Mira-Trust): Wenn das Radio offen ist UND
  // die Lautstärke 60 Sekunden ununterbrochen auf 0 steht, setzen
  // wir `radioMutedAtLeast60s`. Sobald die Lautstärke wieder steigt,
  // wird der Timer zurückgesetzt. Schließen des Radios setzt den
  // Timer ebenfalls zurück (aber das Flag bleibt natürlich gesetzt).
  useEffect(() => {
    if (!radioOpen) return;
    if (flags.has("radioMutedAtLeast60s")) return;
    if (volume > 0.001) return;
    const t = setTimeout(() => {
      api.setFlag("radioMutedAtLeast60s");
    }, 60_000);
    return () => clearTimeout(t);
  }, [radioOpen, volume, flags, api]);

  // Animate waveform for all bands
  useEffect(() => {
    if (!radioOpen) return;
    const id = setInterval(() => setTick((t) => (t + 1) % 10000), 90);
    return () => clearInterval(id);
  }, [radioOpen]);

  // Tuning clicks when frequency changes
  useEffect(() => {
    if (Math.abs(freq - lastFreqRef.current) > 0.01) {
      playTuningClick(0.2 * sfxVolume);
      lastFreqRef.current = freq;
    }
  }, [freq, sfxVolume]);

  // Resonance drone — plays when overload is imminent
  useEffect(() => {
    if (resonance > 65 && !droneStopRef.current) {
      droneStopRef.current = startResonanceDrone(0.45 * sfxVolume);
    } else if (resonance <= 50 && droneStopRef.current) {
      droneStopRef.current();
      droneStopRef.current = null;
    }
  }, [resonance, sfxVolume]);

  // Cleanup drone on unmount / radio close
  useEffect(() => {
    if (!radioOpen && droneStopRef.current) {
      droneStopRef.current();
      droneStopRef.current = null;
    }
    return () => {
      if (droneStopRef.current) {
        droneStopRef.current();
        droneStopRef.current = null;
      }
    };
  }, [radioOpen]);

  // Resonance build-up while on 104.6 with high volume
  useEffect(() => {
    if (!radioOpen) return;
    // Nach burn: 104,6 ist auf E67-Reichweite tot. Keine Resonanz, kein
    // radioActive-Lock — die Frequenz rauscht nur noch.
    const burned = flags.has("burnedNode5610");
    const interval = setInterval(() => {
      const onSignal = freq === 104.6;
      setRadioActive(onSignal && !burned);
      // Resonance only builds when the volume is dialed to the max
      if (onSignal && !burned && volume >= 0.99) {
        bumpResonance(8);
      } else {
        bumpResonance(-4);
      }
      lastTickRef.current = Date.now();
    }, 600);
    return () => clearInterval(interval);
  }, [radioOpen, freq, volume, bumpResonance, setRadioActive, flags]);

  // Schmerz-Radio-Marker: sobald Layard 104,6 trifft, merken wir das
  // dauerhaft. Schaltet u.a. den Atmosphäre-Text an der Rohrpost in
  // der Cafeteria frei. Lautstärke und burn-State sind egal — es geht
  // nur darum, dass er die Frequenz mal ausprobiert hat.
  useEffect(() => {
    if (!radioOpen) return;
    if (freq !== 104.6) return;
    if (flags.has("radioTunedTo1046")) return;
    api.setFlag("radioTunedTo1046");
  }, [radioOpen, freq, flags, api]);

  // Trigger doorbell only when locked on 104.6 at MAXIMUM volume
  useEffect(() => {
    // Nach burn ist das Klopf-Event entweder längst geschehen oder
    // wurde durch den burn-Recovery-Pfad im NodeTerminal gefeuert.
    // 104,6 darf hier nichts mehr triggern.
    if (flags.has("burnedNode5610")) return;
    if (freq === 104.6 && volume >= 0.99 && !flags.has("doorbellRang")) {
      const t = setTimeout(() => {
        api.setFlag("doorbellRang");
        setRadioActive(true);
        resetResonance();
        closeRadio();
        // 1) Erst spielt der Schmerz-Radio-Moment in voller Länge ab.
        //    2) Erst nach dem Schließen des Radio-Texts klingelt es an
        //       der Tür und der Türdialog beginnt.
        const isHome = scene === "apartment";
        api.showText(
          [
            ">> SCHMERZ-RADIO 104,6 — ENGEL-TRAUER",
            "Eine Stimme, die nichts sagt. Nur trauert.",
            "Fragmente: „... Zimmer ... Wand ... nicht aufhören ...“",
          ],
          () => {
            playDoorbell(0.7 * sfxVolume);
            if (isHome) {
              api.showText(
                [
                  "*KLINGEL-KLINGEL*",
                  "Jemand ist an Layards Wohnungstür.",
                ],
                () => {
                  api.setFlag("metPhilippe");
                  api.startDialog("philippeAtDoor");
                },
              );
            } else {
              api.showText([
                "Irgendwo, weit weg: ein einzelnes *KLINGEL*.",
                "Vielleicht in 2611. Vielleicht sollte Layard nach Hause.",
              ]);
            }
          },
        );
      }, 900);
      return () => clearTimeout(t);
    }
  }, [freq, volume, flags, api, setRadioActive, resetResonance, closeRadio, sfxVolume, scene]);

  // E71 — Frequenzsperre. Sobald Layard das Schmerz-Radio in einer Szene
  // des Sektors E71 auf 104,6 stellt (Lautstärke egal), wird er — höflich,
  // aber bestimmt — aus dem Gebäude geleitet. Er landet wieder im
  // Verbindungsgang und kann von dort erneut hinein.
  const inE71 =
    scene === "e71Lobby" || scene === "corridor15" || scene === "room1534";
  useEffect(() => {
    if (!radioOpen) return;
    if (!inE71) return;
    if (freq !== 104.6) return;
    // Nach burn ist 104,6 in E71 nur noch Rauschen — niemand kommt mehr,
    // weil nichts mehr zu hören ist.
    if (flags.has("burnedNode5610")) return;
    const t = setTimeout(() => {
      setRadioActive(false);
      resetResonance();
      closeRadio();
      api.showText(
        [
          ">> SEKTOR E71 — FREQUENZSPERRE 104,6 AKTIV",
          "Eine Hand auf Layards Schulter. Ein junger Pfleger, sehr ruhig.",
          "„Herr Worag. Bitte schalten Sie das ab. In E71 ist 104,6 nicht zugelassen.“",
          "Niemand hebt die Stimme. Niemand fragt, was er hier wollte.",
          "Zwei weitere Pflegerinnen begleiten ihn höflich zurück Richtung Empfang.",
          "Die Empfangsdame sieht kurz auf. Sagt nichts.",
          "Die Aufzugtür schließt. Außenluft.",
        ],
        () => {
          api.goTo("passage");
        },
      );
    }, 600);
    return () => clearTimeout(t);
  }, [radioOpen, inE71, freq, api, setRadioActive, resetResonance, closeRadio, flags]);

  if (!radioOpen) return null;

  const burned = flags.has("burnedNode5610");
  // Nach burn ist 104,6 in E67-Reichweite stumm — Layard hört nur noch
  // Rauschen. Statt der „Engel-Trauer“-Beschreibung zeigen wir das
  // Stille-Band an. Die Animation läuft als „noise“-Style.
  const currentBand =
    burned && freq === 104.6
      ? {
          from: 104.6,
          to: 104.6,
          label: "— Rauschen —",
          art: "Träger ausgefallen",
          style: "noise" as const,
          color: "bg-muted-foreground",
        }
      : bandFor(freq);
  const onAngel = freq === 104.6 && !burned;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 px-4">
      <div className="fade-in relative w-full max-w-2xl rounded-sm border border-amber-glow/50 bg-background p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <CloseButton
          onClick={() => {
            setRadioActive(false);
            closeRadio();
          }}
          label="Radio schließen"
          className="absolute right-3 top-3"
        />
        <div className="mb-4 flex items-center justify-between pr-10">
          <h2 className="font-display text-xl uppercase tracking-[0.3em] text-amber-glow amber-glow">
            Schmerz-Radio
          </h2>
        </div>

        {/* Frequency display */}
        <div className="mb-4 rounded-sm border border-border bg-black/60 p-4 text-center">
          <div className="font-mono-crt text-5xl text-amber-glow amber-glow">
            {freq.toFixed(1)}
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            MHz
          </div>
          {currentBand && (
            <div className="mt-3 text-sm text-foreground/90">
              <span className="font-mono-crt text-amber-glow">▸</span>{" "}
              {currentBand.label}
              <span className="ml-2 text-xs italic text-muted-foreground">
                ({currentBand.art})
              </span>
            </div>
          )}
        </div>

        {/* Frequency dial */}
        <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
          Frequenz
        </label>
        <input
          type="range"
          min={100}
          max={108}
          step={0.1}
          value={freq}
          onChange={(e) => setFreq(parseFloat(e.target.value))}
          className="mb-4 w-full accent-amber-glow"
        />

        {/* Snap buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          {[100.5, 102.3, 103.8, 104.6, 105.7].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFreq(f)}
              className={`rounded-sm border px-2 py-1 font-mono-crt text-xs transition ${
                Math.abs(freq - f) < 0.05
                  ? "border-amber-glow text-amber-glow"
                  : "border-border text-muted-foreground hover:border-amber-glow/60 hover:text-foreground"
              }`}
            >
              {f.toFixed(1)}
            </button>
          ))}
        </div>

        {/* Volume */}
        <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
          Lautstärke
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="mb-4 w-full accent-amber-glow"
        />

        {/* Wave visualization */}
        <div className="mb-4 flex h-16 items-end gap-[2px] rounded-sm border border-border bg-black/70 p-2">
          {Array.from({ length: 60 }).map((_, i) => {
            const phase = tick / 6;
            const style = currentBand?.style ?? "off";
            let intensity = 0;
            switch (style) {
              case "angel":
                // Coherent crystalline pulse
                intensity =
                  0.35 +
                  Math.abs(Math.sin((i + freq * 10) / 4 + phase)) * 0.65;
                break;
              case "panic": {
                // Sharp, jittery spikes — fast tremor
                const jitter = Math.sin(i * 2.7 + phase * 3.1) * 0.5;
                const spike = (i + Math.floor(tick * 1.3)) % 5 === 0 ? 0.45 : 0;
                intensity = 0.15 + Math.abs(jitter) * 0.5 + spike;
                break;
              }
              case "lonely":
                // Slow, dumpfe Welle (long wavelength, low amplitude)
                intensity =
                  0.12 +
                  (Math.sin(i / 9 + phase * 0.25) + 1) * 0.22 +
                  (Math.sin(i / 14 - phase * 0.18) + 1) * 0.1;
                break;
              case "grief":
                // Warmes Fließen — sanfte überlagerte Sinus
                intensity =
                  0.2 +
                  Math.abs(Math.sin(i / 5 + phase * 0.5)) * 0.3 +
                  Math.abs(Math.sin(i / 2.3 + phase * 0.35)) * 0.2;
                break;
              case "longing": {
                // Pulsierend — globale Amplituden-Hüllkurve
                const env = 0.5 + Math.sin(phase * 0.7) * 0.5;
                intensity =
                  0.15 +
                  Math.abs(Math.sin(i / 4 + phase * 1.1)) * 0.55 * env;
                break;
              }
              case "noise": {
                // Chaotisches Rauschen — pseudo-random, ändert sich schnell
                const seed = (i * 9301 + tick * 49297) % 233280;
                const r = (seed / 233280) * 0.8;
                intensity = 0.05 + r;
                break;
              }
              default: {
                // Off-band — zwischen den Bändern, leises Knistern
                intensity =
                  0.06 +
                  Math.abs(Math.sin(i * 1.3 + phase * 1.4)) * 0.14 +
                  ((i * 7 + tick) % 11) / 130;
              }
            }
            const colorClass = onAngel
              ? "bg-amber-glow wave-pulse"
              : (currentBand?.color ?? "bg-muted-foreground/60");
            return (
              <div
                key={i}
                className={`w-[3px] origin-bottom transition-[height] duration-75 ${colorClass}`}
                style={{
                  height: `${Math.min(100, intensity * 100 * volume)}%`,
                  animationDelay: `${i * 30}ms`,
                }}
              />
            );
          })}
        </div>

        {/* Resonance bar */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            <span>Resonanz</span>
            <span
              className={
                resonance > 70
                  ? "text-destructive"
                  : resonance > 40
                    ? "text-amber-glow"
                    : "text-muted-foreground"
              }
            >
              {Math.round(resonance)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-sm border border-border bg-black/60">
            <div
              className={`h-full transition-all ${
                resonance > 70
                  ? "bg-destructive"
                  : resonance > 40
                    ? "bg-amber-glow"
                    : "bg-phosphor-dim"
              }`}
              style={{ width: `${resonance}%` }}
            />
          </div>
          {resonance > 70 && (
            <p className="mt-2 text-center text-xs uppercase tracking-widest text-destructive crt-flicker">
              ⚠ Zu nah. Resonanz-Überlastung droht.
            </p>
          )}
        </div>

        {/* Resonanz-Duell — nur sichtbar, wenn Mira sendet. */}
        {duelActive && (
          <div className="mt-4 rounded-sm border border-destructive/60 bg-destructive/10 p-3">
            <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest">
              <span className="text-destructive">
                {RADIO_EXT_TEXT.duelHoldLabel}
              </span>
              <span className="text-muted-foreground">
                {RADIO_EXT_TEXT.duelTargetLabel}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-sm border border-border bg-black/60">
              <div
                className={`h-full transition-all ${
                  duelInWindow ? "bg-destructive" : "bg-muted-foreground/60"
                }`}
                style={{
                  width: `${(duelHoldMs / DUEL_HOLD_MS) * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
              {RADIO_EXT_TEXT.duelProgressLabel}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}