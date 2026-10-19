import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import {
  playDoorbell,
  playTuningClick,
  startResonanceDrone,
} from "@/audio/sfx";
import { CloseButton } from "./CloseButton";
import { BURNED_NOISE_BAND, bandFor } from "@/game/radio/bands";
import { Waveform } from "./radio/Waveform";
import { ResonanceMeter } from "./radio/ResonanceMeter";

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
    // Das Schmerz-Radio ist ein privates Phänomen und hängt nicht am
    // Vorgangsknoten 5610 — ein Löschlauf dort ändert am Empfang nichts.
    const burned = false;
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
            "Heute ist da wieder dieses tiefe Gefühl auf dieser Frequenz, das ihn nicht loslässt. Layard dreht die Gefühlslautstärke auf Maximum. Ein abgrundtiefer Schmerz, da er klar empfangbar ist, von ganz besonderer Reinheit. Sehr ausdifferenziert.\n",
            "Ob da jemand über sein verlorenes Kind trauert? Es musste eine ganz besondere Trauer sein. Es wird schwärzer, vielleicht doch zu viel? Nein, da ist noch etwas anderes, hinter dem Schmerz. Warum fühlt sich diese Trauer so schön an? Er hatte den Verdacht schon länger: Wenn ein Gefühl besonders intensiv ist, dann trägt es immer auch Fetzen anderer Gefühle mit sich. ",
            "Normalerweise kommt nicht viel mit bei Schmerz und Trauer, das Gefühl überlagert alles. Dieses Gefühl aber – er taufte es spontan Engel-Trauer auf 104,6 – transportierte etwas mit. Ehrfurcht. Trost. Weisheit über das Leben. Wer auch immer dieses Gefühl sendet, er sollte diese Person treffen, schießt es Layard durch den Kopf. ",
          ],
          () => {
            playDoorbell(0.7 * sfxVolume);
            if (isHome) {
              api.showText(
                [
                  "*KLINGEL-KLINGEL*",
                  "Es klingelt an der Tür. Layard beendet die Übertragung, indem er beide Hände ruckartig von der Metallstange entfernt. Wer könnte das sein? Normalerweise klingelt niemand bei Layard, zumindest nicht unangekündigt. Die Post wird in der Postbox ausgeliefert, mit der alle E-Gebäude vor vier Jahren ausgestattet wurden. ",
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
    const t = setTimeout(() => {
      setRadioActive(false);
      resetResonance();
      closeRadio();
      api.showText(
        [
          ">> GEBÄUDE E71 — FREQUENZSPERRE 104,6 AKTIV",
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

  const burned = false;
  const currentBand = useMemo(
    () => (burned && freq === 104.6 ? BURNED_NOISE_BAND : bandFor(freq)),
    [burned, freq],
  );
  const onAngel = freq === 104.6 && !burned;
  const overloading = resonance >= 85 && onAngel;

  if (!radioOpen) return null;

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

      </div>
    </div>
  );
}
