import { createFileRoute, Link } from "@tanstack/react-router";
import { LogIn, LogOut, Swords, Users } from "lucide-react";
import { useState } from "react";
import landingBg from "@/assets/dsa/landing-bg.jpg";
import { ImpressumOverlay } from "@/components/game/ImpressumOverlay";
import { OpenSourceOverlay } from "@/components/game/OpenSourceOverlay";
import { CreditsOverlay } from "@/components/game/CreditsOverlay";
import { DonationModal } from "@/components/donation/DonationModal";
import { useAuth } from "@/auth/AuthContext";
import { AuthDialog } from "@/auth/AuthDialog";

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
  {
    q: "Was ist der Gruppenmodus?",
    a: "Im Gruppenmodus sitzen zwei bis vier menschliche Spieler an einer gemeinsamen Tafelrunde, Tjark bleibt der KI-Meister. Du eröffnest einen Raum, gibst ihm einen Namen (optional ein Passwort) und wählst ein Setting; deine Mitspieler treten mit ihren bereits gespeicherten Helden bei. Sobald alle „Bereit“ klicken, beginnt das Abenteuer. Eine Anmeldung ist Pflicht — der Spielstand wandert sonst nicht zwischen den Geräten.",
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
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a120a] text-[#f1e6c8]">
      {/* Stimmungsvolles Aventurien-Hintergrundbild mit sanfter Animation */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div
          className="dsa-landing-bg absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${landingBg})` }}
        />
        {/* Lesbarkeits-Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a120a]/40 via-[#1a120a]/70 to-[#1a120a]/95" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#3a2c1a] bg-[#241a0e]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] opacity-60">
              WhisperQuest
            </div>
            <h1 className="font-serif text-xl sm:text-2xl">
              DSA-Soloabenteuer mit KI-Meister
            </h1>
          </div>
          <AuthControl />
        </div>
      </header>

      {/* Pitch + CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16 text-center">
        <p className="font-serif text-base sm:text-lg leading-relaxed text-[#f1e6c8]/90">
          Spiele <strong>Das Schwarze Auge</strong> als Soloabenteuer im
          Browser. Würfle deinen Helden, wähle ein Setting und erlebe rund
          eine Stunde klassische Pen-&-Paper-Tafelrunde mit dem KI-Meister
          Tjark. Aventurien im Jahr 20 nach Hal — Reichsbehüter Brin verteidigt
          das Mittelreich gegen den Dritten Orkensturm. Dein Tisch, dein Held,
          dein Bogen.
        </p>
        <div className="mt-8">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/dsa/helden"
              className="inline-flex items-center justify-center gap-2 rounded border-2 border-[#c9a84c] bg-[#c9a84c] px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#1a120a] shadow-xl transition-colors hover:bg-[#e0bf65]"
            >
              <Swords className="h-4 w-4" strokeWidth={2.5} />
              DSA-Solo-Abenteuer mit KI-Gefährten starten
            </Link>
            <Link
              to="/dsa/gruppe"
              className="inline-flex items-center justify-center gap-2 rounded border-2 border-[#c9a84c] bg-[#c9a84c] px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#1a120a] shadow-xl transition-colors hover:bg-[#e0bf65]"
            >
              <Users className="h-4 w-4" strokeWidth={2.5} />
              DSA-Gruppenabenteuer mit menschlichen Gefährten starten
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-12 sm:px-6">
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

      {/* Disclaimer */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-8 sm:px-6">
        <div className="rounded border border-[#3a2c1a]/60 bg-[#1a120a]/80 p-4 text-[11px] leading-relaxed text-[#f1e6c8]/50">
          <p className="mb-2">
            Bei WhisperQuest handelt es sich um ein rein privates, nicht-kommerzielles Fan-Projekt, das in keiner offiziellen Verbindung zu Ulisses Spiele steht.
          </p>
          <p>
            DAS SCHWARZE AUGE, AVENTURIEN, DERE, MYRANOR, THARUN, UTHURIA, RIESLAND und THE DARK EYE sind eingetragene Marken der Ulisses Spiele GmbH. Es werden keine urheberrechtlich geschützten Texte oder offiziellen Grafiken eins zu eins vervielfältigt.
          </p>
        </div>
      </section>

      <DsaFooter />
    </div>
  );
}

function DsaFooter() {
  const [impressumOpen, setImpressumOpen] = useState(false);
  const [ossOpen, setOssOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);

  return (
    <footer className="relative z-10 border-t border-[#3a2c1a] bg-[#1a120a]/80 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <p className="text-sm leading-relaxed text-[#f1e6c8]/80">
          Dieses DSA-Online-Abenteuer ist ein Spiel innerhalb des
          Point&amp;Click-Adventures{" "}
          <a
            href="https://whisperquest.app/"
            className="underline decoration-[#c9a84c]/60 underline-offset-2 hover:text-[#c9a84c]"
          >
            Whisper Quest
          </a>
          , kann aber auch unabhängig gespielt werden.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-[#f1e6c8]/70">
          <button
            type="button"
            onClick={() => setDonationOpen(true)}
            className="transition hover:text-[#c9a84c]"
          >
            ☕ Buy me a coffee
          </button>
          <span aria-hidden="true" className="opacity-40">·</span>
          <a
            href="https://lovable.dev/invite/LN0I260"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition hover:text-[#c9a84c]"
          >
            <span className="text-base leading-none">♥</span>
            <span>Built with Lovable</span>
          </a>
          <span aria-hidden="true" className="opacity-40">·</span>
          <button
            type="button"
            onClick={() => setImpressumOpen(true)}
            className="transition hover:text-[#c9a84c]"
          >
            Impressum
          </button>
          <span aria-hidden="true" className="opacity-40">·</span>
          <button
            type="button"
            onClick={() => setCreditsOpen(true)}
            className="transition hover:text-[#c9a84c]"
          >
            Inspirationen &amp; Dank
          </button>
          <span aria-hidden="true" className="opacity-40">·</span>
          <a
            href="mailto:stephan.doerner@posteo.de"
            className="transition hover:text-[#c9a84c]"
          >
            Kontakt: stephan.doerner@posteo.de
          </a>
          <span aria-hidden="true" className="opacity-40">·</span>
          <button
            type="button"
            onClick={() => setOssOpen(true)}
            className="transition hover:text-[#c9a84c]"
          >
            Freie-Software-Komponenten &amp; Lizenzen
          </button>
        </div>
      </div>

      <ImpressumOverlay open={impressumOpen} onClose={() => setImpressumOpen(false)} />
      <OpenSourceOverlay open={ossOpen} onClose={() => setOssOpen(false)} />
      <CreditsOverlay open={creditsOpen} onClose={() => setCreditsOpen(false)} />
      <DonationModal
        open={donationOpen}
        onClose={() => setDonationOpen(false)}
        variant="manual"
      />
    </footer>
  );
}

function AuthControl() {
  const { user, signOut, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  if (loading) return null;
  return (
    <div className="text-xs">
      {user ? (
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline max-w-[180px] truncate opacity-70">
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
        <>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="inline-flex items-center gap-1 rounded border border-[#c9a84c] bg-[#c9a84c] px-2.5 py-1.5 font-bold uppercase tracking-wider text-[#1a120a] hover:bg-[#e0bf65]"
          >
            <LogIn className="h-3 w-3" /> Anmelden
          </button>
          <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
        </>
      )}
    </div>
  );
}