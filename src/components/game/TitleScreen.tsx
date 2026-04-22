interface Props {
  onStart: () => void;
}

export function TitleScreen({ onStart }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bureaucracy px-6 text-center">
      <div className="scanlines absolute inset-0 opacity-60" />
      <div className="amber-vignette opacity-30" />

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
          Ein 2D Point &amp; Click-Adventure über bürokratische Erstarrung,
          erzwungene Pflicht und das heimliche Begehren nach echtem Erleben.
        </p>

        <button
          type="button"
          onClick={onStart}
          className="mt-10 rounded-sm border border-amber-glow/60 bg-background/40 px-8 py-3 font-display text-base uppercase tracking-[0.4em] text-amber-glow transition hover:bg-amber-glow/10 amber-glow"
        >
          ▸ Spiel beginnen
        </button>

        <div className="mt-12 space-y-1 font-mono-crt text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <div>Layard Worag · Zimmer 2611 · B2-Ration</div>
          <div>CentralOS v2.3 · E67.NETZ stabil</div>
        </div>
      </div>
    </div>
  );
}