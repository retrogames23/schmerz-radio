import { useGame } from "@/game/GameContext";

interface Props {
  onOpenPause: () => void;
}

export function TopBar({ onOpenPause }: Props) {
  const game = useGame();
  const { scene, inventory, radioActive } = game;

  return (
    <header className="shrink-0 border-b border-border bg-background/95 px-4 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          <span className="font-mono-crt text-base text-amber-glow">
            104,6
          </span>
          <span className="hidden sm:inline">SCHMERZ-RADIO</span>
          <span className="text-muted-foreground/60">|</span>
          <span className="text-foreground/80">{scene}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => game.api.openRadio()}
            className={`rounded-sm border px-3 py-1 text-xs uppercase tracking-widest transition ${
              radioActive
                ? "border-amber-glow text-amber-glow amber-glow"
                : "border-border text-foreground hover:border-amber-glow/60 hover:text-amber-glow"
            }`}
            title="Schmerz-Radio öffnen (R)"
          >
            ◉ Radio
          </button>
          <button
            type="button"
            onClick={() => game.api.openTerminal()}
            className="rounded-sm border border-border px-3 py-1 text-xs uppercase tracking-widest text-phosphor transition hover:border-phosphor/60"
            title="CentralOS Terminal"
          >
            ▣ Terminal
          </button>
          <button
            type="button"
            onClick={onOpenPause}
            className="rounded-sm border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground transition hover:border-amber-glow/60 hover:text-amber-glow"
            title="Menü (ESC)"
          >
            ☰ Menü
          </button>
          <div className="ml-2 flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-xs">
            <span className="text-muted-foreground">Inv:</span>
            <span className="font-mono-crt text-foreground">
              {inventory.length}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}