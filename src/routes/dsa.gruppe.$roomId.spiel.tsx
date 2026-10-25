import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { getDsaModel } from "@/lib/dsaModelPreference";
import { ArrowLeft, Loader2, Maximize2, Minimize2, ScrollText, Send } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getFreshAccessToken } from "@/auth/freshToken";
import { parseMasterTurn, type MasterCheck, type SpokenLine } from "@/game/dsa/llmAdventure";
import { resolveSceneImage, sceneCaption } from "@/game/dsa/sceneImages";
import { portraitFor } from "@/game/dsa/portraits";
import { rollAttributeCheck, rollTalentCheck } from "@/game/dsa/pendingMasterNotes";
import { defaultTalents } from "@/game/dsa/advancement";
import { TALENTS } from "@/game/dsa/rules/talents";
import { playDiceRoll } from "@/audio/sfx";
import { useSettings } from "@/audio/SettingsContext";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";

const ENTER_SUBMIT_KEY = "dsa:composer:enterSubmits";
function readEnterSubmits(): boolean {
  if (typeof localStorage === "undefined") return true;
  const v = localStorage.getItem(ENTER_SUBMIT_KEY);
  return v === null ? true : v === "1";
}

export const Route = createFileRoute("/dsa/gruppe/$roomId/spiel")({
  head: () => ({ meta: [
    { title: "Gemeinsames Abenteuer – SCHMERZ·RADIO DSA" },
    { name: "description", content: "Die DSA-Gruppenrunde mit euren Helden und Spielleiter Tjark." },
    { property: "og:title", content: "Gemeinsames Abenteuer – SCHMERZ·RADIO DSA" },
    { property: "og:description", content: "Die DSA-Gruppenrunde mit euren Helden und Spielleiter Tjark." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
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
  hero_snapshot: {
    name?: string;
    className?: string;
    classId?: string;
    geschlecht?: string;
    portraitDataUrl?: string;
    le?: number;
    leMax?: number;
    attrs?: Record<string, number>;
  } | null;
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
  host_user_id: string;
  collect_started_at?: string | null;
}

const COLLECT_WINDOW_MS = 30_000;
const EXTEND_MS = 20_000;
const MAX_EXTENSIONS = 5;
const EXTEND_PREFIX = "⏳";

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
  const membersRef = useRef<MemberRow[]>([]);
  const roomRef = useRef<RoomRow | null>(null);
  const isCoarse = useCoarsePointer();
  const { sfxVolume } = useSettings();
  const [imageZoomed, setImageZoomed] = useState(false);
  const [enterSubmits, setEnterSubmits] = useState<boolean>(() => readEnterSubmits());
  useEffect(() => {
    try {
      localStorage.setItem(ENTER_SUBMIT_KEY, enterSubmits ? "1" : "0");
    } catch { /* ignore */ }
  }, [enterSubmits]);
  useEffect(() => {
    membersRef.current = members;
  }, [members]);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  // Zoom: Escape schließt, Szenenwechsel setzt zurück.
  useEffect(() => {
    if (!imageZoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImageZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageZoomed]);
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
          .select("id,name,status,turn_idx,summary,ap_awarded,host_user_id,collect_started_at")
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
    // Sofort einmal pingen, sonst zeigt die Liste den eigenen Spieler
    // bis zum ersten Intervall-Tick als „abwesend" (Schwelle 60 s,
    // Intervall 25 s — passt, solange `last_seen_at` beim Mount frisch
    // ist; nach Tab-Parken durch Mobile-Safari ist es das nicht mehr).
    void call("heartbeat");
    const onVis = () => {
      if (document.visibilityState === "visible") void call("heartbeat");
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      clearInterval(hb);
      document.removeEventListener("visibilitychange", onVis);
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
    let lastCheck: MasterCheck | null = null;
    for (const m of messages) {
      if (m.role === "master") {
        const parsed = parseMasterTurn(m.content);
        if (parsed.sceneTag) lastSceneTag = parsed.sceneTag;
        lastCheck = parsed.check;
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
    return { items: out, sceneTag: lastSceneTag, check: lastCheck };
  }, [messages, user?.id]);

  // Szenenwechsel setzt den Bild-Zoom zurück.
  useEffect(() => {
    setImageZoomed(false);
  }, [turns.sceneTag]);

  // Bedenkzeit-Verlängerungen dieser Runde (Systemzeilen nach der letzten Meister-Wende).
  const extensionsUsed = useMemo(() => {
    let n = 0;
    for (const m of messages) {
      if (m.role === "master") n = 0;
      else if (m.role === "system" && m.content.startsWith(EXTEND_PREFIX)) n++;
    }
    return n;
  }, [messages]);

  // Countdown: basiert auf dem serverseitigen Fensterbeginn (inkl. Verlängerungen).
  const collectStart = room?.collect_started_at ?? null;
  useEffect(() => {
    if (pending.length === 0 || !collectStart) {
      setSecondsLeft(null);
      advanceFiredRef.current = null;
      return;
    }
    const startedAt = new Date(collectStart).getTime();
    const batchKey = collectStart;
    const tick = () => {
      const left = Math.max(0, Math.round((COLLECT_WINDOW_MS - (Date.now() - startedAt)) / 1000));
      setSecondsLeft(left);
      // Gastgeber offline → pausieren (er rückt beim Heartbeat selbst vor).
      const hostNow = membersRef.current.find(
        (m) => m.user_id === roomRef.current?.host_user_id,
      );
      const hostAbsentNow =
        !hostNow ||
        Date.now() - new Date(hostNow.last_seen_at).getTime() > 60_000;
      if (left <= 0 && advanceFiredRef.current !== batchKey && !hostAbsentNow) {
        advanceFiredRef.current = batchKey;
        void call("advance");
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending.length === 0, collectStart]);

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
        body: JSON.stringify({ action, roomId, model: getDsaModel(), ...extra }),
      });
      if (resp.status === 401) {
        token = await getFreshAccessToken(true);
        if (token) {
          resp = await fetch("/api/public/dsa-group", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action, roomId, model: getDsaModel(), ...extra }),
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

  async function submitAction(opts?: { outtime?: boolean }) {
    const raw = draft.trim();
    if (!raw) return;
    const txt =
      opts?.outtime && !/^outtime[:\s]/i.test(raw) ? `Outtime: ${raw}` : raw;
    setDraft("");
    await call("submitAction", { text: txt });
  }

  if (!user) {
    return <div className="min-h-screen bg-[#1a120a] p-8 text-[#f1e6c8]">Bitte anmelden.</div>;
  }
  if (!room) return <div className="min-h-screen bg-[#1a120a] p-8 text-[#f1e6c8]">Lade …</div>;

  const me = members.find((m) => m.user_id === user.id);
  const mySlot = me?.slot && me.slot >= 1 && me.slot <= 3 ? me.slot : null;
  const hasPending = pending.some((p) => p.user_id === user.id);
  const isDone = room.status === "done";

  const hostMember = members.find((m) => m.user_id === room.host_user_id);
  const hostAbsent =
    !hostMember ||
    Date.now() - new Date(hostMember.last_seen_at).getTime() > 60_000;
  const hostIsMe = room.host_user_id === user.id;
  const showHostPause = hostAbsent && !hostIsMe && !isDone;

  function myTaw(talentId: string): number {
    const snap = me?.hero_snapshot;
    const table = snap?.classId ? defaultTalents(snap.classId) : {};
    const v = table[talentId];
    return typeof v === "number" ? v : 0;
  }

  // [CHECK: …] des letzten Meister-Zugs: lokal würfeln und das Ergebnis
  // als eigene Aktion ([PROBE]-Zeile) einreichen — wie im Solo-Modus.
  function handleRollCheck() {
    const check = turns.check;
    const snap = me?.hero_snapshot;
    if (!check || !snap) return;
    if (sfxVolume > 0) playDiceRoll(0.6 * sfxVolume);
    let line: string | null = null;
    if (check.talentId) {
      line = rollTalentCheck(
        check.talentId,
        snap.attrs ?? {},
        myTaw(check.talentId),
        check.modifier,
      ).line;
    } else if (check.attr) {
      const value = snap.attrs?.[check.attr] ?? 10;
      const r = rollAttributeCheck(value, check.modifier);
      const mod =
        check.modifier === 0 ? "±0" : check.modifier > 0 ? `+${check.modifier}` : `${check.modifier}`;
      line = `[PROBE] ${check.attr} ${mod}: 1W20=${r.roll} gegen ${r.target} — ${r.success ? "gelungen" : "misslungen"}`;
    }
    if (line) void call("submitAction", { text: line });
  }

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
              {mySlot ? (
                <Link
                  to="/dsa/$slot"
                  params={{ slot: String(mySlot) }}
                  search={{
                    view: "sheet",
                    returnTo: `/dsa/gruppe/${roomId}/spiel`,
                  }}
                  title="Charakterbogen"
                  className="inline-flex items-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a]"
                >
                  <ScrollText className="h-3.5 w-3.5" strokeWidth={2.5} />
                  <span>Bogen</span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        {/* Scene image: Pergament-Vignette, Untertitel, Zoom wie im Solo-Modus */}
        {imgSrc && (
          <figure className="relative m-0 w-full bg-black/80">
            <button
              type="button"
              onClick={() => setImageZoomed(true)}
              title="Bild vergrößern"
              className="relative block w-full cursor-zoom-in focus:outline-none overflow-hidden"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse 72% 78% at 50% 50%, #000 58%, transparent 100%)",
                maskImage:
                  "radial-gradient(ellipse 72% 78% at 50% 50%, #000 58%, transparent 100%)",
              }}
            >
              <img
                src={imgSrc}
                alt={sceneCaption(turns.sceneTag) ?? "Szene"}
                loading="lazy"
                className="w-full h-32 sm:h-48 object-cover opacity-90 sepia-[.25] saturate-[.85]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: "inset 0 0 40px 12px rgba(120, 85, 40, 0.35)" }}
              />
            </button>
            {sceneCaption(turns.sceneTag) && (
              <figcaption className="pointer-events-none absolute bottom-1 left-0 right-0 text-center font-serif italic text-xs tracking-wide text-[#f1e6c8]/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
                ❧ {sceneCaption(turns.sceneTag)} ❧
              </figcaption>
            )}
          </figure>
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
                  {!showHostPause && secondsLeft != null && ` · Tjark erzählt weiter in ${secondsLeft}s …`}
                  {!showHostPause && secondsLeft != null && (
                    <button
                      type="button"
                      onClick={() => void call("extend")}
                      disabled={busy || extensionsUsed >= MAX_EXTENSIONS}
                      title={`Verlängert die Runde für alle um ${EXTEND_MS / 1000} Sekunden`}
                      className="ml-auto not-italic rounded border border-[#3a2c1a]/50 bg-[#fbf2d8] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a] disabled:opacity-40"
                    >
                      +20 s ({MAX_EXTENSIONS - extensionsUsed})
                    </button>
                  )}
                </div>
              )}
              {turns.check && !isDone && !hasPending && !busy && me?.hero_snapshot && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <span className="font-serif italic text-[#2a1f10]/80">
                    Tjark verlangt eine {turns.check.talentId ? "Talentprobe" : "Probe"} auf{" "}
                    {turns.check.label}
                    {turns.check.modifier !== 0 &&
                      ` (${turns.check.modifier > 0 ? "erschwert um " : "erleichtert um "}${Math.abs(turns.check.modifier)})`}
                    {" — "}
                    {turns.check.talentId
                      ? (() => {
                          const def = TALENTS.find((x) => x.id === turns.check!.talentId);
                          const taw = myTaw(turns.check!.talentId!);
                          const probe = def?.probe
                            .map((a) => `${a} ${me.hero_snapshot!.attrs?.[a] ?? "?"}`)
                            .join(" · ");
                          return `${probe} · TaW ${taw}${taw === 0 ? " (ungelernt)" : ""}`;
                        })()
                      : `dein Wert: ${turns.check.attr ? (me.hero_snapshot.attrs?.[turns.check.attr] ?? "?") : "?"}`}
                  </span>
                  <button
                    type="button"
                    onClick={handleRollCheck}
                    className="inline-flex items-center gap-2 rounded border-2 border-[#3a2c1a] bg-[#f1e6c8] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#2a1f10] shadow-[0_2px_0_rgba(0,0,0,0.35)] hover:-translate-y-px transition-transform"
                  >
                    🎲 {turns.check.talentId ? "3W20 würfeln" : "W20 würfeln"}
                  </button>
                </div>
              )}
              {showHostPause && (
                <div className="rounded border-2 border-[#3a2c1a]/50 bg-[#fbf2d8] px-3 py-2 font-serif text-sm text-[#2a1f10]">
                  ⏸ Der Gastgeber ist gerade offline — das Spiel pausiert.
                  Sobald er zurück ist, geht es weiter.
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
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing &&
                        !isCoarse &&
                        enterSubmits &&
                        !busy &&
                        draft.trim()
                      ) {
                        e.preventDefault();
                        void submitAction();
                      }
                    }}
                    placeholder={
                      hasPending
                        ? "Deine Aktion liegt vor — du kannst sie noch ändern, bis Tjark weitererzählt."
                        : "Was tust du?"
                    }
                    rows={2}
                    disabled={busy}
                    className="flex-1 resize-none rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-3 py-2 font-sans text-base leading-relaxed text-[#2a1f10] placeholder:text-[#2a1f10]/40 focus:outline-none focus:ring-2 focus:ring-[#3a2c1a]/40 disabled:opacity-50"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => void submitAction({ outtime: true })}
                      disabled={busy || !draft.trim()}
                      title="Als Outtime-Frage an Tjark (Regeln, Welt, Meta) schicken"
                      className="inline-flex items-center justify-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a] disabled:opacity-50"
                    >
                      Outtime
                    </button>
                    <button
                      type="button"
                      onClick={() => void submitAction()}
                      disabled={busy || !draft.trim()}
                      className="inline-flex items-center justify-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#3a2c1a] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#f1e6c8] hover:bg-[#2a1f10] disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
                      {hasPending ? "Ändern" : "Sagen"}
                    </button>
                    {!hasPending && (
                      <button
                        type="button"
                        onClick={() => void call("submitAction", { text: "(hält sich zurück und beobachtet das Geschehen)" })}
                        disabled={busy}
                        title="Diese Runde nichts tun — beschleunigt Tjarks nächste Antwort"
                        className="inline-flex items-center justify-center rounded border-2 border-[#3a2c1a]/60 bg-transparent px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a] disabled:opacity-50"
                      >
                        Fertig
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-[#2a1f10]/60">
                  <span />
                  {!isCoarse && (
                    <label className="hidden sm:inline-flex items-center gap-1.5 cursor-pointer select-none normal-case tracking-normal text-[11px] text-[#2a1f10]/70 hover:text-[#2a1f10]">
                      <input
                        type="checkbox"
                        checked={enterSubmits}
                        onChange={(e) => setEnterSubmits(e.target.checked)}
                        className="h-3 w-3 accent-[#3a2c1a]"
                      />
                      Enter = Abschicken
                    </label>
                  )}
                  <span>{draft.length}/500</span>
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
                const snap = m.hero_snapshot;
                const portraitSrc =
                  snap?.portraitDataUrl ||
                  (snap?.classId
                    ? portraitFor(snap.classId, snap.geschlecht)
                    : null);
                return (
                  <li
                    key={m.user_id}
                    className="flex items-stretch gap-2 rounded border-2 border-[#3a2c1a]/40 bg-[#fbf2d8] px-2 py-1.5"
                  >
                    {portraitSrc ? (
                      <img
                        src={portraitSrc}
                        alt={snap?.name ? `Porträt von ${snap.name}` : "Porträt"}
                        className="h-14 w-14 flex-none rounded border border-[#3a2c1a]/40 object-cover sepia-[0.35]"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-serif text-sm">{snap?.name ?? "?"}</div>
                      <div className="truncate opacity-70">{snap?.className}</div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span>
                          LE {snap?.le ?? "?"}/{snap?.leMax ?? "?"}
                        </span>
                        {stale && (
                          <span className="text-[10px] uppercase text-amber-700">abwesend</span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>

      {imgSrc && imageZoomed && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4 sm:p-8"
          onClick={() => setImageZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setImageZoomed(false)}
            title="Schließen"
            className="absolute top-3 left-3 z-10 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-2 py-1 text-[#2a1f10] hover:bg-[#f1d99a]"
          >
            ✕
          </button>
          <img
            src={imgSrc}
            alt="Szene (vergrößert)"
            className="max-h-full max-w-full object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
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
