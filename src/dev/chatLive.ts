/**
 * LLM-Live-Tracker (Cheat »chatlivecheat«).
 *
 * Client-seitiger Pub/Sub-Speicher, in den alle Stellen schreiben, die
 * gerade mit einer KI reden: NPC-Free-Chat, FastWeb-Chat, auskunft.bin
 * und die DSA-Abenteuer (solo + Gruppe). Das Overlay `ChatLiveOverlay`
 * abonniert diesen Speicher und zeigt bis zu vier Sessions live an.
 *
 * Rein lokal pro Browser-Tab — es werden keine zusätzlichen Daten
 * verschickt, nur mitgeschrieben, was ohnehin durch die Leitung geht.
 */

import { useSyncExternalStore } from "react";

export type ChatLiveKind = "npc" | "fastweb" | "auskunft" | "dsa" | "dsa-gruppe";

export interface ChatLiveMessage {
  role: "user" | "assistant" | "system";
  text: string;
  at: number;
}

export interface ChatLiveSession {
  id: number;
  key: string;
  kind: ChatLiveKind;
  title: string;
  /** active = letzte Antwort da, waiting = Anfrage läuft, ended = ersetzt/abgeschlossen. */
  status: "active" | "waiting" | "ended";
  messages: ChatLiveMessage[];
  startedAt: number;
  updatedAt: number;
}

export interface ChatLiveState {
  open: boolean;
  sessions: ChatLiveSession[];
}

const MAX_LIVE_SESSIONS = 4;
const MAX_MESSAGES_PER_SESSION = 80;
const STORAGE_KEY = "chatlive:sessions:v1";
const CHANNEL_NAME = "chatlive";

const EMPTY: ChatLiveState = { open: false, sessions: [] };
let state: ChatLiveState = EMPTY;
let nextSessionId = 1;
const listeners = new Set<() => void>();

// --- Tab-übergreifende Synchronisation (BroadcastChannel + localStorage) ---
let syncReady = false;
let channel: BroadcastChannel | null = null;

function newSessionId(): number {
  // Tab-übergreifend eindeutig genug: Zeit + Zufall + Zähler.
  return Date.now() * 1000 + Math.floor(Math.random() * 900) + (nextSessionId++ % 100);
}

function ensureSync() {
  if (syncReady || typeof window === "undefined") return;
  syncReady = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const sessions = JSON.parse(raw) as ChatLiveSession[];
      if (Array.isArray(sessions)) state = { ...state, sessions };
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (ev: MessageEvent) => {
        const sessions = (ev.data as { sessions?: ChatLiveSession[] })?.sessions;
        if (!Array.isArray(sessions)) return;
        state = { ...state, sessions };
        emit();
      };
    }
  } catch {
    channel = null;
  }
}

function publish(sessions: ChatLiveSession[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    /* ignore */
  }
  try {
    channel?.postMessage({ sessions });
  } catch {
    /* ignore */
  }
}

function emit() {
  for (const cb of listeners) {
    try {
      cb();
    } catch {
      /* ignore */
    }
  }
}

function setState(next: ChatLiveState) {
  ensureSync();
  const sessionsChanged = next.sessions !== state.sessions;
  state = next;
  if (sessionsChanged && typeof window !== "undefined") publish(next.sessions);
  emit();
}

export function subscribeChatLive(cb: () => void): () => void {
  ensureSync();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getChatLiveState(): ChatLiveState {
  return state;
}

export function useChatLiveState(): ChatLiveState {
  return useSyncExternalStore(subscribeChatLive, getChatLiveState, () => EMPTY);
}

export function setChatLiveOpen(open: boolean): void {
  if (state.open === open) return;
  setState({ ...state, open });
}

export function toggleChatLive(): void {
  setChatLiveOpen(!state.open);
}

export interface ChatLiveHandle {
  /** Spieler-Eingabe / ausgehende Nachricht. */
  user(text: string): void;
  /** KI-Antwort. */
  assistant(text: string): void;
  /** Systemnotiz (Fehler, Status). */
  note(text: string): void;
  /** Session explizit abschließen (z. B. Abenteuer beendet). */
  end(): void;
}

function pushMessage(key: string, msg: ChatLiveMessage, status?: ChatLiveSession["status"]) {
  const sessions = state.sessions.map((s) => {
    if (s.key !== key) return s;
    const messages = [...s.messages, msg].slice(-MAX_MESSAGES_PER_SESSION);
    return { ...s, messages, status: status ?? s.status, updatedAt: msg.at };
  });
  setState({ ...state, sessions });
}

/**
 * Liefert (oder legt neu an) eine Session für `key`. Gleiche Keys werden
 * wiederverwendet, solange die Session nicht beendet wurde — so bleibt
 * z. B. ein NPC-Gespräch über viele Nachrichten in einem Panel.
 * Wird eine fünfte Live-Session geöffnet, wird die älteste als
 * »beendet« markiert und ans Ende gereiht.
 */
export function chatLiveTrack(key: string, kind: ChatLiveKind, title: string): ChatLiveHandle {
  const existing = state.sessions.find((s) => s.key === key && s.status !== "ended");
  if (!existing) {
    const now = Date.now();
    const session: ChatLiveSession = {
      id: nextSessionId++,
      key,
      kind,
      title,
      status: "active",
      messages: [],
      startedAt: now,
      updatedAt: now,
    };
    let sessions = [...state.sessions, session];
    const live = sessions.filter((s) => s.status !== "ended");
    if (live.length > MAX_LIVE_SESSIONS) {
      const oldestId = live[0].id;
      sessions = sessions.map((s) => (s.id === oldestId ? { ...s, status: "ended" as const } : s));
    }
    // Beendete Sessions nur als kurze Historie behalten.
    const ended = sessions.filter((s) => s.status === "ended").slice(-4);
    setState({ ...state, sessions: [...ended, ...sessions.filter((s) => s.status !== "ended")] });
  } else if (existing.title !== title && title) {
    // Titel nachziehen, wenn er erst später bekannt wird (z. B. Heldenname).
    setState({
      ...state,
      sessions: state.sessions.map((s) => (s.key === key ? { ...s, title } : s)),
    });
  }
  return {
    user(text) {
      const t = text.trim();
      if (!t) return;
      pushMessage(key, { role: "user", text: t, at: Date.now() }, "waiting");
    },
    assistant(text) {
      const t = text.trim();
      if (!t) return;
      pushMessage(key, { role: "assistant", text: t, at: Date.now() }, "active");
    },
    note(text) {
      const t = text.trim();
      if (!t) return;
      pushMessage(key, { role: "system", text: t, at: Date.now() });
    },
    end() {
      const sessions = state.sessions.map((s) =>
        s.key === key && s.status !== "ended" ? { ...s, status: "ended" as const } : s,
      );
      setState({ ...state, sessions });
    },
  };
}

export const CHAT_LIVE_KIND_LABEL: Record<ChatLiveKind, string> = {
  npc: "NPC",
  fastweb: "FastWeb",
  auskunft: "Auskunft",
  dsa: "DSA",
  "dsa-gruppe": "DSA-Gruppe",
};
