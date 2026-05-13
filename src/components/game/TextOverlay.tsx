import { useEffect, useState } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";
import { useDevMode } from "@/dev/devMode";
import {
  useEditActive,
} from "@/dev/dialogPatchState";
import {
  applyTextPatch,
  setTextLine,
  useTextPatchTick,
  clearTextPatch,
  getTextPatch,
} from "@/dev/textPatchState";

export function TextOverlay() {
  const { textOverlay, closeText } = useGame();
  const [idx, setIdx] = useState(0);
  const dev = useDevMode();
  const editActive = useEditActive();
  useTextPatchTick();
  const editing = dev && editActive;

  useEffect(() => {
    setIdx(0);
  }, [textOverlay]);

  useEffect(() => {
    if (!textOverlay) return;
    if (editing) return; // im Edit-Modus nicht automatisch weiterspringen
    const isLast = idx >= textOverlay.length - 1;
    const t = setTimeout(() => {
      if (isLast) closeText();
      else setIdx((i) => i + 1);
    }, 20000);
    return () => clearTimeout(t);
  }, [textOverlay, idx, closeText, editing]);

  if (!textOverlay) return null;
  const displayed = applyTextPatch(textOverlay);
  // idx wird per Effect zurückgesetzt, wenn sich `textOverlay` ändert —
  // beim ersten Render mit neuem Overlay kann idx aber noch zu groß sein.
  // Wir clampen, damit `current` nie undefined ist und die Edit-Textarea
  // nicht auf `undefined.length` crasht.
  const safeIdx = Math.min(idx, displayed.length - 1);
  const current = displayed[safeIdx] ?? "";
  const isLast = safeIdx >= displayed.length - 1;
  const patched = !!getTextPatch(textOverlay);

  const advance = () => {
    if (isLast) closeText();
    else setIdx((i) => i + 1);
  };

  return (
    <div
      className="absolute inset-0 z-40 flex cursor-pointer items-end justify-center bg-black/60 px-6 pb-24 text-left"
      onClick={editing ? undefined : advance}
      role="button"
      tabIndex={-1}
    >
      <div
        className="absolute right-4 top-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClick={closeText} label="Schließen" />
      </div>
      {editing ? (
        <div
          className="fade-in max-w-3xl w-full rounded-sm border border-amber-glow bg-background/95 px-6 py-5 text-left shadow-[0_0_40px_rgba(0,0,0,0.6)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-amber-glow">
            <span>showText · Edit</span>
            <span>
              {safeIdx + 1} / {displayed.length}
              {patched ? " · ✎" : ""}
            </span>
          </div>
          <textarea
            value={current}
            onChange={(e) => setTextLine(textOverlay, safeIdx, e.target.value)}
            rows={Math.max(3, Math.ceil(current.length / 60))}
            className="w-full resize-y rounded-sm border border-amber-glow/40 bg-black/60 p-2 font-mono-crt text-sm text-foreground"
          />
          <div className="mt-3 flex items-center justify-between gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
                className="rounded-sm border border-amber-glow/40 px-2 py-1 hover:bg-amber-glow/10 disabled:opacity-40"
              >
                ◂
              </button>
              <button
                type="button"
                onClick={() =>
                  setIdx((i) => Math.min(displayed.length - 1, i + 1))
                }
                disabled={isLast}
                className="rounded-sm border border-amber-glow/40 px-2 py-1 hover:bg-amber-glow/10 disabled:opacity-40"
              >
                ▸
              </button>
            </div>
            <div className="flex gap-2">
              {patched && (
                <button
                  type="button"
                  onClick={() => clearTextPatch(textOverlay)}
                  className="rounded-sm border border-red-500/40 px-2 py-1 text-red-300 hover:bg-red-500/10"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={advance}
                className="rounded-sm border border-amber-glow/60 px-3 py-1 text-amber-glow hover:bg-amber-glow/10"
              >
                {isLast ? "▣ Schließen" : "▸ Weiter"}
              </button>
            </div>
          </div>
        </div>
      ) : (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          advance();
        }}
        className="fade-in max-w-3xl cursor-pointer rounded-sm border border-amber-glow/40 bg-background/95 px-6 py-5 text-left shadow-[0_0_40px_rgba(0,0,0,0.6)]"
        aria-label="Weiter"
      >
        <p className="font-display text-lg leading-relaxed text-foreground text-shadow-hard sm:text-xl">
          {current}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
          <span>
            {safeIdx + 1} / {displayed.length}
          </span>
          <span className="amber-glow">{isLast ? "▣ Schließen" : "▸ Weiter"}</span>
        </div>
      </button>
      )}
    </div>
  );
}