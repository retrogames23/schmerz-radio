import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  const [pending, setPending] = useState<{ user_id: string; hero_name: string; action: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    async function reload() {
      const [{ data: r }, { data: ms }, { data: msg }, { data: pa }] = await Promise.all([
        supabase.from("dsa_group_rooms").select("id,name,status,turn_idx,summary,ap_awarded").eq("id", roomId).maybeSingle(),
        supabase.from("dsa_group_members").select("user_id,ready,hero_snapshot,last_seen_at").eq("room_id", roomId),
        supabase.from("dsa_group_messages").select("*").eq("room_id", roomId).order("idx", { ascending: true }),
        supabase.from("dsa_group_pending_actions").select("user_id,hero_name,action").eq("room_id", roomId),
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
      .on("postgres_changes", { event: "*", schema: "public", table: "dsa_group_messages", filter: `room_id=eq.${roomId}` }, () => void reload())
      .on("postgres_changes", { event: "*", schema: "public", table: "dsa_group_pending_actions", filter: `room_id=eq.${roomId}` }, () => void reload())
      .on("postgres_changes", { event: "*", schema: "public", table: "dsa_group_rooms", filter: `id=eq.${roomId}` }, () => void reload())
      .on("postgres_changes", { event: "*", schema: "public", table: "dsa_group_members", filter: `room_id=eq.${roomId}` }, () => void reload())
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

  // Countdown for collect window: starts at first pending action.
  useEffect(() => {
    if (pending.length === 0) {
      setSecondsLeft(null);
      return;
    }
    const started = Date.now();
    const tick = () => {
      const left = Math.max(0, Math.round((COLLECT_WINDOW_MS - (Date.now() - started)) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
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
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const resp = await fetch("/api/public/dsa-group", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ action, roomId, ...extra }),
      });
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
  const hasPending = pending.some((p) => p.user_id === user.id);
  const isDone = room.status === "done";

  return (
    <div className="min-h-screen w-full bg-[#1a120a] text-[#f1e6c8]">
      <header className="border-b border-[#3a2c1a] bg-[#241a0e] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/dsa/gruppe" className="inline-flex items-center gap-1 rounded border border-[#3a2c1a] px-2 py-1 text-[10px] uppercase tracking-wider opacity-70 hover:opacity-100">
            <ArrowLeft className="h-3 w-3" /> Lobby
          </Link>
          <h1 className="font-serif text-lg">{room.name}</h1>
          <div className="text-[10px] uppercase tracking-wider opacity-60">Runde {room.turn_idx}</div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 sm:px-6 md:grid-cols-[1fr_240px]">
        <section className="flex min-h-[60vh] flex-col rounded border border-[#3a2c1a] bg-[#241a0e]">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <p className="text-sm opacity-60">Tjark setzt sich gleich an den Tisch …</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="mb-3 text-sm leading-relaxed">
                  {m.role === "master" ? (
                    <div className="whitespace-pre-wrap text-[#f1e6c8]">{m.content}</div>
                  ) : m.role === "player" ? (
                    <div className="whitespace-pre-wrap text-[#c9a84c]">
                      <span className="text-xs uppercase tracking-wider opacity-70">{m.author_hero_name ?? "Spieler"}: </span>
                      {m.content}
                    </div>
                  ) : (
                    <div className="text-xs italic opacity-60">{m.content}</div>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
          {!isDone && (
            <div className="border-t border-[#3a2c1a] p-3">
              {pending.length > 0 && (
                <p className="mb-2 text-[11px] uppercase tracking-wider opacity-70">
                  Gesammelte Aktionen ({pending.length}): {pending.map((p) => p.hero_name).join(", ")}
                  {secondsLeft != null && ` · Tjark webt in ${secondsLeft}s …`}
                </p>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void submitAction();
                    }
                  }}
                  placeholder={hasPending ? "Du hast diese Runde schon gehandelt — warte auf Tjark." : "Was tust du?"}
                  rows={2}
                  maxLength={500}
                  disabled={hasPending || busy}
                  className="flex-1 rounded border border-[#3a2c1a] bg-[#1a120a] px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={submitAction}
                  disabled={hasPending || busy || !draft.trim()}
                  className="rounded border-2 border-[#c9a84c] bg-[#c9a84c] p-2 text-[#1a120a] hover:bg-[#e0bf65] disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          {isDone && <div className="border-t border-[#3a2c1a] p-3 text-sm opacity-80">Das Abenteuer ist beendet. AP wurde vergeben.</div>}
        </section>

        <aside className="rounded border border-[#3a2c1a] bg-[#241a0e] p-3">
          <h2 className="mb-2 text-[10px] uppercase tracking-[0.3em] opacity-70">Gruppe</h2>
          <ul className="space-y-2 text-xs">
            {members.map((m) => {
              const stale = Date.now() - new Date(m.last_seen_at).getTime() > 60_000;
              return (
                <li key={m.user_id} className="rounded border border-[#3a2c1a] bg-[#1a120a] px-2 py-1">
                  <div className="font-serif text-sm">{m.hero_snapshot?.name ?? "?"}</div>
                  <div className="opacity-70">{m.hero_snapshot?.className}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span>LE {m.hero_snapshot?.le ?? "?"}/{m.hero_snapshot?.leMax ?? "?"}</span>
                    {stale && <span className="text-[10px] uppercase text-amber-400">abwesend</span>}
                  </div>
                </li>
              );
            })}
          </ul>
          {error && <p className="mt-3 rounded border border-red-700/60 bg-red-900/30 p-2 text-xs text-red-200">{error}</p>}
        </aside>
      </main>
    </div>
  );
}