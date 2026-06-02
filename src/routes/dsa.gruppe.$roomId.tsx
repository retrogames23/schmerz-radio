import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Crown, LogOut, Play, UserX } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  SLOT_INDICES,
  type SlotIndex,
} from "@/components/dsa-standalone/slotStorage";
import { cloudFetchAllHeroes } from "@/components/dsa-standalone/cloudHeroSync";
import type { DsaHero } from "@/game/types";
import { DSA_SETTINGS } from "@/game/dsa/llmAdventure";

export const Route = createFileRoute("/dsa/gruppe/$roomId")({
  component: VorzimmerPage,
});

interface RoomRow {
  id: string;
  name: string;
  setting: string;
  status: string;
  max_players: number;
  include_npc_companions: boolean;
  host_user_id: string;
}
interface MemberRow {
  user_id: string;
  ready: boolean;
  hero_snapshot: unknown;
  slot: number;
}

function VorzimmerPage() {
  const { roomId } = useParams({ from: "/dsa/gruppe/$roomId" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [heroes, setHeroes] = useState<Record<SlotIndex, DsaHero | null>>({ 1: null, 2: null, 3: null });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/dsa/gruppe" });
      return;
    }
    let alive = true;
    async function loadAll() {
      const [{ data: r }, { data: ms }, h] = await Promise.all([
        supabase.from("dsa_group_rooms").select("*").eq("id", roomId).maybeSingle(),
        supabase.from("dsa_group_members").select("user_id, ready, hero_snapshot, slot").eq("room_id", roomId),
        cloudFetchAllHeroes(),
      ]);
      if (!alive) return;
      setRoom(r as RoomRow | null);
      setMembers((ms ?? []) as MemberRow[]);
      setHeroes(h);
    }
    void loadAll();
    const ch = supabase
      .channel(`dsa_group_room_${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "dsa_group_rooms", filter: `id=eq.${roomId}` }, () => void loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "dsa_group_members", filter: `room_id=eq.${roomId}` }, () => void loadAll())
      .subscribe();
    return () => {
      alive = false;
      void supabase.removeChannel(ch);
    };
  }, [roomId, user, navigate]);

  useEffect(() => {
    if (room?.status === "active") {
      navigate({ to: "/dsa/gruppe/$roomId/spiel", params: { roomId } });
    }
  }, [room?.status, roomId, navigate]);

  async function call(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    setError(null);
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
      return true;
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;
  if (!room) return <div className="min-h-screen bg-[#1a120a] p-8 text-[#f1e6c8]">Lade Raum …</div>;

  const setting = DSA_SETTINGS.find((s) => s.id === room.setting);
  const isHost = room.host_user_id === user.id;
  const myMember = members.find((m) => m.user_id === user.id);
  const allReady = members.length >= 2 && members.every((m) => m.ready && m.hero_snapshot);

  async function pickHero(slot: SlotIndex) {
    const hero = heroes[slot];
    if (!hero) return;
    await call("pickHero", { slot, hero });
  }
  async function toggleReady() {
    if (!myMember?.hero_snapshot) {
      setError("Wähle zuerst einen Helden.");
      return;
    }
    await call("setReady", { ready: !myMember.ready });
  }

  return (
    <div className="min-h-screen w-full bg-[#1a120a] text-[#f1e6c8]">
      <header className="border-b border-[#3a2c1a] bg-[#241a0e]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/dsa/gruppe" className="inline-flex items-center gap-1 rounded border border-[#3a2c1a] px-2 py-1 text-[10px] uppercase tracking-wider opacity-70 hover:opacity-100">
            <ArrowLeft className="h-3 w-3" /> Lobby
          </Link>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.3em] opacity-60">Vorzimmer</div>
            <h1 className="font-serif text-xl">{room.name}</h1>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <p className="mb-4 text-sm opacity-80">
          Setting: <strong>{setting?.title ?? room.setting}</strong>
          {room.include_npc_companions && " · Brem & Yelva am Tisch"}
          {" · "}max. {room.max_players} Spieler
        </p>

        {error && <div className="mb-3 rounded border border-red-700/60 bg-red-900/30 p-2 text-sm text-red-200">{error}</div>}

        <section className="mb-6">
          <h2 className="mb-2 text-xs uppercase tracking-[0.3em] opacity-70">Wähle deinen Helden</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SLOT_INDICES.map((slot) => {
              const h = heroes[slot];
              const picked = myMember?.slot === slot && myMember.hero_snapshot;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={!h || busy}
                  onClick={() => pickHero(slot)}
                  className={`rounded border p-3 text-left text-sm ${picked ? "border-[#c9a84c] bg-[#3a2c1a]" : "border-[#3a2c1a] bg-[#241a0e] hover:bg-[#3a2c1a]"} disabled:opacity-40`}
                >
                  <div className="text-[10px] uppercase opacity-60">Slot {slot}</div>
                  {h ? (
                    <>
                      <div className="font-serif text-base">{h.name}</div>
                      <div className="text-xs opacity-70">{h.className}</div>
                      <div className="mt-1 text-[11px] opacity-60">LE {h.le}/{h.leMax}{h.ae != null ? ` · AE ${h.ae}` : ""}</div>
                    </>
                  ) : (
                    <p className="italic opacity-60">Leer — im Solo-Bereich würfeln</p>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] opacity-60">
            Noch kein Held? <Link to="/dsa/helden" className="underline">Im Solo-Bereich einen würfeln</Link> und hier zurückkommen.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xs uppercase tracking-[0.3em] opacity-70">Mitspieler ({members.length}/{room.max_players})</h2>
          <div className="space-y-2">
            {members.map((m) => {
              const snap = m.hero_snapshot as { name?: string; className?: string } | null;
              const isHostRow = m.user_id === room.host_user_id;
              return (
                <div key={m.user_id} className="flex items-center justify-between rounded border border-[#3a2c1a] bg-[#241a0e] px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    {isHostRow && <Crown className="h-3.5 w-3.5 text-[#c9a84c]" />}
                    <span>{snap?.name ?? "(noch kein Held)"}</span>
                    {snap?.className && <span className="text-xs opacity-60">— {snap.className}</span>}
                    {m.user_id === user.id && <span className="text-[10px] uppercase tracking-wider opacity-60">(du)</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {m.ready ? <Check className="h-4 w-4 text-green-400" /> : <span className="text-[10px] uppercase opacity-50">wartet</span>}
                    {isHost && m.user_id !== user.id && (
                      <button type="button" title="Entfernen" onClick={() => call("kick", { targetUserId: m.user_id })} className="rounded p-1 opacity-50 hover:bg-black/30 hover:opacity-100">
                        <UserX className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={async () => {
              if (await call("leave")) navigate({ to: "/dsa/gruppe" });
            }}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded border border-[#3a2c1a] px-3 py-2 text-xs uppercase tracking-wider opacity-70 hover:opacity-100"
          >
            <LogOut className="h-3 w-3" /> Raum verlassen
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleReady}
              disabled={busy}
              className={`rounded border-2 px-4 py-2 text-xs font-bold uppercase tracking-wider ${myMember?.ready ? "border-green-600 bg-green-700 text-white" : "border-[#3a2c1a] bg-[#3a2c1a] text-[#f1e6c8]"} hover:opacity-90`}
            >
              {myMember?.ready ? "Bereit ✓" : "Bereit"}
            </button>
            {isHost && (
              <button
                type="button"
                disabled={!allReady || busy}
                onClick={() => call("start")}
                className="inline-flex items-center gap-1 rounded border-2 border-[#c9a84c] bg-[#c9a84c] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1a120a] hover:bg-[#e0bf65] disabled:opacity-40"
              >
                <Play className="h-3.5 w-3.5" /> Abenteuer starten
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}