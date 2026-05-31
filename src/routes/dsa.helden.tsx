import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Dices, LogIn, LogOut, ScrollText, Trash2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { AuthDialog } from "@/auth/AuthDialog";
import {
  SLOT_INDICES,
  loadSlotHero,
  saveSlotHero,
  slotSessionId,
  type SlotIndex,
} from "@/components/dsa-standalone/slotStorage";
import {
  cloudFetchAllHeroes,
  cloudDeleteHero,
  cloudDeleteSlotAdventures,
  cloudUpsertHero,
} from "@/components/dsa-standalone/cloudHeroSync";
import type { DsaHero } from "@/game/types";
import { availableAp } from "@/game/dsa/advancement";

const CANONICAL = "https://whisperquest.app/dsa/helden";
const TITLE = "DSA-Tafelrunde – Helden- und Abenteuerverwaltung";
const DESCRIPTION =
  "Verwalte deine DSA-Helden, würfle neue Charaktere und setze deine Soloabenteuer in Aventurien fort. Drei Speicherplätze für deine Tafelrunde mit KI-Meister Tjark.";

export const Route = createFileRoute("/dsa/helden")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex,follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: DsaHeroManager,
});

function DsaHeroManager() {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [slots, setSlots] = useState<Record<SlotIndex, DsaHero | null>>(
    () => ({ 1: null, 2: null, 3: null }),
  );

  useEffect(() => {
    // Sofort den lokalen Cache zeigen, damit nichts flackert.
    setSlots({
      1: loadSlotHero(1),
      2: loadSlotHero(2),
      3: loadSlotHero(3),
    });
    if (!user) return;
    // Eingeloggt → Cloud ist die Wahrheit. Spiegeln in localStorage,
    // damit Folge-Navigation ohne Spinner auskommt.
    let cancelled = false;
    (async () => {
      const cloud = await cloudFetchAllHeroes();
      if (cancelled) return;
      // Slots, die lokal gefüllt sind, aber in der Cloud (noch) leer:
      // den lokalen Helden einmalig in die Cloud spiegeln, damit der
      // erste Login von einem zweiten Gerät den gleichen Stand zeigt.
      const merged: Record<SlotIndex, DsaHero | null> = { ...cloud };
      for (const slot of SLOT_INDICES) {
        if (!cloud[slot]) {
          const local = loadSlotHero(slot);
          if (local) {
            merged[slot] = local;
            void cloudUpsertHero(user.id, slot, local);
          }
        }
      }
      setSlots(merged);
      for (const slot of SLOT_INDICES) saveSlotHero(slot, merged[slot]);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleDelete(slot: SlotIndex) {
    if (!window.confirm(`Held in Slot ${slot} wirklich löschen?`)) return;
    const sessionIdToDelete = slotSessionId(slot);
    saveSlotHero(slot, null);
    setSlots((s) => ({ ...s, [slot]: null }));
    if (user) {
      // Cloud-Spiegel ebenfalls leeren, sonst taucht der Held nach
      // einem Reload auf einem anderen Gerät wieder auf.
      await cloudDeleteHero(slot).catch(() => {});
      await cloudDeleteSlotAdventures(slot).catch(() => {});
    }
    try {
      const { getFreshAccessToken } = await import("@/auth/freshToken");
      const token = await getFreshAccessToken().catch(() => null);
      let anonId: string | null = null;
      if (!token) {
        try {
          anonId = window.localStorage.getItem("dsa.anonId");
        } catch {
          anonId = null;
        }
      }
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      await fetch("/api/public/dsa-master", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "abort",
          sessionId: sessionIdToDelete,
          ...(token ? {} : { anonId: anonId ?? "anon000000000000" }),
        }),
      });
    } catch {
      /* Best effort – lokaler Slot ist bereits gelöscht. */
    }
  }

  function goToSlot(slot: SlotIndex) {
    navigate({ to: "/dsa/$slot", params: { slot: String(slot) } });
  }

  return (
    <div className="min-h-screen w-full bg-[#1a120a] text-[#f1e6c8]">
      <header className="border-b border-[#3a2c1a] bg-[#241a0e]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/dsa"
              className="inline-flex items-center gap-1 rounded border border-[#3a2c1a] px-2 py-1 text-[10px] uppercase tracking-wider opacity-70 hover:opacity-100"
            >
              <ArrowLeft className="h-3 w-3" /> Zurück
            </Link>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] opacity-60">
                WhisperQuest
              </div>
              <h1 className="font-serif text-xl sm:text-2xl">
                Helden- und Abenteuerverwaltung
              </h1>
            </div>
          </div>
          <div className="text-xs">
            {loading ? null : user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline opacity-70 max-w-[180px] truncate">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex items-center gap-1 rounded border border-[#3a2c1a] bg-[#1a120a] px-2.5 py-1.5 uppercase tracking-wider hover:bg-[#3a2c1a]"
                >
                  <LogOut className="h-3 w-3" /> Abmelden
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="inline-flex items-center gap-1 rounded border border-[#c9a84c] bg-[#c9a84c] px-2.5 py-1.5 font-bold uppercase tracking-wider text-[#1a120a] hover:bg-[#e0bf65]"
              >
                <LogIn className="h-3 w-3" /> Anmelden
              </button>
            )}
          </div>
        </div>
      </header>

      {!user && (
        <section className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-wider opacity-60">
            Ohne Anmeldung werden deine Helden nur in diesem Browser gespeichert.
          </p>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="mb-4 text-xs uppercase tracking-[0.3em] opacity-70">
          Speicherplätze
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {SLOT_INDICES.map((slot) => (
            <SlotCard
              key={slot}
              slot={slot}
              character={slots[slot]}
              onPlay={() => goToSlot(slot)}
              onDelete={() => handleDelete(slot)}
            />
          ))}
        </div>
      </section>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

function SlotCard({
  slot,
  character,
  onPlay,
  onDelete,
}: {
  slot: SlotIndex;
  character: DsaHero | null;
  onPlay: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="dsa-paper relative overflow-hidden rounded-md px-4 py-5 text-[#2a1f10] shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">
          Slot {slot}
        </span>
        {character && (
          <button
            type="button"
            onClick={onDelete}
            title="Held löschen"
            className="rounded p-1 opacity-50 hover:bg-black/10 hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {character ? (
        <>
          <h3 className="font-serif text-lg leading-tight">{character.name}</h3>
          <p className="text-xs opacity-70">{character.className}</p>
          <p className="mt-2 text-xs">
            LE {character.le}/{character.leMax}
            {character.ae != null ? ` · AE ${character.ae}` : ""}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-wider opacity-70">
            AP {availableAp(character)}
            {(character.apTotal ?? 0) > 0 && (
              <span className="opacity-60"> · gesamt {character.apTotal}</span>
            )}
            {(character.adventuresPlayed ?? 0) > 0 && (
              <span className="opacity-60">
                {" "}
                · {character.adventuresPlayed} Abenteuer
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={onPlay}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#3a2c1a] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#f1e6c8] hover:bg-[#2a1f10]"
          >
            <ScrollText className="h-3.5 w-3.5" strokeWidth={2.5} />
            Weiterspielen
          </button>
        </>
      ) : (
        <>
          <p className="font-serif italic opacity-60">Leer</p>
          <p className="mt-1 text-xs opacity-60">
            Keine Heldin, kein Held, kein Bogen.
          </p>
          <button
            type="button"
            onClick={onPlay}
            className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#f1d99a]"
          >
            <Dices className="h-3.5 w-3.5" strokeWidth={2.5} />
            Neuen Helden würfeln
          </button>
        </>
      )}
    </div>
  );
}