import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import titleTrack from "@/assets/almost-freedom.mp3";
import { ImpressumOverlay } from "./ImpressumOverlay";
import { OpenSourceOverlay } from "./OpenSourceOverlay";
import { DonationModal } from "@/components/donation/DonationModal";
import titleArtwork from "@/assets/title/whisper-quest-v1.jpg";
import { RainOverlay } from "./RainOverlay";

const PRE_ALPHA_WARNING_UI_TEXT = {
  title: "Pre-Alpha-Warnung",
  body:
    "Schmerz-Radio ist ein Hobby-Projekt im pre-Alpha-Stadium. Das Spiel wird aktiv entwickelt und kann sich jederzeit ändern. Rätsel können kaputt sein und das Spiel unspielbar. Speicherstände gehen regelmäßig kaputt.",
  acknowledge: "Verstanden — trotzdem starten",
  cancel: "Abbrechen",
} as const;

interface Props {
  onStart: () => void;
}

export function TitleScreen({ onStart }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const [musicOn, setMusicOn] = useState(true);
  const [impressumOpen, setImpressumOpen] = useState(false);
  const [ossOpen, setOssOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);

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

  // Hinweis: Das lokale WebLLM-Modell wird NICHT mehr vom Titelbildschirm
  // vorgeladen. Stattdessen startet das Vorladen erst, wenn der Spieler
  // erstmals die Cloud-Soft-Limit-Spendenaufforderung sieht (siehe
  // DonationGate). Spieler, die nie an dieses Limit kommen, müssen die
  // GB-große Modelldatei nie herunterladen.

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

  const handleStartRequest = () => {
    setWarningOpen(true);
  };

  const handleConfirmStart = () => {
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
    setWarningOpen(false);
    onStart();
  };

  return (
    <div className="relative flex h-screen min-h-screen flex-col items-center overflow-hidden bg-black px-6 text-center">
      {/* Painted key art as the backdrop. */}
      <img
        src={titleArtwork}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1280}
      />
      {/* Animated rain on top of the painted artwork. */}
      <RainOverlay />
      {/* Vignette + darken so foreground text stays readable on top of the art. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-25" />
      <div className="amber-vignette pointer-events-none opacity-25" />

      <button
        type="button"
        onClick={toggleMusic}
        aria-label={musicOn ? "Musik ausschalten" : "Musik einschalten"}
        className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-sm border border-amber-glow/50 bg-background/70 px-3 py-2 font-mono-crt text-xs uppercase tracking-widest text-amber-glow transition hover:bg-amber-glow/15"
      >
        {musicOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        <span>{musicOn ? "Musik AN" : "Musik AUS"}</span>
      </button>

      {/* Title + tagline pinned in the upper third (where the artwork has sky). */}
      <div className="relative z-10 mt-[8vh] max-w-3xl">
        <p className="font-mono-crt text-xs uppercase tracking-[0.5em] text-amber-glow/70">
          Quadrant E67 · Akt I
        </p>

        <h1 className="mt-4 font-display uppercase tracking-[0.18em] text-foreground text-shadow-hard text-4xl sm:text-6xl md:text-7xl lg:text-8xl">
          WHISPER
          <span className="mx-3 amber-glow text-amber-glow">·</span>
          QUEST
        </h1>

        <div className="mt-3 font-mono-crt text-xl text-amber-glow amber-glow sm:text-2xl">
          Schmerz-Radio auf 104,6
        </div>

        <p className="mx-auto mt-6 max-w-xl font-display text-base italic leading-relaxed text-foreground/85 sm:text-lg font-semibold">
          Ein klassisches Cozypunk-Point-&amp;-Click-Adventure
        </p>

        <button
          type="button"
          onClick={handleStartRequest}
          className="mt-8 rounded-sm border border-amber-glow/70 bg-background/50 px-8 py-3 font-display text-base uppercase tracking-[0.4em] text-amber-glow backdrop-blur-sm transition hover:bg-amber-glow/15 amber-glow"
        >
          ▸ Spiel beginnen
        </button>
      </div>

      {/* Spacer pushes the footer to the bottom. */}
      <div className="flex-1" />

      {/* Compact two-row footer with all secondary links. */}
      <div className="relative z-10 mb-6 w-full max-w-4xl">
        <div className="rounded-sm border border-amber-glow/25 bg-background/65 px-5 py-3 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono-crt text-sm uppercase tracking-[0.22em] text-amber-glow/85">
            <button
              type="button"
              onClick={() => setDonationOpen(true)}
              className="transition hover:text-amber-glow"
            >
              ☕ Buy me a coffee
            </button>
            <span aria-hidden="true" className="text-amber-glow/40">·</span>
            <a
              href="https://lovable.dev/invite/LN0I260"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-amber-glow"
            >
              <span className="text-base leading-none">♥</span>
              <span>Built with Lovable</span>
            </a>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono-crt text-sm uppercase tracking-[0.22em] text-muted-foreground">
            <button
              type="button"
              onClick={() => setImpressumOpen(true)}
              className="transition hover:text-amber-glow"
            >
              Impressum
            </button>
            <span aria-hidden="true" className="text-muted-foreground/50">·</span>
            <a
              href="mailto:stephan.doerner@posteo.de"
              className="transition hover:text-amber-glow"
            >
              Kontakt: stephan.doerner@posteo.de
            </a>
            <span aria-hidden="true" className="text-muted-foreground/50">·</span>
            <button
              type="button"
              onClick={() => setOssOpen(true)}
              className="transition hover:text-amber-glow"
            >
              Freie-Software-Komponenten &amp; Lizenzen
            </button>
          </div>
        </div>
      </div>

      <ImpressumOverlay open={impressumOpen} onClose={() => setImpressumOpen(false)} />
      <OpenSourceOverlay open={ossOpen} onClose={() => setOssOpen(false)} />
      <DonationModal
        open={donationOpen}
        onClose={() => setDonationOpen(false)}
        variant="manual"
      />

      {warningOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pre-alpha-warning-title"
        >
          <div className="scanlines pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative w-full max-w-lg rounded-sm border border-amber-glow/60 bg-background/95 p-6 text-left shadow-[0_0_40px_rgba(255,170,60,0.25)]">
            <h2
              id="pre-alpha-warning-title"
              className="font-display text-xl uppercase tracking-[0.25em] text-amber-glow amber-glow"
            >
              {PRE_ALPHA_WARNING_UI_TEXT.title}
            </h2>
            <p className="mt-4 font-mono-crt text-sm leading-relaxed text-foreground">
              {PRE_ALPHA_WARNING_UI_TEXT.body}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setWarningOpen(false)}
                className="rounded-sm border border-muted-foreground/40 bg-transparent px-4 py-2 font-mono-crt text-xs uppercase tracking-[0.3em] text-muted-foreground transition hover:border-muted-foreground hover:text-foreground"
              >
                {PRE_ALPHA_WARNING_UI_TEXT.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmStart}
                autoFocus
                className="rounded-sm border border-amber-glow/70 bg-amber-glow/10 px-4 py-2 font-mono-crt text-xs uppercase tracking-[0.3em] text-amber-glow transition hover:bg-amber-glow/20 amber-glow"
              >
                {PRE_ALPHA_WARNING_UI_TEXT.acknowledge}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}