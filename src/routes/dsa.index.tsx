import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Dices, LogIn, LogOut, ScrollText, Trash2 } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { AuthDialog } from "@/auth/AuthDialog";
import {
  SLOT_INDICES,
  loadSlotCharacter,
  saveSlotCharacter,
  type SlotIndex,
} from "@/components/dsa-standalone/slotStorage";
import type { DsaCharacterSummary } from "@/game/types";

const CANONICAL = "https://whisperquest.app/dsa";
const TITLE = "DSA-Soloabenteuer mit KI-Meister – kostenlos online spielen";
const DESCRIPTION =
  "Spiele DSA-Soloabenteuer (Das Schwarze Auge) online mit KI-Spielleiter Tjark. Helden würfeln, Pen-&-Paper-Tafelrunde in Aventurien, drei Speicherplätze – kostenlos im Browser, ohne Download.";
const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Was ist ein DSA-Soloabenteuer?",
    a: "Ein DSA-Soloabenteuer ist eine Pen-&-Paper-Runde im Schwarzen Auge, die du allein spielst. Statt einer menschlichen Spielleitung erzählt hier der KI-Meister Tjark die Szene, würfelt für die NPCs und reagiert auf deine Entscheidungen. Eine Sitzung dauert rund eine Stunde.",
  },
  {
    q: "Brauche ich DSA-Regelkenntnisse, um zu spielen?",
    a: "Nein. Du würfelst deinen Helden in wenigen Klicks, der KI-Meister erklärt die Welt und führt dich durch Proben, Kampf und Dialoge. Wer das Schwarze Auge kennt, fühlt sich sofort heimisch; alle anderen lernen es nebenbei.",
  },
  {
    q: "Kostet das DSA-Online-Abenteuer etwas?",
    a: "Nein. Die DSA-Tafelrunde auf WhisperQuest ist kostenlos im Browser spielbar. Ohne Anmeldung bleibt dein Held lokal in diesem Browser, mit Login synchronisieren wir deine drei Speicherplätze.",
  },
  {
    q: "In welcher Epoche Aventuriens spielt das Abenteuer?",
    a: "Im Jahr 20 nach Hal — Reichsbehüter Brin verteidigt das Mittelreich gegen den Dritten Orkensturm. Eine klassische Phase der DSA-Geschichte mit Intrigen, Schwertkampf und Magie.",
  },
];

export const Route = createFileRoute("/dsa/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:site_name", content: "WhisperQuest" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoGame",
          name: "DSA-Soloabenteuer mit KI-Meister",
          alternateName: "Das Schwarze Auge – Solo-Tafelrunde",
          url: CANONICAL,
          description: DESCRIPTION,
          inLanguage: "de",
          applicationCategory: "Game",
          genre: ["Pen & Paper", "Rollenspiel", "Fantasy"],
          gamePlatform: "Web Browser",
          operatingSystem: "Any",
          playMode: "SinglePlayer",
          author: { "@type": "Organization", name: "WhisperQuest" },
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: DsaLanding,
});

function DsaLanding() {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [slots, setSlots] = useState<Record<SlotIndex, DsaCharacterSummary | null>>(
    () => ({ 1: null, 2: null, 3: null }),
  );

  // Slots aus localStorage laden (clientseitig).
  useEffect(() => {
    setSlots({
      1: loadSlotCharacter(1),
      2: loadSlotCharacter(2),
      3: loadSlotCharacter(3),
    });
  }, []);

  function handleDelete(slot: SlotIndex) {
    if (!window.confirm(`Held in Slot ${slot} wirklich löschen?`)) return;
    saveSlotCharacter(slot, null);
    setSlots((s) => ({ ...s, [slot]: null }));
  }

  function goToSlot(slot: SlotIndex) {
    navigate({ to: "/dsa/$slot", params: { slot: String(slot) } });
  }

  return (
    <div className="min-h-screen w-full bg-[#1a120a] text-[#f1e6c8]">
      {/* Header */}
      <header className="border-b border-[#3a2c1a] bg-[#241a0e]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] opacity-60">
              WhisperQuest
            </div>
            <h1 className="font-serif text-xl sm:text-2xl">
              DSA-Soloabenteuer mit KI-Meister
            </h1>
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

      {/* Pitch */}
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 text-center">
        <p className="font-serif text-base sm:text-lg leading-relaxed text-[#f1e6c8]/90">
          Spiele <strong>Das Schwarze Auge</strong> als Soloabenteuer im
          Browser. Würfle deinen Helden, wähle ein Setting und erlebe rund
          eine Stunde klassische Pen-&-Paper-Tafelrunde mit dem KI-Meister
          Tjark. Aventurien im Jahr 20 nach Hal — Reichsbehüter Brin verteidigt das
          Mittelreich gegen den Dritten Orkensturm. Dein Tisch, dein Held,
          dein Bogen.
        </p>
        {!user && (
          <p className="mt-4 text-xs uppercase tracking-wider opacity-60">
            Ohne Anmeldung werden deine Helden nur in diesem Browser gespeichert.
          </p>
        )}
      </section>

      {/* Slots */}
      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
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

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
        <dl className="space-y-5">
          {FAQS.map((f) => (
            <div key={f.q}>
              <dt className="font-serif text-base text-[#f1e6c8]">{f.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-[#f1e6c8]/80">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="border-t border-[#3a2c1a] py-4 text-center text-[10px] uppercase tracking-wider opacity-60">
        <Link to="/" className="hover:opacity-100">
          Zum Stammspiel
        </Link>
      </footer>

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
  character: DsaCharacterSummary | null;
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