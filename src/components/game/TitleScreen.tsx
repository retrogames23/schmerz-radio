import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import titleTrack from "@/assets/almost-freedom.mp3";
import { CrtMatrixBackground } from "./CrtMatrixBackground";
import { isWebGpuAvailable, startLocalLlmLoad } from "@/llm/webLlmLoader";
import { ImpressumOverlay } from "./ImpressumOverlay";
import { OpenSourceOverlay } from "./OpenSourceOverlay";

interface Props {
  onStart: () => void;
}

export function TitleScreen({ onStart }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const [musicOn, setMusicOn] = useState(true);
  const [impressumOpen, setImpressumOpen] = useState(false);
  const [ossOpen, setOssOpen] = useState(false);

  useEffect(() => {
    const a = new Audio(titleTrack);
    a.loop = true;
    a.volume = 0.45;
    audioRef.current = a;

    // Try to autoplay; if the browser blocks it, start on the first user interaction.
    const tryPlay = () => {
      a.play().then(() => setMusicOn(true)).catch(() => setMusicOn(false));
    };
    tryPlay();

    const onFirstInteract = () => {
      if (startedRef.current) return;
      if (a.paused) {
        a.play().then(() => setMusicOn(true)).catch(() => {});
      }
      window.removeEventListener("pointerdown", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
    };
    window.addEventListener("pointerdown", onFirstInteract);
    window.addEventListener("keydown", onFirstInteract);

    return () => {
      a.pause();
      audioRef.current = null;
      window.removeEventListener("pointerdown", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
    };
  }, []);

  // Heimliches Vorladen des lokalen Free-Mode-Modells, damit es
  // bereits warm ist, wenn der Spieler einen NPC frei anspricht.
  // Schlägt still fehl (z.B. ohne WebGPU) — die Cloud-Runtime
  // greift dann später automatisch.
  useEffect(() => {
    if (!isWebGpuAvailable()) return;
    const t = window.setTimeout(() => {
      void startLocalLlmLoad().catch(() => {
        /* still ignorieren — UI zeigt es im Free-Chat ggf. nochmal an */
      });
    }, 1500);
    return () => window.clearTimeout(t);
  }, []);

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (musicOn) {
      a.pause();
      setMusicOn(false);
    } else {
      void a.play().then(() => setMusicOn(true)).catch(() => setMusicOn(false));
    }
  };

  const handleStart = () => {
    // Stop title music before entering the game (game has its own playlist).
    startedRef.current = true;
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
      a.src = "";
      audioRef.current = null;
    }
    setMusicOn(false);
    onStart();
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 text-center">
      <CrtMatrixBackground />
      {/* Darken the matrix slightly so the title stays readable. */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="scanlines absolute inset-0 opacity-40" />
      <div className="amber-vignette opacity-30" />

      <button
        type="button"
        onClick={toggleMusic}
        aria-label={musicOn ? "Musik ausschalten" : "Musik einschalten"}
        className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-sm border border-amber-glow/50 bg-background/70 px-3 py-2 font-mono-crt text-xs uppercase tracking-widest text-amber-glow transition hover:bg-amber-glow/15"
      >
        {musicOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        <span>{musicOn ? "Musik AN" : "Musik AUS"}</span>
      </button>

      <div className="relative z-10 max-w-3xl">
        <p className="font-mono-crt text-xs uppercase tracking-[0.5em] text-muted-foreground">
          Quadrant E67 · Akt I
        </p>

        <h1 className="mt-4 font-display text-5xl uppercase tracking-[0.15em] text-foreground text-shadow-hard sm:text-7xl">
          SCHMERZ
          <span className="mx-2 amber-glow text-amber-glow">·</span>
          RADIO
        </h1>

        <div className="mt-3 font-mono-crt text-2xl text-amber-glow amber-glow">
          auf 104,6
        </div>

        <p className="mx-auto mt-8 max-w-xl font-display text-base leading-relaxed text-muted-foreground sm:text-lg">
          Ein klassisches Cozypunk-Point-&amp;-Click-Adventure
        </p>

        <button
          type="button"
          onClick={handleStart}
          className="mt-10 rounded-sm border border-amber-glow/60 bg-background/40 px-8 py-3 font-display text-base uppercase tracking-[0.4em] text-amber-glow transition hover:bg-amber-glow/10 amber-glow"
        >
          ▸ Spiel beginnen
        </button>

        <div className="mt-12 space-y-1 font-mono-crt text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <div>Layard Worag · Zimmer 2611</div>
          <div>CentralOS v2.3 · E67.NETZ stabil</div>
        </div>

        <a
          href="https://buymeacoffee.com/doener"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block font-mono-crt text-xs uppercase tracking-[0.3em] text-amber-glow/80 underline-offset-4 hover:underline amber-glow"
        >
          ☕ Buy me a coffee
        </a>

        <div className="mt-4 flex justify-center">
          <a
            href="https://lovable.dev/invite/LN0I260"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Built with Lovable"
            className="inline-flex items-center gap-2 rounded-sm border border-amber-glow/30 bg-background/40 px-3 py-1.5 font-mono-crt text-[10px] uppercase tracking-[0.3em] text-amber-glow/70 transition hover:border-amber-glow/60 hover:text-amber-glow"
          >
            <span className="text-sm leading-none">♥</span>
            <span>Built with Lovable</span>
          </a>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 font-mono-crt text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <button
            type="button"
            onClick={() => setImpressumOpen(true)}
            className="hover:text-amber-glow"
          >
            Impressum
          </button>
          <a
            href="mailto:stephan.doerner@posteo.de"
            className="hover:text-amber-glow"
          >
            Kontakt: stephan.doerner@posteo.de
          </a>
          <button
            type="button"
            onClick={() => setOssOpen(true)}
            className="hover:text-amber-glow text-center"
          >
            Verwendete Freie-Software-Komponenten und Lizenzen
          </button>
        </div>
      </div>

      <ImpressumOverlay open={impressumOpen} onClose={() => setImpressumOpen(false)} />
      <OpenSourceOverlay open={ossOpen} onClose={() => setOssOpen(false)} />
    </div>
  );
}