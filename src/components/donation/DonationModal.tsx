import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { AuthDialog } from "@/auth/AuthDialog";
import { getFreshAccessToken } from "@/auth/freshToken";

interface Props {
  open: boolean;
  onClose: () => void;
  /** "soft" = Warnung, "hard" = blockierend, "manual" = freiwillig */
  variant: "soft" | "hard" | "manual";
  count?: number;
  hardLimit?: number;
}

const PRESETS = [
  { cents: 300, label: "3 €" },
  { cents: 500, label: "5 €", recommended: true },
  { cents: 1000, label: "10 €" },
];

export function DonationModal({
  open,
  onClose,
  variant,
  count,
  hardLimit = 50,
}: Props) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<number>(500);
  const [custom, setCustom] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  if (!open) return null;

  const customCents = (() => {
    const n = Number(custom.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.round(n * 100);
  })();
  const amountCents = customCents ?? selected;
  const validAmount = amountCents >= 300 && amountCents <= 100_000;

  const handleDonate = async () => {
    const isAnon = (user as { is_anonymous?: boolean } | null)?.is_anonymous;
    if (!user || isAnon || !user.email) {
      setAuthOpen(true);
      return;
    }
    if (!validAmount) {
      setError("Mindestens 3 €, höchstens 1000 €.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const token = await getFreshAccessToken();
      if (!token) throw new Error("Nicht angemeldet.");
      const resp = await fetch("/api/public/donation-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amountCents }),
      });
      if (!resp.ok) {
        const j = (await resp.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${resp.status}`);
      }
      const data = (await resp.json()) as { url?: string };
      if (!data.url) throw new Error("Keine Checkout-URL erhalten.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  const headline =
    variant === "hard"
      ? "Cloud-Limit erreicht"
      : variant === "soft"
        ? "Schmerz-Radio braucht dich"
        : "Schmerz-Radio unterstützen";

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/90 px-4">
      <div className="fade-in w-full max-w-md rounded-sm border border-amber-glow/50 bg-background p-6 shadow-[0_0_60px_rgba(0,0,0,0.85)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg uppercase tracking-[0.3em] text-amber-glow amber-glow">
            {headline}
          </h2>
          {variant !== "hard" && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>

        <div className="mb-5 space-y-2 text-sm text-foreground">
          {variant === "hard" ? (
            <>
              <p>
                Du hast{" "}
                <span className="text-amber-glow">{count ?? hardLimit}</span>{" "}
                Cloud-Antworten verbraucht. Cloud-KI kostet Geld pro Anfrage —
                und die fließt aus meiner Tasche, nicht aus Werbung.
              </p>
              <p>
                Mit einer einmaligen Spende schaltest du{" "}
                <span className="text-amber-glow">unbegrenzten Cloud-Chat</span>{" "}
                für deinen Account frei. Lokal weiterspielen geht jederzeit
                kostenlos.
              </p>
            </>
          ) : variant === "soft" ? (
            <>
              <p>
                Schon{" "}
                <span className="text-amber-glow">{count ?? 30}</span> Cloud-
                Antworten verbraucht. Wenn dir das Spiel gefällt: Eine kleine
                Spende deckt die laufenden KI-Kosten und schaltet unbegrenzten
                Chat frei.
              </p>
              <p className="text-xs text-muted-foreground">
                Du kannst weiterhin chatten — bis 50 Anfragen ist alles offen.
              </p>
            </>
          ) : (
            <p>
               Whisper Quest läuft auf einem Lovable-Server und Cloud-KI. Mit
              einer Spende schaltest du unbegrenzten Cloud-Chat für deinen
              Account frei und hilfst, dass das Projekt online bleibt.
            </p>
          )}
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.cents}
              type="button"
              onClick={() => {
                setSelected(p.cents);
                setCustom("");
              }}
              className={`rounded-sm border px-3 py-3 text-sm transition ${
                !customCents && selected === p.cents
                  ? "border-amber-glow bg-amber-glow/15 text-amber-glow"
                  : "border-border bg-black/40 text-foreground hover:border-amber-glow/60"
              }`}
            >
              <div className="font-display text-base">{p.label}</div>
              {p.recommended && (
                <div className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                  empfohlen
                </div>
              )}
            </button>
          ))}
        </div>

        <label className="mb-4 block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">
            Eigener Betrag (€)
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="z. B. 7,50"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-full rounded-sm border border-border bg-black/60 px-3 py-2 font-mono-crt text-sm text-foreground outline-none focus:border-amber-glow"
          />
        </label>

        {error && (
          <div className="mb-3 rounded-sm border border-destructive/60 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleDonate}
          disabled={busy || !validAmount}
          className="w-full rounded-sm border border-amber-glow bg-amber-glow/15 px-4 py-3 text-xs uppercase tracking-widest text-amber-glow transition hover:bg-amber-glow/25 disabled:opacity-50"
        >
          {busy
            ? "…"
            : !user ||
                (user as { is_anonymous?: boolean }).is_anonymous ||
                !user.email
              ? "Anmelden & spenden"
              : `${(amountCents / 100).toLocaleString("de-DE", { minimumFractionDigits: amountCents % 100 ? 2 : 0 })} € spenden`}
        </button>

        {variant === "hard" && (
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full text-center text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Lokal weiterspielen
          </button>
        )}

        <p className="mt-4 text-center text-[10px] text-muted-foreground">
          Sichere Zahlung via Stripe · Quittung kommt automatisch per Mail
        </p>

        <div className="mt-3 text-center">
          <a
            href="https://buymeacoffee.com/doener"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono-crt text-[10px] uppercase tracking-[0.25em] text-muted-foreground underline-offset-4 hover:text-amber-glow hover:underline"
          >
            Ohne Anmeldung spenden – ohne Code für unbegrenzte Chats
          </a>
        </div>
      </div>
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}