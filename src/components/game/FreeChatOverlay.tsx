import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useAuth } from "@/auth/AuthContext";
import { getPersona } from "@/game/npcPersonas";
import { buildSystemPrompt } from "@/game/promptBuilder";
import { getFewshotMetaDeflection } from "@/game/promptBuilder";
import {
  consumePatience,
  getPatience,
  PATIENCE_MAX,
} from "@/game/npcPatience";
import { scenes } from "@/game/scenes";
import { useLlmRuntime } from "@/llm/useLlmRuntime";
import type { ChatMsg, LlmContext } from "@/llm/runtime";
import { createCloudRuntime } from "@/llm/cloudLlmRuntime";
import { onMarvUpdate, type MarvUpdate } from "@/llm/cloudLlmRuntime";
import type { LlmRuntime } from "@/llm/runtime";
import { CloseButton } from "./CloseButton";
import { Loader2, Bug } from "lucide-react";
import { useDevMode, useLlmModeOverride } from "@/dev/devMode";
import { supabase } from "@/integrations/supabase/client";

interface UiMsg {
  role: "user" | "assistant";
  content: string;
}

function LocalLoadingFooter({
  text,
  pct,
  onCancel,
}: {
  text: string;
  pct?: number;
  onCancel: () => void;
}) {
  const percent =
    typeof pct === "number" ? Math.max(0, Math.min(100, Math.round(pct * 100))) : null;
  return (
    <div className="border-t border-amber-glow/20 bg-amber-glow/5 px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono-crt text-sm uppercase tracking-widest text-amber-glow">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Lokales Modell lädt …</span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-sm border border-rust/50 px-3 py-1.5 font-mono-crt text-xs uppercase tracking-widest text-rust hover:bg-rust/10"
        >
          Später · Dialog schließen
        </button>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-sm bg-background/60">
        <div
          className="h-full bg-amber-glow/70 transition-all duration-300"
          style={{
            width: percent !== null ? `${percent}%` : "30%",
            ...(percent === null
              ? { animation: "progressIndeterminate 1.6s ease-in-out infinite" }
              : {}),
          }}
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 font-mono-crt text-sm leading-relaxed text-foreground">
        <span className="break-words">{text}</span>
        <span className="shrink-0 text-amber-glow/90">
          {percent !== null ? `${percent}%` : "läuft …"}
        </span>
      </div>
      <p className="mt-3 font-display text-base leading-relaxed text-muted-foreground">
        Das Spiel ist nicht abgestürzt. Beim ersten Mal wird ein lokales
        Sprachmodell (~4–5 GB, je nach Hardware kleiner) in deinen Browser
        geladen. Du kannst diesen Dialog schließen — der Download läuft im
        Hintergrund weiter.
      </p>
    </div>
  );
}

const SPEAKER_COLORS: Record<string, string> = {
  PHILIPPE: "text-foreground",
  BODO: "text-foreground",
  HELKA: "text-foreground",
  MIRA: "text-phosphor",
  OKWU: "text-foreground",
  TJARK: "text-foreground",
  INSA: "text-amber-glow",
};

export function FreeChatOverlay() {
  const game = useGame();
  const { user } = useAuth();
  const npcId = game.freeChatNpcId;
  const persona = getPersona(npcId);

  if (!npcId || !persona) return null;

  return (
    <FreeChatInner
      npcId={npcId}
      userId={user?.id ?? null}
      onClose={() => game.closeFreeChat()}
    />
  );
}

