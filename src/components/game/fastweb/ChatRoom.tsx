import { useEffect, useRef, useState } from "react";
import { useFastWebChat } from "./useFastWebChat";

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function fmtCountdown(until: number): string {
  const ms = Math.max(0, until - Date.now());
  const mins = Math.ceil(ms / 60000);
  if (mins >= 60) return `${Math.ceil(mins / 60)}h`;
  return `${mins} Min.`;
}

export function FastWebChatRoom() {
  const chat = useFastWebChat(true);
  const [input, setInput] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(chat.playerName);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll nach unten bei neuer Nachricht
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.messages.length]);

  // Countdown alle 30s neu rendern (für „Raum schläft — noch ~X Min.")
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!chat.sleeping) return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [chat.sleeping]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    setInput("");
    await chat.send(t);
  };

  const disabled = chat.sleeping || chat.count >= chat.cap;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#000",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "4px 8px",
          borderBottom: "1px solid #0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#001a00",
        }}
      >
        <span style={{ color: "#0f0" }}>
          #amiga-zone · {chat.sleeping ? "0" : "5"} user online
        </span>
        <span style={{ color: chat.sleeping ? "#ff8" : "#9f9" }}>
          {chat.sleeping
            ? `[ Raum schläft — noch ~${chat.sleepingUntil ? fmtCountdown(chat.sleepingUntil) : "?"} ]`
            : ""}
        </span>
      </div>

      {/* Message-Liste */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: "auto",
          padding: "6px 8px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {chat.messages.length === 0 && (
          <div style={{ color: "#5a5" }}>
            (Raum ist still. Schreib was, oder warte einen Moment — die anderen
            user quatschen meist von alleine los.)
          </div>
        )}
        {chat.messages.map((m) => {
          const color =
            m.kind === "player" ? "#ff8" : m.kind === "system" ? "#888" : "#9f9";
          return (
            <div key={m.id} style={{ marginBottom: 2 }}>
              <span style={{ color: "#5a5" }}>[{fmtTime(m.ts)}]</span>{" "}
              <span style={{ color }}>&lt;{m.persona}&gt;</span>{" "}
              <span style={{ color: "#cfc" }}>{m.text}</span>
            </div>
          );
        })}
        {chat.busy && (
          <div style={{ color: "#666", fontStyle: "italic" }}>
            … jemand tippt
          </div>
        )}
      </div>

      {/* Error */}
      {chat.error && (
        <div
          style={{
            padding: "2px 8px",
            background: "#330",
            color: "#ff8",
            borderTop: "1px solid #660",
            fontSize: 11,
          }}
        >
          ⚠ {chat.error}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 8px",
          borderTop: "1px solid #0f0",
          background: "#001a00",
        }}
      >
        {editingName ? (
          <>
            <span style={{ color: "#0f0" }}>&lt;</span>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => {
                chat.setPlayerName(nameDraft);
                setEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  chat.setPlayerName(nameDraft);
                  setEditingName(false);
                }
              }}
              autoFocus
              maxLength={24}
              style={{
                background: "#000",
                color: "#ff8",
                border: "1px solid #0f0",
                fontFamily: "monospace",
                fontSize: 12,
                padding: "1px 4px",
                width: 140,
              }}
            />
            <span style={{ color: "#0f0" }}>&gt;</span>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setNameDraft(chat.playerName);
              setEditingName(true);
            }}
            title="Username ändern"
            style={{
              background: "transparent",
              color: "#ff8",
              border: "none",
              padding: 0,
              fontFamily: "monospace",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            &lt;{chat.playerName}&gt;
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder={
            disabled
              ? chat.sleeping
                ? "Raum schläft — komm später wieder."
                : "Tageskontingent erreicht."
              : "Nachricht eingeben…"
          }
          maxLength={200}
          style={{
            flex: 1,
            background: "#000",
            color: "#cfc",
            border: "1px solid #0f0",
            fontFamily: "monospace",
            fontSize: 12,
            padding: "2px 6px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          style={{
            background: disabled ? "#222" : "#003300",
            color: "#0f0",
            border: "1px solid #0f0",
            fontFamily: "monospace",
            fontSize: 12,
            padding: "2px 8px",
            cursor: disabled ? "default" : "pointer",
          }}
        >
          send
        </button>
      </form>
    </div>
  );
}