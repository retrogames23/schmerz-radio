/**
 * Live-Overlay für laufende LLM-Sessions (Cheat »chatlivecheat«).
 * Zeigt bis zu vier Sessions gleichzeitig: NPC-Dialoge, FastWeb-Chat,
 * auskunft.bin und DSA-Abenteuer (solo + Gruppe).
 */

import { useEffect, useRef } from "react";
import { X, Radio } from "lucide-react";
import {
  CHAT_LIVE_KIND_LABEL,
  useChatLiveState,
  setChatLiveOpen,
  chatLiveClearEnded,
  chatLiveVisibleSessions,
  type ChatLiveSession,
} from "./chatLive";

function StatusDot({ status }: { status: ChatLiveSession["status"] }) {
  const cls =
    status === "waiting"
      ? "bg-amber-400 animate-pulse"
      : status === "active"
        ? "bg-emerald-400"
        : "bg-zinc-600";
  const label =
    status === "waiting" ? "wartet auf Antwort" : status === "active" ? "aktiv" : "beendet";
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <span className={`inline-block h-2 w-2 rounded-full ${cls}`} />
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
    </span>
  );
}

function SessionPanel({ session }: { session: ChatLiveSession }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [session.messages.length, session.updatedAt]);

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded border border-zinc-700/70 bg-zinc-950/80">
      <header className="flex items-center justify-between gap-2 border-b border-zinc-800 px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300/90">
            {CHAT_LIVE_KIND_LABEL[session.kind]}
          </span>
          <span className="truncate text-xs font-semibold text-zinc-200">{session.title}</span>
        </div>
        <StatusDot status={session.status} />
      </header>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {session.messages.length === 0 ? (
          <p className="text-[11px] italic text-zinc-600">Noch keine Nachrichten mitgeschrieben.</p>
        ) : (
          session.messages.map((m, i) => (
            <div key={i} className="mb-1.5 last:mb-0">
              {m.role === "system" ? (
                <p className="text-[11px] italic text-zinc-500">·· {m.text}</p>
              ) : m.role === "user" ? (
                <p className="whitespace-pre-wrap text-[12px] leading-snug text-sky-300">
                  <span className="mr-1 font-bold text-sky-500">»</span>
                  {m.text}
                </p>
              ) : (
                <p className="whitespace-pre-wrap text-[12px] leading-snug text-zinc-300">
                  <span className="mr-1 font-bold text-amber-500">«</span>
                  {m.text}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function ChatLiveOverlay() {
  const { open, sessions } = useChatLiveState();
  if (!open) return null;

  const shown = chatLiveVisibleSessions(sessions).slice(-4);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-3 sm:p-6">
      <div className="flex h-full max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/95 font-mono shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-zinc-700 px-4 py-2">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-amber-400" aria-hidden />
            <h2 className="text-sm font-bold tracking-wide text-zinc-100">
              LLM-Live <span className="text-zinc-500">· bis zu 4 Sessions</span>
            </h2>
          </div>
          <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => chatLiveClearEnded()}
            className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Verlauf leeren
          </button>
          <button
            type="button"
            onClick={() => setChatLiveOpen(false)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Live-Ansicht schließen"
          >
            <X className="h-4 w-4" />
          </button>
          </div>
        </header>
        {shown.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="max-w-md text-center text-xs leading-relaxed text-zinc-500">
              Noch keine KI-Sessions in dieser Sitzung. Sobald du mit einem NPC sprichst, den
              FastWeb-Chat oder die Auskunft nutzt oder ein DSA-Abenteuer läuft, erscheint der
              Verlauf hier live.
            </p>
          </div>
        ) : (
          <div
            className={`grid min-h-0 flex-1 gap-2 p-2 ${
              shown.length === 1
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-2 sm:grid-rows-2"
            }`}
          >
            {shown.map((s) => (
              <SessionPanel key={s.id} session={s} />
            ))}
          </div>
        )}
        <footer className="border-t border-zinc-800 px-4 py-1.5 text-[10px] text-zinc-600">
          chatlivecheat · nur lokale Mitschrift dieser Browser-Sitzung, keine zusätzlichen Anfragen
        </footer>
      </div>
    </div>
  );
}
