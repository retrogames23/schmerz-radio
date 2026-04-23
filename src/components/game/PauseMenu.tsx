import { useEffect, useState } from "react";
import { useGame, type SaveSummary } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import { stopSpeech } from "@/audio/speech";
import { useAuth } from "@/auth/AuthContext";
import { AuthDialog } from "@/auth/AuthDialog";
import { CloseButton } from "./CloseButton";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SCENE_LABEL: Record<string, string> = {
  apartment: "Wohnung 2611",
  hallway: "Korridor 26",
  apt2612: "Wohnung 2612 — Bodo",
  apt2613: "Wohnung 2613 — Philippe",
  apt2615: "Wohnung 2615",
  sectorDoor: "Sektor-Tür E67/E71",
  elevator: "Aufzug — E67",
  floor1Lobby: "Lobby Etage 1 — E67",
  passage: "Verbindungsgang E67↔E71",
  e71Lobby: "Sektor E71 — Empfang",
  corridor15: "Korridor 15 — E71",
  room1534: "Zimmer 1534",
  corridor36: "Korridor 36 — E67",
  corridor46: "Korridor 46 — E67",
  corridor56: "Korridor 56 — E67",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function PauseMenu({ open, onClose }: Props) {
  const { saveGame, loadGame, listSaves, deleteSave } = useGame();
  const settings = useSettings();
  const { user, signOut } = useAuth();
  const [slots, setSlots] = useState<Array<SaveSummary | null>>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [busySlot, setBusySlot] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listSaves().then((s) => {
      if (!cancelled) setSlots(s);
    });
    return () => {
      cancelled = true;
    };
  }, [open, listSaves, user]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const flash = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 1800);
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/85 px-4">
      <div className="fade-in relative w-full max-w-2xl rounded-sm border border-amber-glow/50 bg-background p-6 shadow-[0_0_60px_rgba(0,0,0,0.85)]">
        <CloseButton
          onClick={onClose}
          label="Fortsetzen"
          className="absolute right-3 top-3"
        />
        <div className="mb-5 flex items-center justify-between pr-10">
          <h2 className="font-display text-xl uppercase tracking-[0.3em] text-amber-glow amber-glow">
            Pause
          </h2>
        </div>

        {/* Toggles */}
        <section className="mb-6 space-y-3 border border-border bg-black/40 p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Audio
          </div>

          <ToggleRow
            label="Hintergrundmusik"
            checked={settings.musicEnabled}
            onChange={settings.toggleMusic}
          />
          <SliderRow
            label="Musik-Lautstärke"
            value={settings.musicVolume}
            disabled={!settings.musicEnabled}
            onChange={(v) => settings.set({ musicVolume: v })}
          />

          <ToggleRow
            label="Vertonte Dialoge"
            checked={settings.ttsEnabled}
            onChange={() => {
              settings.toggleTts();
              if (settings.ttsEnabled) stopSpeech();
            }}
          />

          <SliderRow
            label="Sound-Effekte"
            value={settings.sfxVolume}
            onChange={(v) => settings.set({ sfxVolume: v })}
          />
        </section>

        {/* Save slots */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Spielstände
            </div>
            {user ? (
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="truncate max-w-[180px]">{user.email}</span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-sm border border-border px-2 py-1 hover:border-destructive hover:text-destructive"
                >
                  Abmelden
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="rounded-sm border border-amber-glow/60 px-2 py-1 text-[10px] uppercase tracking-widest text-amber-glow hover:bg-amber-glow/10"
              >
                Anmelden
              </button>
            )}
          </div>

          {!user && (
            <p className="rounded-sm border border-amber-glow/30 bg-amber-glow/5 p-3 text-xs italic text-muted-foreground">
              Zum Speichern und Laden bitte mit E-Mail oder Google anmelden.
              Spielstände werden sicher in der Cloud gespeichert.
            </p>
          )}

          {slots.map((slot, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 border border-border bg-black/30 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="font-mono-crt text-xs uppercase tracking-widest text-amber-glow">
                  Slot {i + 1}
                </div>
                {slot ? (
                  <div className="mt-1 truncate text-sm text-foreground">
                    {SCENE_LABEL[slot.scene] ?? slot.scene}{" "}
                    <span className="text-muted-foreground">
                      · {slot.inventoryCount} Items · {formatDate(slot.savedAt)}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 text-sm italic text-muted-foreground">
                    — leer —
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={!user || busySlot === i}
                  onClick={async () => {
                    if (!user) {
                      setAuthOpen(true);
                      return;
                    }
                    setBusySlot(i);
                    try {
                      await saveGame(i);
                      setSlots(await listSaves());
                      flash(`Slot ${i + 1} gespeichert.`);
                    } catch (e) {
                      flash(
                        e instanceof Error
                          ? e.message
                          : "Speichern fehlgeschlagen.",
                      );
                    } finally {
                      setBusySlot(null);
                    }
                  }}
                  className="rounded-sm border border-amber-glow/50 px-3 py-1 text-xs uppercase tracking-widest text-amber-glow transition hover:bg-amber-glow/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Speichern
                </button>
                <button
                  type="button"
                  disabled={!slot || busySlot === i}
                  onClick={async () => {
                    setBusySlot(i);
                    try {
                      const ok = await loadGame(i);
                      if (ok) {
                        flash(`Slot ${i + 1} geladen.`);
                        onClose();
                      } else {
                        flash("Laden fehlgeschlagen.");
                      }
                    } finally {
                      setBusySlot(null);
                    }
                  }}
                  className="rounded-sm border border-phosphor/50 px-3 py-1 text-xs uppercase tracking-widest text-phosphor transition hover:bg-phosphor/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Laden
                </button>
                <button
                  type="button"
                  disabled={!slot || busySlot === i}
                  onClick={async () => {
                    setBusySlot(i);
                    try {
                      await deleteSave(i);
                      setSlots(await listSaves());
                      flash(`Slot ${i + 1} gelöscht.`);
                    } finally {
                      setBusySlot(null);
                    }
                  }}
                  className="rounded-sm border border-border px-2 py-1 text-xs uppercase tracking-widest text-muted-foreground transition hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </section>

        {notice && (
          <div className="mt-4 text-center text-xs uppercase tracking-widest text-amber-glow amber-glow">
            {notice}
          </div>
        )}

        <p className="mt-5 text-center text-xs italic text-muted-foreground">
          ESC schließt das Menü.
        </p>
      </div>
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`relative h-6 w-12 rounded-full border transition ${
          checked
            ? "border-amber-glow bg-amber-glow/30"
            : "border-border bg-black/40"
        }`}
      >
        <span
          className={`absolute top-[2px] h-[18px] w-[18px] rounded-full transition-all ${
            checked
              ? "left-[26px] bg-amber-glow"
              : "left-[2px] bg-muted-foreground"
          }`}
        />
      </button>
    </label>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${disabled ? "opacity-40" : ""}`}>
      <span className="w-40 text-sm text-muted-foreground">{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-amber-glow"
      />
      <span className="w-10 text-right font-mono-crt text-xs text-amber-glow">
        {Math.round(value * 100)}
      </span>
    </div>
  );
}