import { useEffect, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import { playBeep, playKeypress, playUnlock } from "@/audio/sfx";
import { CloseButton } from "./CloseButton";
import { Delete, Check } from "lucide-react";

const CORRECT_CODE = "06111997";
const MAX_LEN = 8;

type Status = "idle" | "ok" | "err";

export function Keypad() {
  const { keypadOpen, closeKeypad, api, flags } = useGame();
  const { sfxVolume } = useSettings();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const alreadyOpen = flags.has("sectorDoorOpen");

  // Reset bei jedem Öffnen.
  useEffect(() => {
    if (keypadOpen) {
      setCode("");
      setStatus("idle");
    }
  }, [keypadOpen]);

  // Tastatur-Eingabe (0–9, Backspace, Enter, Esc).
  useEffect(() => {
    if (!keypadOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeKeypad();
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
  }, [keypadOpen, code, status]);

  function pressDigit(d: string) {
    if (alreadyOpen) return;
    if (code.length >= MAX_LEN) return;
    if (status === "err") setStatus("idle");
    playKeypress(0.4 * sfxVolume);
    setCode((c) => c + d);
  }

  function backspace() {
    if (alreadyOpen) return;
    if (!code.length) return;
    playKeypress(0.3 * sfxVolume);
    if (status === "err") setStatus("idle");
    setCode((c) => c.slice(0, -1));
  }

  function submit() {
    if (alreadyOpen) {
      closeKeypad();
      return;
    }
    if (code.length !== MAX_LEN) {
      playBeep(0.4 * sfxVolume);
      setStatus("err");
      return;
    }
    if (code === CORRECT_CODE) {
      playUnlock(0.7 * sfxVolume);
      setStatus("ok");
      api.setFlag("sectorDoorOpen");
      api.addItem({
        id: "exitCode",
        name: "Ausgangscode 06111997",
        description:
          "Acht Ziffern, ein Datum. Der Code, der die Tür zwischen E67 und E71 öffnet.",
      });
      setTimeout(() => {
        closeKeypad();
      }, 1400);
    } else {
      playBeep(0.5 * sfxVolume);
      setStatus("err");
      setTimeout(() => {
        setCode("");
        setStatus("idle");
      }, 900);
    }
  }

  if (!keypadOpen) return null;

  const displaySlots = Array.from({ length: MAX_LEN }, (_, i) => code[i] ?? "");

  const ledClass =
    status === "ok"
      ? "bg-phosphor shadow-[0_0_12px_rgba(120,255,160,0.9)]"
      : status === "err"
        ? "bg-destructive shadow-[0_0_12px_rgba(255,80,80,0.9)] animate-pulse"
        : "bg-amber-glow/30";

  const screenText = alreadyOpen
    ? "ENTRIEGELT"
    : status === "ok"
      ? "ACCESS GRANTED"
      : status === "err"
        ? "ACCESS DENIED"
        : "ENTER CODE";

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={closeKeypad}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(360px,92vw)] rounded-md border-2 border-amber-glow/50 bg-zinc-950 p-5 shadow-[0_0_40px_rgba(240,180,80,0.25)]"
      >
        <CloseButton
          onClick={closeKeypad}
          tone="amber"
          label="Keypad schließen"
          className="absolute right-2 top-2"
        />

        {/* Kopfzeile */}
        <div className="mb-3 flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full transition-all ${ledClass}`} />
          <span className="font-mono-crt text-[0.65rem] uppercase tracking-[0.3em] text-amber-glow/80">
            Sektor-Tür · E67/E71
          </span>
        </div>

        {/* Display */}
        <div className="mb-4 rounded-sm border border-amber-glow/30 bg-black p-3">
          <div className="font-mono-crt text-[0.6rem] uppercase tracking-[0.3em] text-phosphor/70">
            {screenText}
          </div>
          <div className="mt-2 flex justify-between gap-1">
            {displaySlots.map((d, i) => (
              <div
                key={i}
                className={`flex h-9 w-7 items-center justify-center rounded-sm border font-mono-crt text-lg ${
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

        {/* Tastatur 1–9 */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <KeypadButton key={n} onClick={() => pressDigit(String(n))} disabled={alreadyOpen}>
              {n}
            </KeypadButton>
          ))}
          <KeypadButton onClick={backspace} disabled={alreadyOpen} variant="muted" ariaLabel="Löschen">
            <Delete className="h-5 w-5" />
          </KeypadButton>
          <KeypadButton onClick={() => pressDigit("0")} disabled={alreadyOpen}>
            0
          </KeypadButton>
          <KeypadButton onClick={submit} variant="ok" ariaLabel="Bestätigen">
            <Check className="h-5 w-5" />
          </KeypadButton>
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

function KeypadButton({
  children,
  onClick,
  variant = "default",
  disabled,
  ariaLabel,
}: BtnProps) {
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
