import { useGame } from "@/game/GameContext";
import {
  KANTINENVERORDNUNG_PREFACE,
  KANTINENVERORDNUNG_SECTIONS,
  KANTINENVERORDNUNG_SUBTITLE,
  KANTINENVERORDNUNG_TITLE,
} from "@/game/kantinenverordnung";
import { CloseButton } from "./CloseButton";

/**
 * Kantinenverordnung — statisches Lese-Overlay.
 *
 * Listet die alten Kantinen-Paragraphen aus der ursprünglichen
 * Duell-Mechanik. Reine Lektüre, keine Spielmechanik.
 */
export function KantinenverordnungOverlay() {
  const { kantinenverordnungOpen, closeKantinenverordnung } = useGame();

  if (!kantinenverordnungOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-3 py-4"
      role="dialog"
      aria-label={KANTINENVERORDNUNG_TITLE}
    >
      <div className="relative w-full max-w-2xl rounded-sm border-2 border-amber-glow/60 bg-[#1f1505] p-5 text-amber-glow shadow-[0_20px_80px_rgba(0,0,0,0.7)]">
        <CloseButton
          onClick={closeKantinenverordnung}
          tone="amber"
          label="Verordnung schließen"
          className="absolute right-2 top-2"
        />
        <div className="font-display text-xs uppercase tracking-[0.3em] text-amber-glow/70">
          {KANTINENVERORDNUNG_TITLE}
        </div>
        <p className="mt-2 font-mono-crt text-xs leading-relaxed text-amber-glow/80">
          {KANTINENVERORDNUNG_SUBTITLE}
        </p>
        <p className="mt-1 font-mono-crt text-[11px] italic leading-relaxed text-amber-glow/60">
          {KANTINENVERORDNUNG_PREFACE}
        </p>

        <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {KANTINENVERORDNUNG_SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="font-display text-sm uppercase tracking-wider text-amber-glow">
                {section.title}
              </h3>
              {section.intro && (
                <p className="mt-1 font-mono-crt text-[12px] italic text-amber-glow/60">
                  {section.intro}
                </p>
              )}
              <div className="mt-2 space-y-2">
                {section.entries.map((p) => (
                  <div
                    key={p.shortLabel}
                    className="rounded-sm border border-amber-glow/30 bg-black/30 px-3 py-2 font-mono-crt text-[12px] leading-relaxed"
                  >
                    <div className="font-display text-[13px] uppercase tracking-wider text-amber-glow">
                      {p.shortLabel}
                    </div>
                    <div className="mt-1 text-amber-glow/85">{p.fullText}</div>
                    {p.marginNote && (
                      <div className="mt-1 italic text-amber-glow/55">
                        Randnotiz: {p.marginNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}