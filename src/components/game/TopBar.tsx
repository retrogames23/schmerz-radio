import { useEffect, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useMusic } from "@/audio/MusicPlayer";
import { useSettings } from "@/audio/SettingsContext";
import { Radio, TerminalSquare, Menu, ChevronLeft, ChevronRight, Music2 } from "lucide-react";

interface Props {
  onOpenPause: () => void;
}

export function TopBar({ onOpenPause }: Props) {
  const game = useGame();
  const { scene, radioActive, flags } = game;
  const inAct2 = flags.has("enteredE71");
  const music = useMusic();
  const { musicEnabled } = useSettings();
  const currentTrack = music.tracks[music.currentIndex];

  // Kurze Einblendung beim Übergang: AKT I → AKT II.
  const [showActBanner, setShowActBanner] = useState(false);
  useEffect(() => {
    if (!inAct2) return;
    const seen = sessionStorage.getItem("act2-banner-seen");
    if (seen) return;
    sessionStorage.setItem("act2-banner-seen", "1");
    setShowActBanner(true);
    const t = setTimeout(() => setShowActBanner(false), 4500);
    return () => clearTimeout(t);
  }, [inAct2]);

  return (
    <>
    <header className="shrink-0 border-b border-border bg-background/95 px-4 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          <span className="font-mono-crt text-base text-amber-glow">
            104,6
          </span>
          <span className="hidden sm:inline">SCHMERZ-RADIO</span>
          <span className="text-muted-foreground/60">|</span>
          <span className="font-mono-crt text-amber-glow/90">
            {inAct2 ? "AKT II" : "AKT I"}
          </span>
          <span className="text-muted-foreground/60">|</span>
          <span className="text-foreground/80">{scene}</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`group hidden items-center gap-1 rounded-sm border px-1.5 py-1 text-[10px] uppercase tracking-[0.2em] transition-all duration-200 sm:inline-flex ${
              musicEnabled
                ? "border-amber-glow/30 bg-gradient-to-b from-amber-glow/10 to-transparent text-amber-glow/80 hover:border-amber-glow/60"
                : "border-border/60 bg-secondary/30 text-muted-foreground/60"
            }`}
            title="Musik-Track wechseln"
          >
            <button
              type="button"
              onClick={music.prev}
              className="rounded-sm p-0.5 transition-colors hover:text-amber-glow disabled:opacity-40"
              disabled={!musicEnabled}
              aria-label="Vorheriger Track"
            >
              <ChevronLeft className="h-3 w-3" strokeWidth={2.25} />
            </button>
            <Music2
              className={`h-3 w-3 ${musicEnabled ? "text-amber-glow/70" : ""}`}
              strokeWidth={2.25}
              aria-hidden
            />
            <span className="font-mono-crt min-w-[7rem] max-w-[10rem] truncate text-center text-[10px] tracking-[0.1em] normal-case">
              {currentTrack?.title ?? "—"}
            </span>
            <button
              type="button"
              onClick={music.next}
              className="rounded-sm p-0.5 transition-colors hover:text-amber-glow disabled:opacity-40"
              disabled={!musicEnabled}
              aria-label="Nächster Track"
            >
              <ChevronRight className="h-3 w-3" strokeWidth={2.25} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => game.api.openRadio()}
            title="Schmerz-Radio öffnen (R)"
            className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-sm border px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition-all duration-200 ${
              radioActive
                ? "border-amber-glow bg-amber-glow/15 text-amber-glow shadow-[0_0_14px_rgba(255,170,60,0.35)]"
                : "border-amber-glow/30 bg-gradient-to-b from-amber-glow/10 to-transparent text-amber-glow/85 hover:-translate-y-px hover:border-amber-glow/70 hover:text-amber-glow hover:shadow-[0_0_12px_rgba(255,170,60,0.25)]"
            }`}
          >
            <Radio
              className={`h-3.5 w-3.5 ${radioActive ? "animate-pulse" : ""}`}
              strokeWidth={2.25}
            />
            <span className="font-display">Radio</span>
            {radioActive && (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-glow shadow-[0_0_6px_rgba(255,170,60,0.9)]"
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => game.api.openTerminal()}
            title="CentralOS Terminal"
            className="group inline-flex items-center gap-2 rounded-sm border border-phosphor/30 bg-gradient-to-b from-phosphor/10 to-transparent px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-phosphor/85 transition-all duration-200 hover:-translate-y-px hover:border-phosphor/70 hover:text-phosphor hover:shadow-[0_0_12px_rgba(80,255,140,0.22)]"
          >
            <TerminalSquare className="h-3.5 w-3.5" strokeWidth={2.25} />
            <span className="font-display">Terminal</span>
          </button>
          <button
            type="button"
            onClick={onOpenPause}
            title="Menü (ESC)"
            className="group inline-flex items-center gap-2 rounded-sm border border-border bg-secondary/40 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-foreground/85 transition-all duration-200 hover:-translate-y-px hover:border-amber-glow/60 hover:text-amber-glow"
          >
            <Menu className="h-3.5 w-3.5" strokeWidth={2.25} />
            <span className="font-display">Menü</span>
          </button>
        </div>
      </div>
    </header>
    {showActBanner && (
      <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
        <div className="fade-in rounded-sm border border-amber-glow/60 bg-background/90 px-10 py-6 text-center shadow-[0_0_60px_rgba(0,0,0,0.85)]">
          <div className="font-mono-crt text-xs uppercase tracking-[0.5em] text-muted-foreground">
            Akt II
          </div>
          <div className="mt-2 font-display text-3xl uppercase tracking-[0.3em] text-amber-glow amber-glow">
            Die Außenwelt
          </div>
          <div className="mt-2 font-mono-crt text-xs uppercase tracking-[0.3em] text-muted-foreground">
            E67 verlassen
          </div>
        </div>
      </div>
    )}
    </>
  );
}