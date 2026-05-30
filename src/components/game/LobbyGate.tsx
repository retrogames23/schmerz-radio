import { useEffect, useState } from "react";
import { Delete, Check } from "lucide-react";
import { useGame } from "@/game/GameContext";
import { useInventoryDrag } from "@/game/InventoryDragContext";
import { useSettings } from "@/audio/SettingsContext";
import { playBeep, playKeypress, playUnlock } from "@/audio/sfx";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { CloseButton } from "./CloseButton";
import { ItemIcon } from "./ItemIcon";

/**
 * Lobby-Schleuse (Tagesmodus). Steht zwischen Aufzug und dem Rest der
 * Etage 1. Layard muss seinen Bewohner-Ausweis in den Schlitz legen
 * UND den 4-stelligen Bewohner-Code (siehe §2 Abs. 7) eintippen.
 *
 * Drei Fehlversuche → Insa ruft selbst auf der Schleuse an
 * (Dialog `insaLobbyEscalation`) und entriegelt die Tür für heute.
 */
const LOBBY_CODE = "2611";
const LOBBY_LEN = 4;

type Status = "idle" | "ok" | "err";

export function LobbyGate() {
  const {
    lobbyGateOpen,
    closeLobbyGate,
    api,
    flags,
    bumpLobbyGateAttempts,
    resetLobbyGateAttempts,
  } = useGame();
  const drag = useInventoryDrag();
  const isCoarse = useCoarsePointer();
  const { sfxVolume } = useSettings();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [cardSlotted, setCardSlotted] = useState(false);
  const [escalated, setEscalated] = useState(false);

  // Reset bei jedem Öffnen.
  useEffect(() => {
    if (!lobbyGateOpen) return;
    setCode("");
    setStatus("idle");
    setCardSlotted(false);
    setEscalated(false);
  }, [lobbyGateOpen]);

  // Bereits offen für heute? Dann gar nicht erst zeigen.
  useEffect(() => {
    if (lobbyGateOpen && flags.has("lobbyClearedDay")) {
      closeLobbyGate();
    }
  }, [lobbyGateOpen, flags, closeLobbyGate]);

  // Tastatur-Eingabe.
  useEffect(() => {
    if (!lobbyGateOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLobbyGate();
        // Layard tritt zurück in den Aufzug — er kann es nicht überspringen,
        // beim nächsten Lobby-Eintritt geht das Overlay erneut auf.
        api.goTo("elevator");
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        pressDigit(e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyGateOpen, code, status, cardSlotted]);

  function pressDigit(d: string) {
    if (code.length >= LOBBY_LEN) return;
    if (status === "err") setStatus("idle");
    playKeypress(0.4 * sfxVolume);
    setCode((c) => c + d);
  }

  function backspace() {
    if (!code.length) return;
    playKeypress(0.3 * sfxVolume);
    if (status === "err") setStatus("idle");
    setCode((c) => c.slice(0, -1));
  }

  function unlockNormal() {
    playUnlock(0.7 * sfxVolume);
    setStatus("ok");
    api.setFlag("lobbyClearedDay");
    resetLobbyGateAttempts();
    setTimeout(() => {
      closeLobbyGate();
    }, 1100);
  }

  function escalate() {
    setEscalated(true);
    api.setFlag("insaLobbyEscalated");
    api.setFlag("lobbyClearedDay");
    resetLobbyGateAttempts();
    // Dialog-Trigger: kurz Pause, dann Insa am Apparat.
    setTimeout(() => {
      closeLobbyGate();
      api.startDialog("insaLobbyEscalation");
    }, 900);
  }

  function submit() {
    if (!cardSlotted) {
      playBeep(0.4 * sfxVolume);
      setStatus("err");
      return;
    }
    if (code.length !== LOBBY_LEN) {
      playBeep(0.4 * sfxVolume);
      setStatus("err");
      return;
    }
    if (code === LOBBY_CODE) {
      unlockNormal();
    } else {
      playBeep(0.5 * sfxVolume);
      setStatus("err");
      const attempts = bumpLobbyGateAttempts();
      if (attempts >= 3) {
        escalate();
      } else {
        setTimeout(() => {
          setCode("");
          setStatus("idle");
        }, 900);
      }
    }
  }

  function rejectSlotItem() {
    api.showText([
      "Der Schlitz nimmt die Karte nicht an. Falsches Format.",
      "Auf einem winzigen Aufkleber: »Nur E67-Bewohner-Ausweise«.",
    ]);
  }

  function insertResidentId() {
    if (cardSlotted) return;
    playKeypress(0.5 * sfxVolume);
    setCardSlotted(true);
    setStatus("idle");
  }

  function applyItemToSlot(itemId: string) {
    if (itemId !== "residentId") {
      rejectSlotItem();
      return;
    }
    insertResidentId();
  }

  // Drop-Handler für den Karten-Slot.
  function onSlotPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.dragItem) return;
    e.preventDefault();
    e.stopPropagation();
    const dropped = drag.endDrag();
    if (!dropped) return;
    applyItemToSlot(dropped.id);
  }

  function onSlotClick() {
    if (!isCoarse || cardSlotted) return;
    if (drag.selectedItem) {
      const selected = drag.consumeActive();
      if (selected) applyItemToSlot(selected.id);
      return;
    }
    if (api.hasItem("residentId")) {
      insertResidentId();
      return;
    }
    api.showText([
      "Der Schlitz wartet auf einen E67-Bewohner-Ausweis.",
      "Layard tastet seine Taschen ab. Da ist keiner.",
    ]);
  }

  function ejectCard() {
    if (!cardSlotted) return;
    playKeypress(0.3 * sfxVolume);
    setCardSlotted(false);
  }

  if (!lobbyGateOpen) return null;

  const displaySlots = Array.from({ length: LOBBY_LEN }, (_, i) => code[i] ?? "");

  const ledClass =
    status === "ok"
      ? "bg-phosphor shadow-[0_0_12px_rgba(120,255,160,0.9)]"
      : status === "err"
        ? "bg-destructive shadow-[0_0_12px_rgba(255,80,80,0.9)] animate-pulse"
        : cardSlotted
          ? "bg-amber-glow shadow-[0_0_8px_rgba(240,180,80,0.7)]"
          : "bg-amber-glow/30";

  const screenText = escalated
    ? "VERBINDE MIT LEITSTELLE …"
    : status === "ok"
      ? "WILLKOMMEN, BEWOHNER 2611"
      : status === "err"
        ? cardSlotted
          ? "CODE UNGÜLTIG"
          : "BITTE AUSWEIS EINFÜHREN"
        : cardSlotted
          ? "BEWOHNER-CODE EINGEBEN"
          : "AUSWEIS EINFÜHREN";

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/85 backdrop-blur-sm"
      onClick={(e) => {
        // Klick außerhalb schließt nur, wenn nicht gerade ein Drag läuft.
        if (drag.dragItem) return;
        e.stopPropagation();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(440px,94vw)] rounded-md border-2 border-amber-glow/50 bg-zinc-950 p-5 shadow-[0_0_50px_rgba(240,180,80,0.25)]"
      >
        <CloseButton
          onClick={() => {
            closeLobbyGate();
            api.goTo("elevator");
          }}
          tone="amber"
          label="Zurück in den Aufzug"
          className="absolute right-2 top-2"
        />

        {/* Kopfzeile */}
        <div className="mb-3 flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full transition-all ${ledClass}`} />
          <span className="font-mono-crt text-[0.65rem] uppercase tracking-[0.3em] text-amber-glow/80">
            Lobby-Schleuse · E67 · Tagesmodus
          </span>
        </div>

        {/* Display */}
        <div className="mb-4 rounded-sm border border-amber-glow/30 bg-black p-3">
          <div className="font-mono-crt text-[0.9rem] uppercase tracking-[0.3em] text-phosphor/70">
            {screenText}
          </div>
          <div className="mt-2 font-mono-crt text-[0.8rem] uppercase tracking-[0.25em] text-amber-glow/55">
            Identifikation über Wohnnummereinheit
          </div>
          <div className="mt-2 flex justify-between gap-2">
            {displaySlots.map((d, i) => (
              <div
                key={i}
                className={`flex h-10 w-10 items-center justify-center rounded-sm border font-mono-crt text-xl ${
                  d
                    ? "border-amber-glow/70 bg-amber-glow/10 text-amber-glow phosphor-glow"
                    : "border-amber-glow/20 text-amber-glow/30"
                }`}
              >
                {d || "·"}
              </div>
            ))}
          </div>
        </div>

        {/* Karten-Slot */}
        <div
          onPointerUp={onSlotPointerUp}
          onClick={onSlotClick}
          className={`mb-4 flex items-center gap-3 rounded-sm border-2 border-dashed p-3 transition ${
            cardSlotted
              ? "border-phosphor/60 bg-phosphor/5"
              : drag.dragItem?.id === "residentId"
                ? "border-amber-glow bg-amber-glow/10"
                : "border-amber-glow/40 bg-zinc-900/50"
          }`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-amber-glow/40 bg-black">
            {cardSlotted ? (
              <ItemIcon id="residentId" size={32} title="Eingelegt" />
            ) : (
              <span className="font-mono-crt text-[0.55rem] uppercase tracking-widest text-amber-glow/50">
                Slot
              </span>
            )}
          </div>
          <div className="flex-1 font-mono-crt text-[0.65rem] uppercase tracking-widest text-amber-glow/70">
            {cardSlotted
              ? "Bewohner-Ausweis 2611 erkannt."
              : isCoarse
                ? "Bewohner-Ausweis hier antippen."
                : "Bewohner-Ausweis hier hineinziehen."}
          </div>
          {cardSlotted && (
            <button
              type="button"
              onClick={ejectCard}
              className="rounded-sm border border-amber-glow/50 bg-zinc-900 px-2 py-1 font-mono-crt text-[0.6rem] uppercase tracking-widest text-amber-glow hover:bg-amber-glow/15"
            >
              Auswerfen
            </button>
          )}
        </div>

        {/* Tastatur 1–9 */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <KeypadButton key={n} onClick={() => pressDigit(String(n))} disabled={!cardSlotted}>
              {n}
            </KeypadButton>
          ))}
          <KeypadButton
            onClick={backspace}
            disabled={!cardSlotted}
            variant="muted"
            ariaLabel="Löschen"
          >
            <Delete className="h-5 w-5" />
          </KeypadButton>
          <KeypadButton onClick={() => pressDigit("0")} disabled={!cardSlotted}>
            0
          </KeypadButton>
          <KeypadButton onClick={submit} variant="ok" ariaLabel="Bestätigen">
            <Check className="h-5 w-5" />
          </KeypadButton>
        </div>

        <div className="mt-3 text-center font-mono-crt text-[0.6rem] uppercase tracking-widest text-amber-glow/60">
          §2 Abs. 7 — Code = Wohnung mod 10 000
        </div>
      </div>
    </div>
  );
}

interface BtnProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "muted" | "ok";
  disabled?: boolean;
  ariaLabel?: string;
}

function KeypadButton({ children, onClick, variant = "default", disabled, ariaLabel }: BtnProps) {
  const base =
    "flex h-12 items-center justify-center rounded-sm border-2 font-mono-crt text-lg uppercase transition-all active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed";
  const palette =
    variant === "ok"
      ? "border-phosphor/60 bg-phosphor/10 text-phosphor shadow-[0_2px_0_rgba(120,255,160,0.35)] hover:bg-phosphor/20"
      : variant === "muted"
        ? "border-zinc-700 bg-zinc-900 text-zinc-400 shadow-[0_2px_0_rgba(255,255,255,0.05)] hover:bg-zinc-800"
        : "border-amber-glow/50 bg-zinc-900 text-amber-glow shadow-[0_2px_0_rgba(240,180,80,0.35)] hover:bg-amber-glow/15";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${base} ${palette}`}
    >
      {children}
    </button>
  );
}
