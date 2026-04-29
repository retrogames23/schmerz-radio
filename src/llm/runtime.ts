export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmRuntimeStatus {
  kind: "local" | "cloud";
  ready: boolean;
  /** Optionaler Lade-Fortschritt (nur lokal). */
  loading?: { text: string; pct?: number };
  /** Hat sich der Modus wegen lokalem Fehler auf Cloud umgestellt? */
  fallback?: boolean;
  error?: string | null;
}

export interface LlmRuntime {
  status: LlmRuntimeStatus;
  send(messages: ChatMsg[], opts?: { signal?: AbortSignal }): Promise<string>;
  dispose?(): void;
}