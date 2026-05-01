import { useState } from "react";
import { useAuth } from "./AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AuthDialog({ open, onClose }: Props) {
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email || !password) {
      setError("Bitte E-Mail und Passwort eingeben.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen haben.");
      return;
    }
    setBusy(true);
    const result =
      mode === "signin"
        ? await signInEmail(email, password)
        : await signUpEmail(email, password);
    setBusy(false);
    if (result.error) {
      setError(translateError(result.error));
      return;
    }
    if (mode === "signup") {
      setInfo(
        "Account angelegt. Falls eine Bestätigungsmail nötig ist, prüfe dein Postfach.",
      );
    } else {
      onClose();
    }
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    const result = await signInGoogle();
    setBusy(false);
    if (result.error) setError(translateError(result.error));
  };

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/90 px-4">
      <div className="fade-in w-full max-w-md rounded-sm border border-amber-glow/50 bg-background p-6 shadow-[0_0_60px_rgba(0,0,0,0.85)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg uppercase tracking-[0.3em] text-amber-glow amber-glow">
            {mode === "signin" ? "Anmelden" : "Account anlegen"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-xs italic text-muted-foreground">
          Speicherstände werden sicher in der Cloud gespeichert.
        </p>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              E-Mail
            </span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-border bg-black/60 px-3 py-2 font-mono-crt text-sm text-foreground outline-none focus:border-amber-glow"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              Passwort
            </span>
            <input
              type="password"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-border bg-black/60 px-3 py-2 font-mono-crt text-sm text-foreground outline-none focus:border-amber-glow"
              required
              minLength={mode === "signup" ? 6 : 1}
            />
          </label>
          {mode === "signup" && (
            <p className="rounded-sm border border-amber-glow/30 bg-amber-glow/5 px-3 py-2 text-[11px] leading-relaxed text-amber-glow/90">
              Achtung: Bitte benutze ein Passwort, das du nirgendwo anders
              benutzt — und auf keinen Fall das Passwort deines E-Mail-Diensts.
            </p>
          )}

          {error && (
            <div className="rounded-sm border border-destructive/60 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-sm border border-amber-glow/40 bg-amber-glow/10 px-3 py-2 text-xs text-amber-glow">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-sm border border-amber-glow bg-amber-glow/10 px-4 py-2 text-xs uppercase tracking-widest text-amber-glow transition hover:bg-amber-glow/20 disabled:opacity-50"
          >
            {busy
              ? "…"
              : mode === "signin"
                ? "Anmelden"
                : "Account anlegen"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          oder
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="w-full rounded-sm border border-border bg-black/40 px-4 py-2 text-xs uppercase tracking-widest text-foreground transition hover:border-amber-glow/60 hover:text-amber-glow disabled:opacity-50"
        >
          Mit Google anmelden
        </button>

        <div className="mt-5 text-center text-xs text-muted-foreground">
          {mode === "signin" ? (
            <>
              Noch kein Account?{" "}
              <button
                type="button"
                className="text-amber-glow underline-offset-4 hover:underline"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setInfo(null);
                }}
              >
                Registrieren
              </button>
            </>
          ) : (
            <>
              Schon registriert?{" "}
              <button
                type="button"
                className="text-amber-glow underline-offset-4 hover:underline"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setInfo(null);
                }}
              >
                Anmelden
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "E-Mail oder Passwort falsch.";
  if (m.includes("already registered") || m.includes("user already"))
    return "Diese E-Mail ist bereits registriert.";
  if (m.includes("rate limit"))
    return "Zu viele Versuche — bitte kurz warten.";
  if (m.includes("password")) return "Passwort wird nicht akzeptiert: " + msg;
  return msg;
}