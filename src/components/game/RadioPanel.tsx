import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import {
  playDoorbell,
  playTuningClick,
  startResonanceDrone,
} from "@/audio/sfx";
import { CloseButton } from "./CloseButton";
import {
  BURNED_NOISE_BAND,
  DUEL_HOLD_MS,
  DUEL_TARGET_FREQ,
  DUEL_TOLERANCE,
  HIDDEN_TARGET_FREQ,
  RADIO_EXT_TEXT,
  bandFor,
} from "@/game/radio/bands";
import { Waveform } from "./radio/Waveform";
import { ResonanceMeter } from "./radio/ResonanceMeter";
import { DuelHoldBar } from "./radio/DuelHoldBar";
import { RadioPauseGate } from "./radio/RadioPauseGate";

const SNAP_FREQS = [100.5, 102.3, 103.8, 104.6, 105.7] as const;

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
  const [pauseAck, setPauseAck] = useState(false);
  const showPauseGate =
    radioOpen &&
    flags.has("radioOnPause") &&
    !flags.has("cheatedRadioOnPause") &&
    !pauseAck;

  useEffect(() => {
    if (!radioOpen) setPauseAck(false);
  }, [radioOpen]);

  // ── Resonanz-Duell (Mira-Verstärker) ────────────────────────────
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

  // Silence-Test (Mira-Trust)
  useEffect(() => {
    if (!radioOpen) return;
    if (flags.has("radioMutedAtLeast60s")) return;
    if (volume > 0.001) return;
    const t = setTimeout(() => {
      api.setFlag("radioMutedAtLeast60s");
    }, 60_000);
    return () => clearTimeout(t);
  }, [radioOpen, volume, flags, api]);

  // Animate waveform
  useEffect(() => {
    if (!radioOpen) return;
    const id = setInterval(() => setTick((t) => (t + 1) % 10000), 90);
    return () => clearInterval(id);
  }, [radioOpen]);

  // Tuning clicks
  useEffect(() => {
    if (Math.abs(freq - lastFreqRef.current) > 0.01) {
      playTuningClick(0.2 * sfxVolume);
      lastFreqRef.current = freq;
    }
  }, [freq, sfxVolume]);

  // Resonance drone
  useEffect(() => {
    if (resonance > 65 && !droneStopRef.current) {
      droneStopRef.current = startResonanceDrone(0.45 * sfxVolume);
    } else if (resonance <= 50 && droneStopRef.current) {
      droneStopRef.current();
      droneStopRef.current = null;
    }
  }, [resonance, sfxVolume]);

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

  // Resonance build-up
  useEffect(() => {
    if (!radioOpen) return;
    const burned = flags.has("burnedNode5610");
    const interval = setInterval(() => {
      const onSignal = freq === 104.6;
      setRadioActive(onSignal && !burned);
      if (onSignal && !burned && volume >= 0.99) {
        bumpResonance(8);
      } else {
        bumpResonance(-4);
      }
      lastTickRef.current = Date.now();
    }, 600);
    return () => clearInterval(interval);
  }, [radioOpen, freq, volume, bumpResonance, setRadioActive, flags]);

  // Schmerz-Radio-Marker
  useEffect(() => {
    if (!radioOpen) return;
    if (freq !== 104.6) return;
    if (flags.has("radioTunedTo1046")) return;
    api.setFlag("radioTunedTo1046");
  }, [radioOpen, freq, flags, api]);

  // Doorbell trigger
  useEffect(() => {
    if (flags.has("burnedNode5610")) return;
    // Erst klingeln, wenn die Resonanz tatsächlich überlastet (≥100 %).
    if (
      freq === 104.6 &&
      volume >= 0.99 &&
      resonance >= 100 &&
      !flags.has("doorbellRang")
    ) {
      const t = setTimeout(() => {
        api.setFlag("doorbellRang");
        setRadioActive(true);
        resetResonance();
        closeRadio();
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
  }, [freq, volume, resonance, flags, api, setRadioActive, resetResonance, closeRadio, sfxVolume, scene]);

  // E71 Frequenzsperre
  const inE71 =
    scene === "e71Lobby" || scene === "corridor15" || scene === "room1534";
  useEffect(() => {
    if (!radioOpen) return;
    if (!inE71) return;
    if (freq !== 104.6) return;
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

  const handleClose = useCallback(() => {
    setRadioActive(false);
    closeRadio();
  }, [setRadioActive, closeRadio]);

  const handlePauseContinue = useCallback(() => {
    if (!flags.has("cheatedRadioOnPause")) {
      api.setFlag("cheatedRadioOnPause");
    }
    setPauseAck(true);
  }, [api, flags]);

  const handleFreqChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFreq(parseFloat(e.target.value));
    },
    [],
  );
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(parseFloat(e.target.value));
    },
    [],
  );

  const burned = flags.has("burnedNode5610");
  const currentBand = useMemo(
    () => (burned && freq === 104.6 ? BURNED_NOISE_BAND : bandFor(freq)),
    [burned, freq],
  );
  const onAngel = freq === 104.6 && !burned;
  const overloading = resonance >= 85 && onAngel;

  if (!radioOpen) return null;

  if (showPauseGate) {
    return (
      <RadioPauseGate
        onAbort={handleClose}
        onContinue={handlePauseContinue}
      />
    );
  }

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 px-4">
      <div
        className={`fade-in relative w-full max-w-2xl rounded-sm border border-amber-glow/50 bg-background p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] ${
          overloading ? "resonance-overload" : ""
        }`}
      >
        {overloading && <div className="resonance-red-flicker" aria-hidden />}
        <CloseButton
          onClick={handleClose}
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

        <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
          Frequenz
        </label>
        <input
          type="range"
          min={100}
          max={108}
          step={0.1}
          value={freq}
          onChange={handleFreqChange}
          className="mb-4 w-full accent-amber-glow"
        />

        <div className="mb-4 flex flex-wrap gap-2">
          {SNAP_FREQS.map((f) => (
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

        <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
          Lautstärke
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          className="mb-4 w-full accent-amber-glow"
        />

        <Waveform
          tick={tick}
          freq={freq}
          volume={volume}
          band={currentBand}
          onAngel={onAngel}
        />

        <ResonanceMeter resonance={resonance} />

        {duelActive && (
          <DuelHoldBar duelHoldMs={duelHoldMs} duelInWindow={duelInWindow} />
        )}
      </div>
    </div>
  );
}
