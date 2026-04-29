import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useAuth } from "@/auth/AuthContext";
import { getPersona } from "@/game/npcPersonas";
import { buildSystemPrompt } from "@/game/promptBuilder";
import {
  consumePatience,
  getPatience,
  PATIENCE_MAX,
} from "@/game/npcPatience";
import { scenes } from "@/game/scenes";
import { useLlmRuntime } from "@/llm/useLlmRuntime";
import type { ChatMsg } from "@/llm/runtime";
import { createCloudRuntime } from "@/llm/cloudLlmRuntime";
import type { LlmRuntime } from "@/llm/runtime";
import { CloseButton } from "./CloseButton";

interface UiMsg {
  role: "user" | "assistant";
  content: string;
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

  const [messages, setMessages] = useState<UiMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patience, setPatience] = useState(() => getPatience(userId, npcId));
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const locked = patience.lockedUntil > Date.now() || patience.remaining <= 0;
  const lockMins = locked
    ? Math.max(1, Math.ceil((patience.lockedUntil - Date.now()) / 60_000))
    : 0;

  async function trySend(text: string) {
    setError(null);
    const next: UiMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setSending(true);
    try {
      const chatMsgs: ChatMsg[] = [
        { role: "system", content: systemPrompt },
        ...next.map((m) => ({ role: m.role, content: m.content }) as ChatMsg),
      ];

      let reply: string;
      try {
        if (!runtime) throw new Error("Runtime nicht bereit.");
        reply = await runtime.send(chatMsgs);
      } catch (e) {
        // Lokal kaputt → Cloud probieren.
        if (status.kind === "local") {
          if (!cloudFallbackRef.current) {
            cloudFallbackRef.current = createCloudRuntime(npcId);
          }
          reply = await cloudFallbackRef.current.send(chatMsgs);
        } else {
          throw e;
        }
      }
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      // Geduld erst nach erfolgreicher Antwort runterzählen.
      const after = consumePatience(userId, npcId);
      setPatience(after);
      if (after.remaining === 0) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: persona.patienceExhaustedLine },
        ]);
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
              className={`font-mono-crt text-sm uppercase tracking-[0.3em] ${speakerColor}`}
            >
              {persona.speaker}
            </span>
            <span className="font-mono-crt text-[11px] uppercase tracking-widest text-muted-foreground">
              · Free-Mode
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono-crt text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>{modeLabel}</span>
            <span className={patience.remaining < 10 ? "text-rust" : ""}>
              Geduld: {patience.remaining}/{PATIENCE_MAX}
            </span>
          </div>
          <span className="absolute right-3 top-3">
            <CloseButton onClick={onClose} label="Free-Chat schließen" />
          </span>
        </div>

        {/* Transcript */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 && (
            <p className="font-mono-crt text-xs italic text-muted-foreground">
              [ Du sprichst jetzt frei mit {persona.displayName}.
              {status.kind === "local" && !status.ready
                ? " Das lokale Modell wird im Hintergrund geladen."
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
                  className={`mb-1 font-mono-crt text-[10px] uppercase tracking-widest ${
                    m.role === "user"
                      ? "text-muted-foreground"
                      : speakerColor
                  }`}
                >
                  {m.role === "user" ? "LAYARD" : persona.speaker}
                </div>
                <div className="whitespace-pre-wrap font-display text-base leading-relaxed text-foreground">
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="self-start font-mono-crt text-xs italic text-amber-glow">
                {persona.displayName} schreibt …
              </div>
            )}
          </div>
        </div>

        {/* Loader / error footer */}
        {status.loading && status.kind === "local" && !status.ready && (
          <div className="border-t border-amber-glow/10 px-4 py-2 font-mono-crt text-[11px] text-muted-foreground">
            {status.loading.text}
            {typeof status.loading.pct === "number"
              ? ` · ${Math.round(status.loading.pct * 100)}%`
              : ""}
          </div>
        )}
        {error && (
          <div className="border-t border-rust/40 bg-rust/10 px-4 py-2 font-mono-crt text-[11px] text-rust">
            {error}
          </div>
        )}
        {locked && (
          <div className="border-t border-rust/40 bg-rust/10 px-4 py-2 font-mono-crt text-[11px] text-rust">
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
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={locked || sending || !input.trim()}
            className="rounded-sm border border-amber-glow/40 px-3 py-2 font-mono-crt text-xs uppercase tracking-widest text-amber-glow hover:bg-amber-glow/10 disabled:opacity-40"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}