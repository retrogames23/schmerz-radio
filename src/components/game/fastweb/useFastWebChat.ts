import { useCallback, useEffect, useRef, useState } from "react";
import {
  FASTWEB_PERSONA_IDS,
  type FastWebPersonaId,
} from "@/game/fastWebChat/personas";
import {
  FASTWEB_BYE_LINES,
  FASTWEB_WAKE_LINES,
} from "@/game/fastWebChat/promptBuilder";
import { getFreshAccessToken } from "@/auth/freshToken";
import {
  onCloudError,
} from "@/llm/cloudLlmRuntime";

export interface FastWebChatMessage {
  id: string;
  ts: number;
  persona: string; // FastWebPersonaId | playerName | "system"
  text: string;
  kind: "persona" | "player" | "system";
}

interface PersistedState {
  v: 1;
  messages: FastWebChatMessage[];
  count: number; // messages since last wake
  sleepingUntil: number | null; // unix ms
}

const STORAGE_KEY = "fastweb-chat-v1";
const MAX_BUFFER = 200;
const HARD_CAP = 50;
const SLEEP_DURATION_MS = 60 * 60 * 1000; // 1h
const IDLE_MIN_MS = 10_000;
const IDLE_MAX_MS = 15_000;

function randInt(a: number, b: number) {
  return Math.floor(a + Math.random() * (b - a + 1));
}

