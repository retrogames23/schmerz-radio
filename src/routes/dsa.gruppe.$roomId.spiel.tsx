import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Loader2, Maximize2, Minimize2, ScrollText, Send } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getFreshAccessToken } from "@/auth/freshToken";
import { parseMasterTurn, type SpokenLine } from "@/game/dsa/llmAdventure";
import { resolveSceneImage } from "@/game/dsa/sceneImages";

export const Route = createFileRoute("/dsa/gruppe/$roomId/spiel")({
  component: SpielraumPage,
});

interface MessageRow {
  id: string;
  idx: number;
  role: string;
  author_user_id: string | null;
  author_hero_name: string | null;
  content: string;
  created_at: string;
}
interface MemberRow {
  user_id: string;
  ready: boolean;
  hero_snapshot: { name?: string; className?: string; le?: number; leMax?: number } | null;
  last_seen_at: string;
  slot: number | null;
}
interface RoomRow {
  id: string;
  name: string;
  status: string;
  turn_idx: number;
  summary: string;
  ap_awarded: boolean;
}

const COLLECT_WINDOW_MS = 20_000;

function SpielraumPage() {
  const { roomId } = useParams({ from: "/dsa/gruppe/$roomId/spiel" });
  const { user } = useAuth();
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [pending, setPending] = useState<{ user_id: string; hero_name: string; action: string }[]>(
    [],
  );
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const advanceFiredRef = useRef<string | null>(null);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!user) return;
    let alive = true;
    async function reload() {
      const [{ data: r }, { data: ms }, { data: msg }, { data: pa }] = await Promise.all([
        supabase
          .from("dsa_group_rooms")
          .select("id,name,status,turn_idx,summary,ap_awarded")
          .eq("id", roomId)
          .maybeSingle(),
        supabase
          .from("dsa_group_members")
          .select("user_id,ready,hero_snapshot,last_seen_at,slot")
          .eq("room_id", roomId),
        supabase
          .from("dsa_group_messages")
          .select("*")
          .eq("room_id", roomId)
          .order("idx", { ascending: true }),
        supabase
          .from("dsa_group_pending_actions")
          .select("user_id,hero_name,action")
          .eq("room_id", roomId),
      ]);
      if (!alive) return;
      setRoom(r as RoomRow | null);
      setMembers((ms ?? []) as MemberRow[]);
      setMessages((msg ?? []) as MessageRow[]);
      setPending((pa ?? []) as { user_id: string; hero_name: string; action: string }[]);
    }
    void reload();
    const ch = supabase
      .channel(`dsa_group_spiel_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dsa_group_messages",
          filter: `room_id=eq.${roomId}`,
        },
        () => void reload(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dsa_group_pending_actions",
          filter: `room_id=eq.${roomId}`,
        },
        () => void reload(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dsa_group_rooms", filter: `id=eq.${roomId}` },
        () => void reload(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dsa_group_members",
          filter: `room_id=eq.${roomId}`,
        },
        () => void reload(),
      )
      .subscribe();
    // Heartbeat every 25s
    const hb = setInterval(() => void call("heartbeat"), 25_000);
    return () => {
      alive = false;
      clearInterval(hb);
      void supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Parsed transcript: walk messages in order, parse master content into
  // speaker-tagged lines, keep latest scene tag for the header image.
  const turns = useMemo(() => {
    const out: Array<
      | { id: string; kind: "master"; lines: SpokenLine[] }
      | { id: string; kind: "player"; name: string; text: string; mine: boolean }
      | { id: string; kind: "system"; text: string }
    > = [];
    let lastSceneTag: string | null = null;
    for (const m of messages) {
      if (m.role === "master") {
        const parsed = parseMasterTurn(m.content);
        if (parsed.sceneTag) lastSceneTag = parsed.sceneTag;
        if (parsed.lines.length > 0) {
          out.push({ id: m.id, kind: "master", lines: parsed.lines });
        }
      } else if (m.role === "player") {
        out.push({
          id: m.id,
          kind: "player",
          name: m.author_hero_name ?? "Spieler",
          text: m.content,
          mine: m.author_user_id === user?.id,
        });
      } else {
        out.push({ id: m.id, kind: "system", text: m.content });
      }
    }
    return { items: out, sceneTag: lastSceneTag };
  }, [messages, user?.id]);

  // Countdown for collect window: starts at first pending action.
  useEffect(() => {
    if (pending.length === 0) {
      setSecondsLeft(null);
      advanceFiredRef.current = null;
      return;
    }
    const batchKey = `${pending[0]?.user_id ?? ""}:${pending.length}`;
    const started = Date.now();
    const tick = () => {
      const left = Math.max(0, Math.round((COLLECT_WINDOW_MS - (Date.now() - started)) / 1000));
      setSecondsLeft(left);
      if (left <= 0 && advanceFiredRef.current !== batchKey) {
        advanceFiredRef.current = batchKey;
        void call("advance");
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending.length === 0 ? 0 : pending[0]?.user_id]);

  async function call(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    try {
      let token = await getFreshAccessToken();
      if (!token) {
        setError("Bitte melde dich erneut an.");
        return false;
      }
      let resp = await fetch("/api/public/dsa-group", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, roomId, ...extra }),
      });
      if (resp.status === 401) {
        token = await getFreshAccessToken(true);
        if (token) {
          resp = await fetch("/api/public/dsa-group", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action, roomId, ...extra }),
          });
        }
      }
      const data = (await resp.json()) as { ok?: boolean; error?: string };
      if (!resp.ok || !data.ok) {
        setError(data.error ?? "Fehler.");
        return false;
      }
      setError(null);
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function submitAction() {
    const txt = draft.trim();
    if (!txt) return;
    setDraft("");
    await call("submitAction", { text: txt });
  }

  if (!user) {
    return <div className="min-h-screen bg-[#1a120a] p-8 text-[#f1e6c8]">Bitte anmelden.</div>;
  }
  if (!room) return <div className="min-h-screen bg-[#1a120a] p-8 text-[#f1e6c8]">Lade …</div>;

  const me = members.find((m) => m.user_id === user.id);
  void me;
  const hasPending = pending.some((p) => p.user_id === user.id);
  const isDone = room.status === "done";

  const imgSrc = resolveSceneImage(turns.sceneTag);

  return (
    <div className="min-h-screen w-full bg-[#1a120a] p-2 sm:p-6">
      <div className="dsa-adventure-shell relative mx-auto w-full max-w-6xl overflow-hidden rounded-md shadow-2xl">
        {/* Header */}
        <div className="dsa-adventure-header px-4 sm:px-6 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] opacity-70">
                <Link
                  to="/dsa/gruppe"
                  className="inline-flex items-center gap-1 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-2 py-1 text-[#2a1f10] hover:bg-[#f1d99a]"
                >
                  <ArrowLeft className="h-3 w-3" strokeWidth={2.5} /> Lobby
                </Link>
                <span className="ml-1">Tjark erzählt · Runde {room.turn_idx}</span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl mt-1 truncate">{room.name}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Vollbild verlassen" : "Vollbild"}
                className="hidden sm:inline-flex items-center justify-center rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-2 py-1.5 text-[#2a1f10] hover:bg-[#f1d99a]"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                )}
              </button>
              <Link
                to="/dsa/helden"
                title="Charakterbogen"
                className="inline-flex items-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a]"
              >
                <ScrollText className="h-3.5 w-3.5" strokeWidth={2.5} />
                <span>Bogen</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scene image */}
        {imgSrc && (
          <div className="relative w-full bg-black/80">
            <img
              src={imgSrc}
              alt="Szene"
              loading="lazy"
              className="w-full h-32 sm:h-48 object-cover opacity-90"
            />
          </div>
        )}

        {/* Body grid: transcript + group aside */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_240px]">
          <section className="flex min-h-[55vh] flex-col">
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 text-[#2a1f10]">
              {turns.items.length === 0 ? (
                <p className="font-serif italic text-[#2a1f10]/70">
                  Tjark setzt sich gleich an den Tisch …
                </p>
              ) : (
                turns.items.map((t) =>
                  t.kind === "master" ? (
                    <MasterTurn key={t.id} lines={t.lines} />
                  ) : t.kind === "player" ? (
                    <PlayerTurn key={t.id} name={t.name} text={t.text} />
                  ) : (
                    <div key={t.id} className="text-xs italic text-[#2a1f10]/60">
                      {t.text}
                    </div>
                  ),
                )
              )}
              {pending.length > 0 && (
                <div className="flex items-center gap-2 font-serif italic text-[#2a1f10]/70">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gesammelte Aktionen ({pending.length}):{" "}
                  {pending.map((p) => p.hero_name).join(", ")}
                  {secondsLeft != null && ` · Tjark webt in ${secondsLeft}s …`}
                </div>
              )}
              {error && (
                <div className="rounded border-2 border-red-900/40 bg-red-100/60 px-3 py-2 text-sm text-red-900">
                  {error}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {!isDone ? (
              <div className="dsa-adventure-header border-t border-[#3a2c1a]/30 px-3 sm:px-4 py-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.slice(0, 500))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void submitAction();
                      }
                    }}
                    placeholder={
                      hasPending
                        ? "Du hast diese Runde schon gehandelt — warte auf Tjark."
                        : "Was tust du?"
                    }
                    rows={2}
                    disabled={hasPending || busy}
                    className="flex-1 resize-none rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-3 py-2 font-sans text-base leading-relaxed text-[#2a1f10] placeholder:text-[#2a1f10]/40 focus:outline-none focus:ring-2 focus:ring-[#3a2c1a]/40 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={submitAction}
                    disabled={hasPending || busy || !draft.trim()}
                    className="inline-flex items-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#3a2c1a] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#f1e6c8] hover:bg-[#2a1f10] disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Sagen
                  </button>
                </div>
                <div className="mt-2 text-right text-[10px] uppercase tracking-wider text-[#2a1f10]/60">
                  {draft.length}/500
                </div>
              </div>
            ) : (
              <div className="dsa-adventure-header border-t border-[#3a2c1a]/30 px-4 py-3 text-sm text-[#2a1f10]/80">
                Das Abenteuer ist beendet. AP wurde vergeben.
              </div>
            )}
          </section>

          <aside className="border-l border-[#3a2c1a]/30 bg-[#e8dab8]/60 p-3">
            <h2 className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#2a1f10]/70">
              Gruppe
            </h2>
            <ul className="space-y-2 text-xs text-[#2a1f10]">
              {members.map((m) => {
                const stale = Date.now() - new Date(m.last_seen_at).getTime() > 60_000;
                return (
                  <li
                    key={m.user_id}
                    className="rounded border-2 border-[#3a2c1a]/40 bg-[#fbf2d8] px-2 py-1.5"
                  >
                    <div className="font-serif text-sm">{m.hero_snapshot?.name ?? "?"}</div>
                    <div className="opacity-70">{m.hero_snapshot?.className}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span>
                        LE {m.hero_snapshot?.le ?? "?"}/{m.hero_snapshot?.leMax ?? "?"}
                      </span>
                      {stale && (
                        <span className="text-[10px] uppercase text-amber-700">abwesend</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MasterTurn({ lines }: { lines: SpokenLine[] }) {
  return (
    <div className="space-y-1.5">
      {lines.map((l, i) => (
        <div key={i} className="font-serif text-[15px] leading-relaxed">
          {(i === 0 || lines[i - 1].speaker !== l.speaker) && (
            <span
              className={
                "inline-block mr-2 text-[10px] font-bold uppercase tracking-widest align-middle px-1.5 py-0.5 rounded " +
                (l.speaker === "TJARK"
                  ? "bg-[#3a2c1a] text-[#f1e6c8]"
                  : l.speaker === "BREM"
                    ? "bg-[#6b3a2a] text-[#f1e6c8]"
                    : "bg-[#3a4a6a] text-[#f1e6c8]")
              }
            >
              {l.speaker === "TJARK"
                ? "Tjark (Meister)"
                : l.speaker === "BREM"
                  ? "Brem (Streuner)"
                  : "Yelva (Elfe)"}
            </span>
          )}
          <span>{l.text}</span>
        </div>
      ))}
    </div>
  );
}

function PlayerTurn({ name, text }: { name: string; text: string }) {
  return (
    <div className="font-serif text-[15px] leading-relaxed italic text-[#2a1f10]/85 pl-3 border-l-2 border-[#3a2c1a]/40">
      <span className="text-[10px] not-italic font-bold uppercase tracking-widest text-[#2a1f10]/60 mr-2">
        {name}
      </span>
      {text}
    </div>
  );
}
