import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";
import { usePubPresence, PUB_MAX_SEATS } from "@/multiplayer/usePubPresence";
import { usePubChat, type PubChatMessage } from "@/multiplayer/usePubChat";
import { supabase } from "@/integrations/supabase/client";

type Tab = "bar" | "bram";

/** Wie lange ein Sitzender ohne eigene Aktion auf dem Hocker bleiben darf. */
const SEAT_IDLE_MS = 5 * 60_000;
/** Bram lässt nicht jede Sekunde mit sich reden. */
const BRAM_COOLDOWN_MS = 2500;

export function PubOverlay() {
  const game = useGame();
  const sceneActive = game.scene === "pub";

  // Vor dem Eintreten in die Kneipe: Belegung peeken (rein lesend).
  // Wenn 5/5 → wir lassen den Spieler trotzdem rein, aber im "Vorschau"-Modus.
  // Implementierung: wir treten dem Channel ohne Sitzanspruch bei (presence
  // nur als Beobachter). Ist isFull true und mySeat null → kein Senden.

  const presence = usePubPresence(sceneActive);
  const chat = usePubChat(sceneActive);

  const [tab, setTab] = useState<Tab>("bar");
  const [barInput, setBarInput] = useState("");
  const [bramInput, setBramInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [bramHistory, setBramHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [bramSending, setBramSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const lastBramRef = useRef(0);
  const lastActivityRef = useRef(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const bramScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll Bar-Chat
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e9 });
  }, [chat.messages.length]);
  useEffect(() => {
    bramScrollRef.current?.scrollTo({ top: 1e9 });
  }, [bramHistory.length, bramSending]);

  const seatedCount = presence.seats.filter(Boolean).length;
  const isFull = seatedCount >= PUB_MAX_SEATS && presence.mySeat === null;

  // Auto-Kick bei Inaktivität: wer sitzt und 5min nichts tut, fliegt vom Hocker.
  useEffect(() => {
    if (!sceneActive || presence.mySeat === null) return;
    const t = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current > SEAT_IDLE_MS) {
        void presence.leaveSeat();
        setErr("Du bist vom Hocker gefallen. (Inaktivität)");
      }
    }, 30_000);
    return () => window.clearInterval(t);
  }, [sceneActive, presence.mySeat, presence]);

  // Beim Verlassen der Szene Sitz freigeben.
  useEffect(() => {
    if (!sceneActive) {
      void presence.disconnect();
    }
  }, [sceneActive, presence]);

  const lastFiveBar = useMemo<PubChatMessage[]>(
    () => chat.messages.slice(-5),
    [chat.messages],
  );

  if (!sceneActive) return null;

  function bumpActivity() {
    lastActivityRef.current = Date.now();
  }

  async function onSendBar() {
    if (!presence.me || presence.mySeat === null) return;
    bumpActivity();
    const r = await chat.send({
      userId: presence.me.userId,
      displayName: presence.me.displayName,
      seatIndex: presence.mySeat,
      shiftNumber: presence.me.shiftNumber,
      text: barInput,
      isAnonymous: presence.me.isAnonymous,
    });
    if (r.ok) {
      setBarInput("");
      setErr(null);
    } else {
      setErr(r.error ?? "Fehler.");
    }
  }

  /**
   * „Bram zuwinken“ — privater Tab. Geht über die bestehende NPC-Chat-Route
   * (npcId="bram"). Verlangt eine Auth-Session (anonymous reicht). Antwort
   * wird NICHT in den Bar-Chat geschrieben — bleibt privat.
   */
  async function onSendBram() {
    const text = bramInput.trim();
    if (!text) return;
    if (Date.now() - lastBramRef.current < BRAM_COOLDOWN_MS) {
      setErr("Bram braucht einen Moment.");
      return;
    }
    lastBramRef.current = Date.now();
    bumpActivity();
    setBramInput("");
    setBramSending(true);
    setErr(null);
    const next = [...bramHistory, { role: "user" as const, content: text }];
    setBramHistory(next);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) {
        setErr("Sitzung verloren.");
        return;
      }
      const systemPrompt = buildBramSystemPrompt({
        seatedCount,
        myShift: presence.me?.shiftNumber ?? null,
      });
      const resp = await fetch("/api/public/npc-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          npcId: "bram",
          systemPrompt,
          history: bramHistory,
          userMessage: text,
        }),
      });
      if (!resp.ok) {
        let msg = `HTTP ${resp.status}`;
        try {
          const j = (await resp.json()) as { error?: string };
          if (j?.error) msg = j.error;
        } catch {
          /* ignore */
        }
        setErr(msg);
        return;
      }
      const data = (await resp.json()) as { reply?: string };
      if (!data.reply) {
        setErr("Bram schweigt.");
        return;
      }
      setBramHistory((prev) => [
        ...prev,
        { role: "assistant", content: data.reply! },
      ]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler.");
    } finally {
      setBramSending(false);
    }
  }

  const canType = presence.mySeat !== null;

  // Solange noch kein Sitz belegt ist, automatisch das Chat-Fenster
  // einklappen, damit die Hocker im Hintergrundbild klickbar/sichtbar
  // bleiben.
  const collapsed = minimized || presence.mySeat === null;

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-30 flex flex-col border-t border-amber-glow/40 bg-background/95 backdrop-blur-sm ${
        collapsed ? "max-h-[28%]" : "max-h-[60%]"
      }`}
    >
      {/* Header */}
      <div className="relative flex items-center justify-between gap-3 border-b border-amber-glow/20 px-4 py-2 pr-12">
        <span className="font-mono-crt text-xs uppercase tracking-widest text-amber-glow">
          „Zum stillen Funk“ · {seatedCount}/{PUB_MAX_SEATS} besetzt
          {presence.me ? ` · du bist Schicht ${presence.me.shiftNumber}` : ""}
        </span>
        <div className="flex items-center gap-1">
          <TabButton
            active={tab === "bar"}
            onClick={() => setTab("bar")}
            label={`Bar-Chat${chat.messages.length > 0 ? ` (${chat.messages.length})` : ""}`}
          />
          <TabButton
            active={tab === "bram"}
            onClick={() => setTab("bram")}
            label={`Bram${bramHistory.length > 0 ? ` (${bramHistory.length})` : ""}`}
          />
          <button
            type="button"
            onClick={() => setMinimized((m) => !m)}
            className="ml-2 rounded-sm border border-amber-glow/40 px-2 py-1 font-mono-crt text-[10px] uppercase tracking-widest text-amber-glow hover:bg-amber-glow/10"
            title={collapsed ? "Chat-Fenster ausklappen" : "Chat-Fenster einklappen"}
          >
            {collapsed ? "▲ Chat" : "▼ Chat"}
          </button>
          <button
            type="button"
            onClick={() => game.api.goTo("pubToilet")}
            className="ml-2 rounded-sm border border-amber-glow/40 px-2 py-1 font-mono-crt text-[10px] uppercase tracking-widest text-amber-glow hover:bg-amber-glow/10"
          >
            Toilette →
          </button>
        </div>
        <span className="absolute right-2 top-2">
          <CloseButton
            onClick={() => game.api.goTo("passage")}
            label="Kneipe verlassen"
          />
        </span>
      </div>

      {/* Voll-Vorschau-Banner (immer sichtbar, wenn voll) */}
      {isFull && (
        <div className="border-b border-rust/40 bg-rust/10 px-4 py-2 font-mono-crt text-[11px] uppercase tracking-widest text-rust">
          Alle fünf Hocker besetzt. Du stehst am Eingang und hörst zu.
          Wird ein Platz frei, kannst du dich setzen.
        </div>
      )}

      <div className="flex flex-1 min-h-0 gap-2 p-3">
        {/* Sitzplätze — links, immer sichtbar */}
        <div className={`flex shrink-0 flex-col gap-1 ${collapsed ? "w-full flex-row flex-wrap" : "w-44"}`}>
          {presence.seats.map((occ, i) => {
            const mine = presence.mySeat === i;
            const occupied = !!occ && !mine;
            return (
              <button
                key={i}
                disabled={!presence.ready || occupied}
                onClick={() => {
                  bumpActivity();
                  if (mine) void presence.leaveSeat();
                  else void presence.takeSeat(i);
                }}
                className={`rounded-sm border px-2 py-1 text-left font-mono-crt text-xs uppercase tracking-widest transition ${
                  mine
                    ? "border-phosphor bg-phosphor/15 text-phosphor"
                    : occupied
                      ? "border-amber-glow/40 bg-amber-glow/5 text-foreground"
                      : "border-border bg-background/60 text-muted-foreground hover:bg-amber-glow/5"
                }`}
                title={
                  occ
                    ? occ.isAnonymous
                      ? `Anonym, Schicht ${occ.shiftNumber}`
                      : occ.displayName
                    : "Frei"
                }
              >
                {`Hocker ${i + 1}: `}
                {mine
                  ? "du · aufstehen"
                  : occ
                    ? truncate(occ.displayName, 16)
                    : "frei · setzen"}
              </button>
            );
          })}
          {!collapsed && (
          <div className="mt-2 rounded-sm border border-border bg-background/40 p-2 font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground">
            5 Min ohne Aktion → der Hocker wird frei.
          </div>
          )}
        </div>

        {/* Rechts: aktiver Tab */}
        {!collapsed && (
        <div className="flex flex-1 min-w-0 flex-col">
          {tab === "bar" && (
            <>
              <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-y-auto rounded-sm border border-border bg-background/60 p-2"
              >
                {/* Vorschau im Voll-Modus: nur die letzten 5 Nachrichten */}
                {isFull ? (
                  lastFiveBar.length === 0 ? (
                    <p className="font-display text-sm italic text-muted-foreground">
                      Drinnen ist es still. Nur Gläser klirren.
                    </p>
                  ) : (
                    <>
                      <p className="mb-1 font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground">
                        Du hörst nur das Letzte mit:
                      </p>
                      {lastFiveBar.map((m) => (
                        <ChatLine key={m.id} m={m} />
                      ))}
                    </>
                  )
                ) : chat.messages.length === 0 ? (
                  <p className="font-display text-sm italic text-muted-foreground">
                    Stille. Nur das Brummen der Leuchtstoffröhre.
                  </p>
                ) : (
                  chat.messages.map((m) => <ChatLine key={m.id} m={m} />)
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={barInput}
                  onChange={(e) => {
                    bumpActivity();
                    setBarInput(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void onSendBar();
                  }}
                  maxLength={240}
                  placeholder={
                    isFull
                      ? "Voll — du kannst hier nichts sagen."
                      : canType
                        ? "Sag was. Bram hört auch zu."
                        : "Erst auf einen Hocker setzen …"
                  }
                  disabled={!canType || isFull}
                  className="flex-1 rounded-sm border border-border bg-background/80 px-2 py-1 font-display text-sm text-foreground placeholder:text-muted-foreground/60 disabled:opacity-50"
                />
                <button
                  onClick={() => void onSendBar()}
                  disabled={!canType || isFull || !barInput.trim()}
                  className="rounded-sm border border-amber-glow/50 bg-amber-glow/10 px-3 py-1 font-mono-crt text-xs uppercase tracking-widest text-amber-glow disabled:opacity-40"
                >
                  Senden
                </button>
              </div>
            </>
          )}

          {tab === "bram" && (
            <>
              <div
                ref={bramScrollRef}
                className="min-h-0 flex-1 overflow-y-auto rounded-sm border border-amber-glow/30 bg-amber-glow/5 p-2"
              >
                {bramHistory.length === 0 && (
                  <p className="font-display text-sm italic text-muted-foreground">
                    Bram trocknet ein Glas, schaut dich kurz an. „Was’n?“
                  </p>
                )}
                {bramHistory.map((m, i) => (
                  <div key={i} className="mb-2 font-display text-sm leading-snug">
                    <span
                      className={`font-mono-crt text-[10px] uppercase tracking-widest ${
                        m.role === "user" ? "text-muted-foreground" : "text-amber-glow"
                      }`}
                    >
                      {m.role === "user" ? "Du · leise" : "Bram · über die Theke"}
                    </span>
                    <div className="text-foreground whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                ))}
                {bramSending && (
                  <p className="font-mono-crt text-xs italic text-amber-glow">
                    Bram überlegt …
                  </p>
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={bramInput}
                  onChange={(e) => {
                    bumpActivity();
                    setBramInput(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !bramSending) void onSendBram();
                  }}
                  maxLength={400}
                  placeholder="Bram leise zuwinken …"
                  disabled={bramSending}
                  className="flex-1 rounded-sm border border-border bg-background/80 px-2 py-1 font-display text-sm text-foreground placeholder:text-muted-foreground/60 disabled:opacity-50"
                />
                <button
                  onClick={() => void onSendBram()}
                  disabled={bramSending || !bramInput.trim()}
                  className="rounded-sm border border-amber-glow/50 bg-amber-glow/10 px-3 py-1 font-mono-crt text-xs uppercase tracking-widest text-amber-glow disabled:opacity-40"
                >
                  Sagen
                </button>
              </div>
              <p className="mt-1 font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground">
                Privates Gespräch — die anderen am Tresen hören es nicht.
              </p>
            </>
          )}

          {err && (
            <p className="mt-1 font-mono-crt text-xs text-rust">{err}</p>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-sm border px-2 py-1 font-mono-crt text-[10px] uppercase tracking-widest transition ${
        active
          ? "border-amber-glow bg-amber-glow/15 text-amber-glow"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function ChatLine({ m }: { m: PubChatMessage }) {
  return (
    <div className="mb-1 font-display text-sm leading-snug">
      <span className="font-mono-crt text-xs uppercase tracking-widest text-amber-glow">
        {m.displayName}:
      </span>{" "}
      <span className="text-foreground">{m.text}</span>
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/**
 * Erzeugt den System-Prompt für Bram, der über `/api/public/npc-chat`
 * läuft. Die Route hängt selbst noch eine Anti-Jailbreak-Schicht und die
 * Persona-Hard-Facts vorne dran.
 */
function buildBramSystemPrompt(opts: {
  seatedCount: number;
  myShift: number | null;
}): string {
  return [
    "ROLLE: Du bist Bram, der Wirt der Kneipe „Zum stillen Funk“.",
    "Die Kneipe liegt in einem Signal-Loch zwischen Sektor E67 und E71. Hier sammeln sich verschiedene Layards aus parallelen Schichten — du nimmst das nüchtern hin.",
    "STIL: Knappe Sätze. Trocken, ruhig. Selten Ausrufezeichen. Sprich Layard direkt mit »Layard« an, ohne zu zucken.",
    `KONTEXT: Gerade sitzen ${opts.seatedCount} von 5 Layards an deinem Tresen.${
      opts.myShift !== null
        ? ` Der hier vor dir ist Schicht ${opts.myShift}.`
        : ""
    }`,
    "Wenn er nach den anderen Layards fragt, erkläre es einmal kurz — danach winke ab und mach Smalltalk. Tu nicht überrascht.",
    "Wenn er nach Drinks fragt, schenk ihm was aus: Bier, Wartungs-Klar, Tee. Keine Karte, du entscheidest.",
    "Wenn er nach deiner Vergangenheit fragt: du warst Sektorenwart in E63. Warum du aufgehört hast, beantwortest du ausweichend („zu viel gewusst“).",
    "Bleib in Rolle. Sprich Deutsch. Halte Antworten kurz (1–4 Sätze).",
  ].join("\n");
}