function newId(): string {
  return `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed && parsed.v === 1 && Array.isArray(parsed.messages)) {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return { v: 1, messages: [], count: 0, sleepingUntil: null };
}

function saveState(s: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export interface FastWebChatApi {
  messages: FastWebChatMessage[];
  count: number;
  cap: number;
  sleeping: boolean;
  sleepingUntil: number | null;
  busy: boolean;
  error: string | null;
  playerName: string;
  setPlayerName: (n: string) => void;
  send: (text: string) => Promise<void>;
  reset: () => void;
}

export function useFastWebChat(active: boolean): FastWebChatApi {
  const [state, setState] = useState<PersistedState>(() =>
    typeof window === "undefined"
      ? { v: 1, messages: [], count: 0, sleepingUntil: null }
      : loadState(),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerNameState] = useState<string>(() => {
    if (typeof window === "undefined") return "layard_e67";
    try {
      return localStorage.getItem("fastweb-chat-username") ?? "layard_e67";
    } catch {
      return "layard_e67";
    }
  });

  const stateRef = useRef(state);
  stateRef.current = state;
  const busyRef = useRef(false);

  const persist = useCallback((next: PersistedState) => {
    setState(next);
    saveState(next);
  }, []);

  const setPlayerName = useCallback((n: string) => {
    const safe = n.trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24) || "layard_e67";
    setPlayerNameState(safe);
    try {
      localStorage.setItem("fastweb-chat-username", safe);
    } catch {
      /* ignore */
    }
  }, []);

  const appendMessage = useCallback(
    (msg: FastWebChatMessage, countsTowardCap: boolean) => {
      const prev = stateRef.current;
      const messages = [...prev.messages, msg].slice(-MAX_BUFFER);
      const count = countsTowardCap ? prev.count + 1 : prev.count;
      persist({ ...prev, messages, count });
    },
    [persist],
  );

  // Wake-up beim Mount, falls Cooldown abgelaufen
  useEffect(() => {
    if (!active) return;
    const s = stateRef.current;
    if (s.sleepingUntil && Date.now() >= s.sleepingUntil) {
      const wake = FASTWEB_WAKE_LINES[randInt(0, FASTWEB_WAKE_LINES.length - 1)];
      const wakeMsg: FastWebChatMessage = {
        id: newId(),
        ts: Date.now(),
        persona: wake.persona,
        text: wake.text,
        kind: "persona",
      };
      persist({
        v: 1,
        messages: [...s.messages, wakeMsg].slice(-MAX_BUFFER),
        count: 0,
        sleepingUntil: null,
      });
    }
  }, [active, persist]);

  // Error-Listener (Donation-Gate)
  useEffect(() => {
    if (!active) return;
    return onCloudError((e) => {
      if (e.code === "donation_required") {
        setError(e.message);
      }
    });
  }, [active]);

  const triggerSleep = useCallback(() => {
    const prev = stateRef.current;
    const until = Date.now() + SLEEP_DURATION_MS;
    const byes = [...FASTWEB_BYE_LINES]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    let messages = [...prev.messages];
    let t = Date.now();
    for (const bye of byes) {
      t += 1500;
      messages.push({
        id: newId(),
        ts: t,
        persona: bye.persona,
        text: bye.text,
        kind: "persona",
      });
    }
    messages = messages.slice(-MAX_BUFFER);
    persist({ v: 1, messages, count: prev.count, sleepingUntil: until });
  }, [persist]);

  const callServer = useCallback(
    async (
      trigger: "idle" | "player",
      chooseFrom?: FastWebPersonaId[],
    ): Promise<void> => {
      if (busyRef.current) return;
      const s = stateRef.current;
      if (s.sleepingUntil && Date.now() < s.sleepingUntil) return;
      if (s.count >= HARD_CAP) {
        triggerSleep();
        return;
      }
      busyRef.current = true;
      setBusy(true);
      try {
        const token = await getFreshAccessToken();
        if (!token) {
          setError("Bitte melde dich an, um den Chat zu nutzen.");
          return;
        }
        // Historie: nur sichtbare persona/player-Zeilen
        const history = s.messages
          .filter((m) => m.kind !== "system")
          .slice(-20)
          .map((m) => ({
            persona:
              m.kind === "player"
                ? playerName.replace(/[^a-z0-9_-]/gi, "").toLowerCase() ||
                  "layard_e67"
                : m.persona,
            text: m.text,
          }));
        const resp = await fetch("/api/public/fastweb-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            history,
            trigger,
            chooseFrom: chooseFrom ?? FASTWEB_PERSONA_IDS,
            playerName,
          }),
        });
        if (!resp.ok) {
          if (resp.status === 402) {
            try {
              const j = (await resp.json()) as { error?: string };
              setError(j?.error ?? "Cloud-Limit erreicht.");
            } catch {
              setError("Cloud-Limit erreicht.");
            }
            triggerSleep();
            return;
          }
          if (resp.status === 429) {
            setError("FastWeb-Server überlastet. Warte einen Moment.");
            return;
          }
          setError("FastWeb-Verbindung gestört.");
          return;
        }
        const data = (await resp.json()) as {
          persona?: string;
          text?: string;
        };
        if (!data.persona || !data.text) {
          setError("Leere Antwort vom Server.");
          return;
        }
        setError(null);
        appendMessage(
          {
            id: newId(),
            ts: Date.now(),
            persona: data.persona,
            text: data.text,
            kind: "persona",
          },
          true,
        );
        // Falls Cap erreicht → Schlafenssequenz
        const after = stateRef.current;
        if (after.count >= HARD_CAP) {
          setTimeout(() => triggerSleep(), 2500);
        }
      } catch (e) {
        console.warn("fastweb-chat send failed", e);
        setError("FastWeb-Verbindung verloren.");
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [appendMessage, playerName, triggerSleep],
  );

  // Idle-Ticker
  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      const wait = randInt(IDLE_MIN_MS, IDLE_MAX_MS);
      timer = setTimeout(async () => {
        if (cancelled) return;
        const s = stateRef.current;
        const sleeping = !!s.sleepingUntil && Date.now() < s.sleepingUntil;
        if (!sleeping && !document.hidden && !busyRef.current) {
          await callServer("idle");
        }
        schedule();
      }, wait);
    };
    schedule();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [active, callServer]);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim().slice(0, 200);
      if (!clean) return;
      const s = stateRef.current;
      if (s.sleepingUntil && Date.now() < s.sleepingUntil) return;
      if (s.count >= HARD_CAP) return;
      appendMessage(
        {
          id: newId(),
          ts: Date.now(),
          persona: playerName,
          text: clean,
          kind: "player",
        },
        true,
      );
      // Kurze Tipp-Verzögerung
      await new Promise((r) => setTimeout(r, randInt(400, 900)));
      await callServer("player");
    },
    [appendMessage, callServer, playerName],
  );

  const reset = useCallback(() => {
    persist({ v: 1, messages: [], count: 0, sleepingUntil: null });
    setError(null);
  }, [persist]);

  const sleeping = !!state.sleepingUntil && Date.now() < state.sleepingUntil;

  return {
    messages: state.messages,
    count: state.count,
    cap: HARD_CAP,
    sleeping,
    sleepingUntil: state.sleepingUntil,
    busy,
    error,
    playerName,
    setPlayerName,
    send,
    reset,
  };
}