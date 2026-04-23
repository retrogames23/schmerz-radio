import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import titleTrack from "@/assets/almost-freedom.mp3";

interface Props {
  onStart: () => void;
}

export function TitleScreen({ onStart }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const [musicOn, setMusicOn] = useState(true);

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bureaucracy px-6 text-center">
      <div className="scanlines absolute inset-0 opacity-60" />
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
      </div>
    </div>
  );
}