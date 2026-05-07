import { useState } from "react";
import { useGame } from "@/game/GameContext";
import { useToiletWall } from "@/multiplayer/useToiletWall";
import { ArrowLeft } from "lucide-react";
import { ensureAuthSession, getDisplayName, getShiftNumber } from "@/multiplayer/identity";
import { useDonationStatus } from "@/hooks/useDonationStatus";

// Helle Spraydosen-Farben, durchwechselnd: rot, grün, blau, gelb, weiß, magenta, orange
const COLORS = ["#e63946", "#3ddc84", "#3a86ff", "#ffd60a", "#f5f5f5", "#ff5fb0", "#ff7a1a"];
const FONTS = ["font-graffiti-1", "font-graffiti-2", "font-graffiti-3"];

export function ToiletWallOverlay() {
  const game = useGame();
  const active = game.scene === "pubToilet";
  const wall = useToiletWall(active);
  const donation = useDonationStatus();
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
      // Nur Spender (donation_unlocked) → permanent. Alle anderen → 48h.
      const ephemeral = !donation.unlocked;
      const r = await wall.write({
        userId: auth.userId,
        displayName: name,
        isAnonymous: ephemeral,
        text: input,
      });
      if (r.ok) { setInput(""); setErr(null); }
      else setErr(r.error ?? "Fehler.");
    } finally { setBusy(false); }
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col">
      <button
        type="button"
        onClick={() => game.api.goTo("pub")}
        aria-label="Zurück zur Kneipe"
        className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-sm border border-amber-glow/50 bg-background/85 px-3 py-2 font-mono-crt text-xs uppercase tracking-widest text-amber-glow shadow-lg hover:bg-amber-glow/15"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
        Zurück zur Kneipe
      </button>
      {/* Wand mit Graffiti */}
      <div className="relative flex-1 overflow-hidden">
        {/* Klickfläche für den auf die Wand gemalten Kondomautomaten
            (links neben der Wand, oberhalb des Spiegels). Öffnet das
            Automaten-Overlay. */}
        <button
          type="button"
          onClick={() => game.api.openCondomAutomat()}
          aria-label="Kondomautomat"
          title="Kondomautomat"
          className="absolute z-[1] cursor-pointer"
          style={{ left: "24%", top: "14%", width: "14%", height: "40%" }}
        />
        {wall.graffiti.map((g) => (
          <div
            key={g.id}
            className={`absolute max-w-[22%] leading-none ${FONTS[g.id.charCodeAt(0) % FONTS.length]}`}
            style={{
              left: `${g.x}%`, top: `${g.y}%`,
              transform: `translate(-50%, -50%) rotate(${g.rotation}deg)`,
              fontSize: `${0.7 + ((g.id.charCodeAt(1) || 0) % 6) * 0.1}rem`,
              color: COLORS[g.colorIndex % COLORS.length] ?? COLORS[0],
              textShadow:
                "0 0 1px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.6), 0 0 6px rgba(0,0,0,0.35)",
              mixBlendMode: "screen",
              opacity: g.isAnonymous ? 0.9 : 1,
            }}
            title={`${g.displayName}${g.isAnonymous ? " · verblasst nach 48 h" : ""}`}
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
          {donation.unlocked
            ? "Spender-Code aktiv – deine Kritzelei bleibt für immer."
            : "Deine Kritzelei verblasst nach 48 h. Mit Spender-Code bleibt sie für immer."}
        </p>
        {err && <p className="mt-1 font-mono-crt text-xs text-rust">{err}</p>}
      </div>
    </div>
  );
}