function FreeChatInner({
  npcId,
  userId,
  onClose,
}: {
  npcId: string;
  userId: string | null;
  onClose: () => void;
}) {
  const game = useGame();
  const persona = getPersona(npcId)!;
  const { runtime, status } = useLlmRuntime(npcId);
  const cloudFallbackRef = useRef<LlmRuntime | null>(null);
  const devMode = useDevMode();
  const [llmModeOverride, setLlmModeOverride] = useLlmModeOverride();
  const [debugOpen, setDebugOpen] = useState(false);

  const [messages, setMessages] = useState<UiMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patience, setPatience] = useState(() => getPatience(userId, npcId));
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Hält die letzte Session, damit wir auch beim Unmount noch persistieren
  // können (User schließt, Component verschwindet, State weg).
  const messagesRef = useRef<UiMsg[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const cloudUsedRef = useRef(false);
  const persistedRef = useRef(false);

  const isMarv = npcId === "marv9";
  const [marv, setMarv] = useState<MarvUpdate | null>(null);

  useEffect(() => {
    if (!isMarv) return;
    const off = onMarvUpdate((u) => {
      setMarv(u);
      if (u.justUnlocked) {
        try { game.api.setFlag("marvUnlocked"); } catch { /* ignore */ }
      }
    });
    return () => { off(); };
  }, [isMarv, game]);

  // Initialen Marv-Zustand aus DB lesen, damit der Empathie-Balken
  // bei Wiedereinstieg den richtigen Stand zeigt.
  useEffect(() => {
    if (!isMarv || !userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("marv_state")
        .select("empathy_score, unlocked, oiled, message_count")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled || !data) return;
      setMarv({
        empathyScore: data.empathy_score,
        unlocked: data.unlocked,
        oiled: data.oiled,
        messageCount: data.message_count,
        delta: 0,
        justUnlocked: false,
      });
    })();
    return () => { cancelled = true; };
  }, [isMarv, userId]);

  async function persistMemory() {
    if (persistedRef.current) return;
    persistedRef.current = true;
    if (!userId) return;
    if (!cloudUsedRef.current) return; // Lokal: kein Memory.
    const session = messagesRef.current;
    if (session.length < 2) return;
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) return;
      // Fire-and-forget; Antwort interessiert uns nicht.
      void fetch("/api/public/npc-memory-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          npcId,
          sessionMessages: session.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        keepalive: true,
      }).catch(() => {
        /* ignore */
      });
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    return () => {
      // Beim Unmount Memory schreiben.
      void persistMemory();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const systemPrompt = useMemo(() => {
    const sceneTitle = scenes[game.scene]?.title ?? game.scene;
    const activeFlags = (persona.contextFlags ?? []).filter((f) =>
      game.flags.has(f),
    );
    return buildSystemPrompt(persona, {
      sceneTitle,
      resonance: game.resonance,
      activeFlags,
      playedDialogIds: persona.staticDialogIds.filter(() => true),
    });
  }, [persona, game.scene, game.resonance, game.flags]);

  const fewshotPreview = useMemo(
    () => getFewshotMetaDeflection(persona),
    [persona],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Geduld nur bei Cloud durchsetzen — lokal sind Antworten „gratis".
  const isCloud = status.kind === "cloud";
  const locked =
    isCloud && (patience.lockedUntil > Date.now() || patience.remaining <= 0);
  const lockMins = locked
    ? Math.max(1, Math.ceil((patience.lockedUntil - Date.now()) / 60_000))
    : 0;

  async function trySend(text: string) {
    setError(null);
    const next: UiMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setSending(true);
    try {
      const fewshot: ChatMsg[] = getFewshotMetaDeflection(persona).flatMap(
        (ex) => [
          { role: "user", content: ex.user } as ChatMsg,
          { role: "assistant", content: ex.assistant } as ChatMsg,
        ],
      );
      const chatMsgs: ChatMsg[] = [
        { role: "system", content: systemPrompt },
        ...fewshot,
        ...next.map((m) => ({ role: m.role, content: m.content }) as ChatMsg),
      ];

      const sceneTitle = scenes[game.scene]?.title ?? game.scene;
      const activeFlags = (persona.contextFlags ?? []).filter((f) =>
        game.flags.has(f),
      );
      const cloudContext: LlmContext = {
        kind: "persona",
        sceneTitle,
        resonance: game.resonance,
        activeFlags,
        playedDialogIds: persona.staticDialogIds.filter(() => true),
      };

      let reply: string;
      try {
        if (!runtime) throw new Error("Runtime nicht bereit.");
        if (status.kind === "cloud") cloudUsedRef.current = true;
        reply = await runtime.send(chatMsgs, { context: cloudContext });
      } catch (e) {
        // Lokal kaputt → Cloud probieren.
        if (status.kind === "local") {
          if (!cloudFallbackRef.current) {
            cloudFallbackRef.current = createCloudRuntime(npcId);
          }
          cloudUsedRef.current = true;
          reply = await cloudFallbackRef.current.send(chatMsgs, {
            context: cloudContext,
          });
        } else {
          throw e;
        }
      }
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      // Geduld erst nach erfolgreicher Antwort runterzählen — und nur
      // bei Cloud, da lokale Antworten den Spieler nichts kosten.
      if (isCloud) {
        const after = consumePatience(userId, npcId);
        setPatience(after);
        if (after.remaining === 0) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: persona.patienceExhaustedLine },
          ]);
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unbekannter Fehler.";
      setError(msg);
      // User-Message zurücknehmen, damit nichts hängenbleibt.
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  function onSubmit() {
    const text = input.trim();
    if (!text || sending || locked) return;
    setInput("");
    void trySend(text);
  }

  const speakerColor = SPEAKER_COLORS[persona.speaker] ?? "text-foreground";
  const modeLabel =
    status.kind === "local"
      ? status.ready
        ? "● Lokal"
        : "● Lokal lädt …"
      : "☁ Cloud";

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 px-3 pb-4 sm:items-center sm:pb-0">
      <div className="fade-in relative flex h-[85vh] w-full max-w-3xl flex-col rounded-sm border border-amber-glow/40 bg-background/95 shadow-[0_0_40px_rgba(0,0,0,0.7)] sm:h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-glow/20 px-4 py-3 pr-12">
          <div className="flex items-center gap-3">
            <span
              className={`font-mono-crt text-base uppercase tracking-[0.3em] ${speakerColor}`}
            >
              {persona.speaker}
            </span>
            <span className="font-mono-crt text-xs uppercase tracking-widest text-muted-foreground">
              · Free-Mode
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono-crt text-xs uppercase tracking-widest text-muted-foreground">
            <span>{modeLabel}</span>
            {/* Geduld-Counter ist eine Cloud-Schutzmaßnahme (Token-Kosten /
                Spam). Lokale Antworten kosten nichts → kein Limit anzeigen. */}
            {status.kind === "cloud" && (
              <span className={patience.remaining < 10 ? "text-rust" : ""}>
                Geduld: {patience.remaining}/{PATIENCE_MAX}
              </span>
            )}
            {isMarv && marv && (
              <span
                className={
                  marv.unlocked ? "text-phosphor" : "text-amber-glow/80"
                }
                title="MARV-9 hört zu. Empathie-Resonanz."
              >
                Resonanz: {Math.min(4, marv.empathyScore)}/4
                {marv.unlocked ? " · offen" : ""}
              </span>
            )}
            {devMode && (
              <button
                type="button"
                onClick={() => setDebugOpen((v) => !v)}
                className={`flex items-center gap-1 rounded-sm border px-2 py-1 text-xs uppercase tracking-widest transition ${
                  debugOpen
                    ? "border-phosphor/60 bg-phosphor/10 text-phosphor"
                    : "border-phosphor/30 text-phosphor/80 hover:bg-phosphor/5"
                }`}
                title="Debug-Panel umschalten (nur Dev-Mode)"
              >
                <Bug className="h-3 w-3" />
                Debug
              </button>
            )}
          </div>
          <span className="absolute right-3 top-3">
            <CloseButton onClick={onClose} label="Free-Chat schließen" />
          </span>
        </div>

        {/* Debug-Panel — nur Dev-Mode */}
        {devMode && debugOpen && (
          <div className="border-b border-phosphor/30 bg-phosphor/5 px-4 py-3 text-foreground">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-mono-crt text-xs uppercase tracking-widest text-phosphor">
                LLM-Modus:
              </span>
              {(["auto", "local", "cloud"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLlmModeOverride(m)}
                  className={`rounded-sm border px-2 py-1 font-mono-crt text-xs uppercase tracking-widest transition ${
                    llmModeOverride === m
                      ? "border-phosphor bg-phosphor/20 text-phosphor"
                      : "border-phosphor/30 text-phosphor/70 hover:bg-phosphor/10"
                  }`}
                >
                  {m === "auto" ? "Auto" : m === "local" ? "Lokal erzwingen" : "Cloud erzwingen"}
                </button>
              ))}
              <span className="ml-auto font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground">
                Aktiv: {status.kind} {status.ready ? "✓" : "…"}
              </span>
            </div>
            <p className="mb-2 font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground">
              Mode-Wechsel: Dialog kurz schließen & neu öffnen, damit Runtime greift.
            </p>

            <details className="mb-2" open>
              <summary className="cursor-pointer font-mono-crt text-xs uppercase tracking-widest text-phosphor">
                System-Prompt ({systemPrompt.length} Zeichen)
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-sm border border-phosphor/20 bg-background/80 p-2 font-mono-crt text-[11px] leading-relaxed text-foreground">
                {systemPrompt}
              </pre>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(systemPrompt);
                }}
                className="mt-1 rounded-sm border border-phosphor/30 px-2 py-1 font-mono-crt text-[10px] uppercase tracking-widest text-phosphor hover:bg-phosphor/10"
              >
                Kopieren
              </button>
            </details>

            <details>
              <summary className="cursor-pointer font-mono-crt text-xs uppercase tracking-widest text-phosphor">
                Few-Shot-Beispiele ({fewshotPreview.length})
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-sm border border-phosphor/20 bg-background/80 p-2 font-mono-crt text-[11px] leading-relaxed text-foreground">
                {fewshotPreview
                  .map(
                    (ex, i) =>
                      `# Beispiel ${i + 1}\nUSER: ${ex.user}\nASSISTANT: ${ex.assistant}`,
                  )
                  .join("\n\n")}
              </pre>
            </details>
          </div>
        )}

        {/* Transcript */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 && (
            <p className="font-display text-base italic leading-relaxed text-muted-foreground">
              [ Du sprichst jetzt frei mit {persona.displayName}.
              {status.kind === "local" && !status.ready
                ? " Das lokale Modell wird gerade geladen — Fortschritt siehst du unten."
                : ""}{" "}
              Bleib höflich — die Geduld ist begrenzt. ]
            </p>
          )}
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "self-end max-w-[85%] rounded-sm border border-border bg-secondary/60 px-3 py-2"
                    : "self-start max-w-[85%] rounded-sm border border-amber-glow/30 bg-amber-glow/5 px-3 py-2"
                }
              >
                <div
                  className={`mb-1 font-mono-crt text-xs uppercase tracking-widest ${
                    m.role === "user"
                      ? "text-muted-foreground"
                      : speakerColor
                  }`}
                >
                  {m.role === "user" ? "LAYARD" : persona.speaker}
                </div>
                <div className="whitespace-pre-wrap font-display text-lg leading-relaxed text-foreground">
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="self-start font-mono-crt text-sm italic text-amber-glow">
                {persona.displayName} sagt …
              </div>
            )}
          </div>
        </div>

        {/* Loader / error footer */}
        {status.loading && status.kind === "local" && !status.ready && (
          <LocalLoadingFooter
            text={status.loading.text}
            pct={status.loading.pct}
            onCancel={() => {
              // Lade-Vorgang läuft im Hintergrund weiter (Singleton),
              // damit der Spieler beim nächsten Free-Mode davon profitiert.
              // Wir schließen nur den Dialog.
              onClose();
            }}
          />
        )}
        {error && (
          <div className="border-t border-rust/40 bg-rust/10 px-4 py-3 font-mono-crt text-sm text-rust">
            {error}
          </div>
        )}
        {locked && (
          <div className="border-t border-rust/40 bg-rust/10 px-4 py-3 font-mono-crt text-sm text-rust">
            {persona.displayName} braucht eine Pause. Versuch es in {lockMins}{" "}
            {lockMins === 1 ? "Minute" : "Minuten"} noch einmal.
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-2 border-t border-amber-glow/20 px-3 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            disabled={locked || sending}
            rows={2}
            placeholder={
              locked
                ? "Eingabe gesperrt."
                : `Was sagst du zu ${persona.displayName}?`
            }
            className="min-h-[44px] flex-1 resize-none rounded-sm border border-border bg-secondary/40 px-3 py-2 font-display text-sm text-foreground outline-none focus:border-amber-glow/60 disabled:opacity-50"
            style={{ fontSize: "1rem" }}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={locked || sending || !input.trim()}
            className="rounded-sm border border-amber-glow/40 px-4 py-2 font-mono-crt text-sm uppercase tracking-widest text-amber-glow hover:bg-amber-glow/10 disabled:opacity-40"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}