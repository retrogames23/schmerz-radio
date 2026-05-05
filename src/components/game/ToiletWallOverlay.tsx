import { useState } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";
import { useToiletWall } from "@/multiplayer/useToiletWall";
import { ensureAuthSession, getDisplayName, getShiftNumber } from "@/multiplayer/identity";

const COLORS = ["#0a0a0a", "#1a3a8f", "#8a1a1a", "#1f4f1f", "#4a2a7a"];
const FONTS = ["font-graffiti-1", "font-graffiti-2", "font-graffiti-3"];

export function ToiletWallOverlay() {
  const game = useGame();
  const active = game.scene === "pubToilet";
  const wall = useToiletWall(active);
  const [input, setInput] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!active) return null;

  async function onWrite() {
    setBusy(true);
    try {
      const auth = await ensureAuthSession();
      if (!auth) { setErr("Konnte keine Session anlegen."); return; }
      const shift = getShiftNumber();
      const name = getDisplayName({
        user: { email: auth.email, is_anonymous: auth.isAnonymous },
        shiftNumber: shift,
      });
      const r = await wall.write({
        userId: auth.userId,
        displayName: name,
        isAnonymous: auth.isAnonymous,
        text: input,
      });
      if (r.ok) { setInput(""); setErr(null); }
      else setErr(r.error ?? "Fehler.");
    } finally { setBusy(false); }
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col">
      <div className="absolute right-2 top-2 z-10">
        <CloseButton onClick={() => game.api.goTo("pub")} label="Zurück" />
      </div>
      {/* Wand mit Graffiti */}
      <div className="relative flex-1 overflow-hidden">
        {wall.graffiti.map((g) => (
          <div
            key={g.id}
            className={`absolute max-w-[30%] leading-none ${FONTS[g.id.charCodeAt(0) % FONTS.length]}`}
            style={{
              left: `${g.x}%`, top: `${g.y}%`,
              transform: `translate(-50%, -50%) rotate(${g.rotation}deg)`,
              fontSize: `${1.1 + ((g.id.charCodeAt(1) || 0) % 8) * 0.18}rem`,
              color: COLORS[g.colorIndex] ?? COLORS[0],
              textShadow: "0 1px 0 rgba(0,0,0,0.5), 0 0 4px rgba(0,0,0,0.4)",
              filter: "url(#) drop-shadow(0 1px 0 rgba(0,0,0,0.4))",
              mixBlendMode: "multiply",
              opacity: g.isAnonymous ? 0.85 : 1,
            }}
            title={`${g.displayName}${g.isAnonymous ? " · verblasst nach 24h" : ""}`}
          >
            {g.text}
          </div>
        ))}
      </div>
      {/* Eingabe */}
      <div className="border-t border-amber-glow/30 bg-background/95 p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onWrite(); }}
            maxLength={140}
            placeholder="Etwas an die Wand kritzeln (max 140) …"
            className="flex-1 rounded-sm border border-border bg-background/80 px-2 py-1 font-display text-sm text-foreground"
          />
          <button
            onClick={onWrite}
            disabled={busy || !input.trim()}
            className="rounded-sm border border-amber-glow/50 bg-amber-glow/10 px-3 py-1 font-mono-crt text-xs uppercase tracking-widest text-amber-glow disabled:opacity-40"
          >
            Kritzeln
          </button>
        </div>
        <p className="mt-1 font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground">
          Ohne Account verblasst deine Kritzelei nach 24 h.
        </p>
        {err && <p className="mt-1 font-mono-crt text-xs text-rust">{err}</p>}
      </div>
    </div>
  );
}