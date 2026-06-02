import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Plus, Users, LogIn, Trash2 } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { AuthDialog } from "@/auth/AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { getFreshAccessToken } from "@/auth/freshToken";
import { DSA_SETTINGS } from "@/game/dsa/llmAdventure";
import gruppeBg from "@/assets/dsa-gruppe-bg.jpg";

const TITLE = "DSA-Gruppenabenteuer – Räume und Lobby";
const DESCRIPTION =
  "Tritt einer DSA-Tafelrunde bei oder eröffne deinen eigenen Raum. Zwei bis vier menschliche Spieler, KI-Meister Tjark, klassische Aventurien-Atmosphäre.";

export const Route = createFileRoute("/dsa/gruppe")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: GruppeLobby,
});

interface RoomRow {
  id: string;
  name: string;
  setting: string;
  status: string;
  max_players: number;
  password_hash: string | null;
  include_npc_companions: boolean;
  host_user_id: string;
  member_count?: number;
}

function GruppeLobby() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    async function load() {
      const [lobbyRes, ownedRes] = await Promise.all([
        supabase
          .from("dsa_group_rooms")
          .select("id, name, setting, status, max_players, password_hash, include_npc_companions, host_user_id")
          .eq("status", "lobby")
          .order("created_at", { ascending: false }),
        supabase
          .from("dsa_group_rooms")
          .select("id, name, setting, status, max_players, password_hash, include_npc_companions, host_user_id")
          .eq("host_user_id", user!.id)
          .neq("status", "done")
          .order("created_at", { ascending: false }),
      ]);
      if (!alive) return;
      if (lobbyRes.error) {
        setError(lobbyRes.error.message);
        return;
      }
      const map = new Map<string, RoomRow>();
      for (const r of ((lobbyRes.data ?? []) as RoomRow[])) map.set(r.id, r);
      for (const r of ((ownedRes.data ?? []) as RoomRow[])) {
        if (!map.has(r.id)) map.set(r.id, r);
      }
      const rows = Array.from(map.values());
      // Mitgliederzahl pro Raum nachladen.
      const ids = rows.map((r) => r.id);
      if (ids.length > 0) {
        const { data: members } = await supabase
          .from("dsa_group_members")
          .select("room_id")
          .in("room_id", ids);
        const counts = new Map<string, number>();
        for (const m of (members ?? []) as { room_id: string }[]) {
          counts.set(m.room_id, (counts.get(m.room_id) ?? 0) + 1);
        }
        for (const r of rows) r.member_count = counts.get(r.id) ?? 0;
      }
      setRooms(rows);
    }
    void load();
    // Realtime: Räume aktualisieren
    const ch = supabase
      .channel("dsa_group_rooms_lobby")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dsa_group_rooms" },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dsa_group_members" },
        () => void load(),
      )
      .subscribe();
    return () => {
      alive = false;
      void supabase.removeChannel(ch);
    };
  }, [user]);

  async function handleJoin(room: RoomRow) {
    if (!user) return;
    setError(null);
    let password: string | null = null;
    if (room.password_hash) {
      const pw = window.prompt(`Passwort für „${room.name}":`);
      if (pw == null) return;
      password = pw;
    }
    setJoining(room.id);
    try {
      const token = await getFreshAccessToken();
      if (!token) {
        setAuthOpen(true);
        setError("Bitte melde dich erneut an, bevor du beitrittst.");
        return;
      }
      const resp = await fetch("/api/public/dsa-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: "join", roomId: room.id, password }),
      });
      const data = (await resp.json()) as { ok?: boolean; error?: string };
      if (!resp.ok || !data.ok) {
        setError(data.error ?? "Beitritt fehlgeschlagen.");
        return;
      }
      navigate({ to: "/dsa/gruppe/$roomId", params: { roomId: room.id } });
    } finally {
      setJoining(null);
    }
  }

  async function handleDelete(room: RoomRow) {
    if (!user) return;
    if (!window.confirm(`Raum „${room.name}" wirklich löschen?`)) return;
    setError(null);
    const token = await getFreshAccessToken();
    if (!token) {
      setAuthOpen(true);
      setError("Bitte melde dich erneut an, bevor du den Raum löschst.");
      return;
    }
    const resp = await fetch("/api/public/dsa-group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ action: "deleteRoom", roomId: room.id }),
    });
    const data = (await resp.json()) as { ok?: boolean; error?: string };
    if (!resp.ok || !data.ok) setError(data.error ?? "Löschen fehlgeschlagen.");
  }

  if (/^\/dsa\/gruppe\/[^/]+/.test(pathname)) {
    return <Outlet />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a120a] text-[#f1e6c8]">
      {/* Animated atmospheric background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85 motion-safe:animate-[gruppeKenBurns_45s_ease-in-out_infinite_alternate]"
          style={{ backgroundImage: `url(${gruppeBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a120a]/45 via-[#1a120a]/55 to-[#1a120a]/85" />
        <div className="absolute inset-0 motion-safe:animate-[gruppeMist_30s_ease-in-out_infinite_alternate] bg-[radial-gradient(ellipse_at_50%_60%,transparent_0%,rgba(26,18,10,0.35)_72%)]" />
      </div>
      <style>{`
        @keyframes gruppeKenBurns {
          0%   { transform: scale(1.05) translate(0, 0); }
          100% { transform: scale(1.15) translate(-1.5%, -1%); }
        }
        @keyframes gruppeMist {
          0%   { opacity: 0.55; }
          100% { opacity: 0.85; }
        }
      `}</style>
      <header className="relative z-10 border-b border-[#3a2c1a] bg-[#241a0e]/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/dsa"
              className="inline-flex items-center gap-1 rounded border border-[#3a2c1a] px-2 py-1 text-[10px] uppercase tracking-wider opacity-70 hover:opacity-100"
            >
              <ArrowLeft className="h-3 w-3" /> Zurück
            </Link>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl">Gruppen-Lobby</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {loading ? (
          <p className="opacity-60">Lade …</p>
        ) : !user ? (
          <div className="rounded border border-[#3a2c1a] bg-[#241a0e]/85 p-6 text-center backdrop-blur-sm">
            <p className="mb-4 text-sm opacity-80">
              Für den Gruppenmodus brauchst du eine Anmeldung — sonst wandert dein Held nicht zwischen Geräten.
            </p>
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="inline-flex items-center gap-2 rounded border-2 border-[#c9a84c] bg-[#c9a84c] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#1a120a] hover:bg-[#e0bf65]"
            >
              <LogIn className="h-4 w-4" /> Anmelden
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-[0.3em] opacity-70">Offene Räume</h2>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded border-2 border-[#c9a84c] bg-[#c9a84c] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1a120a] hover:bg-[#e0bf65]"
              >
                <Plus className="h-4 w-4" /> Neuen Raum eröffnen
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded border border-red-700/60 bg-red-900/30 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {rooms.length === 0 ? (
              <p className="rounded border border-[#3a2c1a] bg-[#241a0e]/85 p-6 text-center text-sm opacity-80 backdrop-blur-sm">
                Aktuell sind keine offenen Räume verfügbar. Eröffne den ersten!
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {rooms.map((r) => {
                  const setting = DSA_SETTINGS.find((s) => s.id === r.setting);
                  const isHost = r.host_user_id === user.id;
                  const full = (r.member_count ?? 0) >= r.max_players;
                  const isActive = r.status !== "lobby";
                  return (
                    <div
                      key={r.id}
                      className="rounded border border-[#3a2c1a] bg-[#241a0e]/85 p-4 backdrop-blur-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-serif text-lg leading-tight">{r.name}</h3>
                        {r.password_hash && <Lock className="h-3.5 w-3.5 opacity-60" />}
                      </div>
                      <p className="text-xs opacity-70">
                        {setting?.title ?? r.setting}
                        {r.include_npc_companions ? " · mit Brem & Yelva" : ""}
                        {isActive ? ` · läuft (${r.status})` : ""}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider opacity-70">
                        <Users className="h-3 w-3" /> {r.member_count ?? 0}/{r.max_players}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={joining === r.id || (full && !isHost && !isActive)}
                          onClick={() =>
                            isHost || isActive
                              ? navigate({ to: "/dsa/gruppe/$roomId", params: { roomId: r.id } })
                              : handleJoin(r)
                          }
                          className="flex-1 rounded border-2 border-[#3a2c1a] bg-[#3a2c1a] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#f1e6c8] hover:bg-[#2a1f10] disabled:opacity-40"
                        >
                          {isHost
                            ? isActive
                              ? "Weiterspielen"
                              : "Zum Vorzimmer"
                            : isActive
                              ? "Wieder einsteigen"
                              : full
                                ? "Voll"
                                : joining === r.id
                                  ? "Trete bei …"
                                  : "Beitreten"}
                        </button>
                        {isHost && (
                          <button
                            type="button"
                            onClick={() => handleDelete(r)}
                            title="Raum löschen"
                            aria-label="Raum löschen"
                            className="rounded border-2 border-red-800/60 bg-transparent px-3 py-2 text-red-300 hover:bg-red-900/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      {createOpen && user && (
        <CreateRoomDialog
          onClose={() => setCreateOpen(false)}
          onCreated={(roomId) => {
            setCreateOpen(false);
            navigate({ to: "/dsa/gruppe/$roomId", params: { roomId } });
          }}
        />
      )}
    </div>
  );
}

function CreateRoomDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (roomId: string) => void;
}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [setting, setSetting] = useState<string>("city");
  const [wishBrief, setWishBrief] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [includeCompanions, setIncludeCompanions] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = DSA_SETTINGS.find((s) => s.id === setting);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError("Raumname muss mindestens 3 Zeichen lang sein.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const token = await getFreshAccessToken();
      if (!token) {
        setError("Bitte melde dich erneut an, bevor du einen Raum erstellst.");
        return;
      }
      const resp = await fetch("/api/public/dsa-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: "create",
          name: name.trim(),
          password: password.trim() || null,
          setting,
          wishBrief: selected?.requiresWish ? wishBrief.trim() : null,
          maxPlayers,
          includeCompanions,
        }),
      });
      const data = (await resp.json()) as { ok?: boolean; roomId?: string; error?: string };
      if (!resp.ok || !data.ok || !data.roomId) {
        setError(data.error ?? "Raum konnte nicht erstellt werden.");
        return;
      }
      onCreated(data.roomId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded border border-[#3a2c1a] bg-[#241a0e] p-6 text-[#f1e6c8]"
      >
        <h2 className="mb-4 font-serif text-xl">Neuen Raum eröffnen</h2>
        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wider opacity-70">Raumname</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            className="w-full rounded border border-[#3a2c1a] bg-[#1a120a] px-3 py-2 text-sm"
            placeholder="z.B. Layards Tafel"
            required
          />
        </label>
        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wider opacity-70">Passwort (optional)</span>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={40}
            className="w-full rounded border border-[#3a2c1a] bg-[#1a120a] px-3 py-2 text-sm"
            placeholder="leer = offen für alle"
          />
        </label>
        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wider opacity-70">Setting</span>
          <select
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
            className="w-full rounded border border-[#3a2c1a] bg-[#1a120a] px-3 py-2 text-sm"
          >
            {DSA_SETTINGS.filter((s) => !s.donorOnly || s.id === "wish").map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          {selected && <p className="mt-1 text-[11px] opacity-60">{selected.blurb}</p>}
        </label>
        {selected?.requiresWish && (
          <label className="mb-3 block text-sm">
            <span className="mb-1 block text-xs uppercase tracking-wider opacity-70">Wunsch-Beschreibung</span>
            <textarea
              value={wishBrief}
              onChange={(e) => setWishBrief(e.target.value)}
              maxLength={600}
              rows={3}
              className="w-full rounded border border-[#3a2c1a] bg-[#1a120a] px-3 py-2 text-sm"
              placeholder="Was sollt ihr erleben? Tjark hält sich daran, solange es zur Aventurien-Lore passt."
            />
          </label>
        )}
        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block text-xs uppercase tracking-wider opacity-70">Max. Spieler</span>
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full rounded border border-[#3a2c1a] bg-[#1a120a] px-3 py-2 text-sm"
            >
              {[2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="flex items-end gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeCompanions}
              onChange={(e) => setIncludeCompanions(e.target.checked)}
              className="h-4 w-4 accent-[#c9a84c]"
            />
            <span className="text-xs">Brem &amp; Yelva als NSC-Gefährten</span>
          </label>
        </div>
        {error && (
          <p className="mb-3 rounded border border-red-700/60 bg-red-900/30 p-2 text-xs text-red-200">{error}</p>
        )}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-[#3a2c1a] px-3 py-2 text-xs uppercase tracking-wider opacity-70 hover:opacity-100"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded border-2 border-[#c9a84c] bg-[#c9a84c] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1a120a] hover:bg-[#e0bf65] disabled:opacity-50"
          >
            {busy ? "Erstelle …" : "Erstellen"}
          </button>
        </div>
      </form>
    </div>
  );
}