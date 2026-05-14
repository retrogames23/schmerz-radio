import { useState, useRef, useEffect, type ReactNode } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";

/**
 * Amiga-Workbench-Overlay (Gemeinschaftsraum E71, Tür 1530).
 *
 * Simuliert eine Workbench 1.3 mit zwei "Disketten" (Workbench2.0,
 * FastWeb-Disk), Trashcan, mehreren Datei-Fenstern und einem
 * voll navigierbaren FastWeb-Browser. 1997, also alles knapp 90er.
 */

// ============================================================
// FILESYSTEM
// ============================================================

type FileNode =
  | { kind: "file"; name: string; size: number; content: ReactNode }
  | { kind: "drawer"; name: string; children: FileNode[] }
  | { kind: "tool"; name: string; size: number; onOpen: "fastweb" };

const README_TXT = (
  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{`Workbench 2.0 — Schmerz-Edition (Build 39.106)

Hallo Pirat. Diese Boot-Diskette ist patched:
 - PAL/NTSC Auto-Switch
 - SetPatch v2.4
 - PowerPacker decrunch in C:
 - FastWeb v0.9 vorinstalliert (siehe FastWeb-Disk)

Wenn der Cursor blinkt, lebt die Maschine.
Wenn nicht: Reset (Strg + Amiga + Amiga).

— H.
`}</pre>
);

const STARTUP_SEQUENCE = (
  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{`; S:Startup-Sequence
C:SetPatch QUIET
C:Version >NIL:
C:AddBuffers DF0: 25
C:FastMemFirst
C:Assign LIBS: SYS:Libs
C:Assign FONTS: SYS:Fonts
C:Assign FastWeb: FASTWEB:
C:LoadWB DELAY
EndCLI >NIL:
`}</pre>
);

const NOTIZ_TXT = (
  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{`14.06.97

Wenn jemand das hier liest: die Antenne auf dem Dach
ist NICHT vom Hausmeister. Bitte stehen lassen.

Frequenz steht im Block. Block ist im Block.

— D.
`}</pre>
);

const WORKBENCH_DISK: FileNode = {
  kind: "drawer",
  name: "Workbench2.0",
  children: [
    {
      kind: "drawer",
      name: "System",
      children: [
        { kind: "file", name: "Format", size: 7244, content: <em>(Binary tool — kann Disketten formatieren)</em> },
        { kind: "file", name: "DiskCopy", size: 9120, content: <em>(Binary tool — kopiert Disketten)</em> },
        { kind: "file", name: "FixFonts", size: 3344, content: <em>(Binary tool)</em> },
      ],
    },
    {
      kind: "drawer",
      name: "Utilities",
      children: [
        { kind: "file", name: "Clock", size: 5120, content: <em>(zeigt eine Uhr — analog oder digital)</em> },
        { kind: "file", name: "Calculator", size: 6240, content: <em>(Taschenrechner mit RPN-Modus)</em> },
        { kind: "file", name: "More", size: 4880, content: <em>(Text-Pager, scrollt mit SPACE)</em> },
      ],
    },
    {
      kind: "drawer",
      name: "Prefs",
      children: [
        { kind: "file", name: "Pointer", size: 2400, content: <em>(Mauszeiger-Editor, 16×16)</em> },
        { kind: "file", name: "Palette", size: 3120, content: <em>(Farben für 4-Bitplane Workbench)</em> },
        { kind: "file", name: "Serial", size: 4080, content: <em>(Serielle Schnittstelle: 9600 8N1)</em> },
      ],
    },
    { kind: "file", name: "Startup-Sequence", size: 412, content: STARTUP_SEQUENCE },
    { kind: "file", name: "ReadMe.txt", size: 1180, content: README_TXT },
    { kind: "file", name: "Notiz.txt", size: 240, content: NOTIZ_TXT },
  ],
};

const FASTWEB_DISK: FileNode = {
  kind: "drawer",
  name: "FastWeb",
  children: [
    { kind: "tool", name: "FastWeb", size: 184320, onOpen: "fastweb" },
    {
      kind: "drawer",
      name: "Cache",
      children: [
        { kind: "file", name: "index.cache", size: 88200, content: <em>(Browser-Cache, binär)</em> },
        { kind: "file", name: "cookies.dat", size: 240, content: <em>(3 Cookies — start.fastweb.us, amiga-zone.us)</em> },
      ],
    },
    {
      kind: "drawer",
      name: "Bookmarks",
      children: [
        { kind: "file", name: "Bookmarks.txt", size: 480, content: (
          <pre style={{ margin: 0 }}>{`start.fastweb.us
amiga-zone.us
freie-presse.us
gaestebuch.fastweb.us
weltzeit.us
radio.untergrund.us
`}</pre>
        ) },
      ],
    },
    {
      kind: "drawer",
      name: "Downloads",
      children: [
        { kind: "file", name: "turrican2.lha", size: 884800, content: <em>(LhA-Archiv, 880K — entpackt 1.4MB)</em> },
        { kind: "file", name: "mod.spaceDeb", size: 124400, content: <em>(ProTracker MOD, 4-Channel)</em> },
        { kind: "file", name: "deluxe-paint.adf", size: 901120, content: <em>(Diskettenimage 880K, write-protected)</em> },
      ],
    },
  ],
};

// ============================================================
// FASTWEB CONTENT
// ============================================================

type SiteKey =
  | "start.fastweb.us"
  | "amiga-zone.us"
  | "amiga-zone.us/cheats"
  | "amiga-zone.us/mods"
  | "amiga-zone.us/forum"
  | "freie-presse.us"
  | "freie-presse.us/quarantaene"
  | "freie-presse.us/frequenz"
  | "gaestebuch.fastweb.us"
  | "weltzeit.us"
  | "weltzeit.us/wechselkurse"
  | "radio.untergrund.us"
  | "radio.untergrund.us/sendeplan";

function FastLink({ to, onGo, children }: { to: SiteKey; onGo: (s: SiteKey) => void; children: ReactNode }) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onGo(to);
      }}
      style={{ color: "#0000ee", textDecoration: "underline", cursor: "pointer" }}
    >
      {children}
    </a>
  );
}

function siteBody(key: SiteKey, go: (s: SiteKey) => void): { title: string; body: ReactNode } {
  switch (key) {
    case "start.fastweb.us":
      return {
        title: "FastWeb · Start",
        body: (
          <div style={{ fontFamily: "Times, serif", color: "#000022" }}>
            <h1 style={{ background: "#000099", color: "#ffff00", padding: 4, margin: 0 }}>
              FastWeb — Das Tor zur Welt
            </h1>
            <p>Willkommen, Surfer! Die Top-Seiten dieser Woche:</p>
            <ul>
              <li><FastLink to="amiga-zone.us" onGo={go}>amiga-zone.us</FastLink> — alles für den 500er, 1200er, 4000er</li>
              <li><FastLink to="freie-presse.us" onGo={go}>freie-presse.us</FastLink> — Mitteleuropa-Beobachter</li>
              <li><FastLink to="gaestebuch.fastweb.us" onGo={go}>gaestebuch.fastweb.us</FastLink> — sag Hallo!</li>
              <li><FastLink to="weltzeit.us" onGo={go}>weltzeit.us</FastLink> — Uhrzeit, Wetter, Kurse</li>
              <li><FastLink to="radio.untergrund.us" onGo={go}>radio.untergrund.us</FastLink> — Frequenzen außerhalb des Sektornetzes</li>
            </ul>
            <p style={{ fontSize: 12, color: "#666" }}>
              Über 12.418 indizierte Seiten · Hosted in Sunnyvale, CA · Best viewed at 640×480
            </p>
          </div>
        ),
      };
    case "amiga-zone.us":
      return {
        title: "Amiga Zone",
        body: (
          <div style={{ background: "#000", color: "#0f0", fontFamily: "monospace", padding: 8 }}>
            <pre style={{ margin: 0 }}>{`   ___    __  __ ___ ___   _
  / _ |  /  |/  /  _/ _ \\ /_\\
 / __ | / /|_/ // // // /_\\ \\
/_/ |_|/_/  /_/___/____/\\_/\\_\\
        AMIGA ZONE — since 1989`}</pre>
            <p>» 880 KB pro Diskette. PCs können einpacken.</p>
            <p>» Bereiche:</p>
            <ul>
              <li><FastLink to="amiga-zone.us/cheats" onGo={go}>Cheats</FastLink></li>
              <li><FastLink to="amiga-zone.us/mods" onGo={go}>MOD-Sammlung</FastLink></li>
              <li><FastLink to="amiga-zone.us/forum" onGo={go}>Forum</FastLink></li>
              <li><FastLink to="start.fastweb.us" onGo={go}>« zurück zur Startseite</FastLink></li>
            </ul>
          </div>
        ),
      };
    case "amiga-zone.us/cheats":
      return {
        title: "Amiga Zone — Cheats",
        body: (
          <div style={{ background: "#000", color: "#0f0", fontFamily: "monospace", padding: 8 }}>
            <h3>== Cheats ==</h3>
            <pre style={{ margin: 0 }}>{`Lemmings ............ Tippe LEMMINGS im Titelscreen
Turrican II ......... Pause + HELP = Smartbomb
Shadow of the Beast . Auf Titelbild: 1, 9, 8, 9
Monkey Island ....... Im Pub: Insult-Sword auswählen
North & South ....... CTRL+ALT = Frieden, sofort
Speedball 2 ......... Spielername "ICEMAN" = Maxstats`}</pre>
            <p><FastLink to="amiga-zone.us" onGo={go}>« zurück</FastLink></p>
          </div>
        ),
      };
    case "amiga-zone.us/mods":
      return {
        title: "Amiga Zone — MODs",
        body: (
          <div style={{ background: "#000", color: "#0f0", fontFamily: "monospace", padding: 8 }}>
            <h3>== ProTracker MODs ==</h3>
            <pre style={{ margin: 0 }}>{`space_debris.mod      54 KB   ★★★★★
enigma.mod            81 KB   ★★★★★
klisje_paa_klisje.mod 38 KB   ★★★★
condom_corruption.mod 96 KB   ★★★
axel_f.mod            44 KB   ★★★★
chip_in_disco.mod     22 KB   ★★★`}</pre>
            <p>(Download über Diskette FastWeb:Downloads/)</p>
            <p><FastLink to="amiga-zone.us" onGo={go}>« zurück</FastLink></p>
          </div>
        ),
      };
    case "amiga-zone.us/forum":
      return {
        title: "Amiga Zone — Forum",
        body: (
          <div style={{ background: "#000", color: "#0f0", fontFamily: "monospace", padding: 8 }}>
            <h3>== Forum (letzte Beiträge) ==</h3>
            <pre style={{ margin: 0 }}>{`[Hardware]   "Akku-Wechsel A1200 ohne Tod?"   12 Antw.
[Coding]     "Copperlist tearing bei 50Hz"     7 Antw.
[Off-Topic]  "Sektornetz down im Westen?"     34 Antw.
[Trade]      "Tausche A4000T gegen 030+RAM"    2 Antw.
[Mythen]     "104,6 MHz — wer hat schon mal?" 89 Antw.`}</pre>
            <p><FastLink to="amiga-zone.us" onGo={go}>« zurück</FastLink></p>
          </div>
        ),
      };
    case "freie-presse.us":
      return {
        title: "Freie Presse — Mitteleuropa-Beobachter",
        body: (
          <div style={{ fontFamily: "Times, serif", background: "#fdfaf0", padding: 8 }}>
            <h2 style={{ marginTop: 0 }}>Freie Presse</h2>
            <p>Top-Meldungen heute:</p>
            <ul>
              <li><FastLink to="freie-presse.us/quarantaene" onGo={go}>Mandatsgebiet Mitteleuropa: Quarantäne-Zahlen weiter unklar</FastLink></li>
              <li><FastLink to="freie-presse.us/frequenz" onGo={go}>Frequenz 104,6 — Mythos oder Methode?</FastLink></li>
            </ul>
            <p style={{ fontSize: 11, color: "#666" }}>Redaktion: Sunnyvale · Druck: Toronto · ISSN 0935-77-12</p>
            <p><FastLink to="start.fastweb.us" onGo={go}>« Startseite</FastLink></p>
          </div>
        ),
      };
    case "freie-presse.us/quarantaene":
      return {
        title: "Freie Presse — Quarantäne",
        body: (
          <div style={{ fontFamily: "Times, serif", background: "#fdfaf0", padding: 8 }}>
            <h2 style={{ marginTop: 0 }}>Quarantäne-Zahlen weiter unklar</h2>
            <p>
              Beobachter im Westen schätzen die Zahl der unter „Resonanz-Hygiene"
              verhängten Wohnungs-Quarantänen auf inzwischen über 40.000. Die
              Verwaltung des Mandatsgebiets bestreitet die Erhebung als solche.
            </p>
            <p>
              Aussteiger berichten von akustischen Tests, sogenannten „Klang-Visiten",
              bei denen Bewohnerinnen und Bewohner einer Wohneinheit auf Reaktion
              hin geprüft werden. Wer nicht reagiert, gilt als „resonanzfähig" und
              wird isoliert. Wer zu stark reagiert, ebenso.
            </p>
            <p><FastLink to="freie-presse.us" onGo={go}>« zurück</FastLink></p>
          </div>
        ),
      };
    case "freie-presse.us/frequenz":
      return {
        title: "Freie Presse — 104,6",
        body: (
          <div style={{ fontFamily: "Times, serif", background: "#fdfaf0", padding: 8 }}>
            <h2 style={{ marginTop: 0 }}>Frequenz 104,6 — Mythos oder Methode?</h2>
            <p>
              Aussteiger berichten von einer Schmalband-Frequenz, die im
              Sektornetz offiziell nicht existiert, dort aber regelmäßig
              gestört wird. Sendeleistung: gering. Reichweite: angeblich
              ein einzelnes Plattenbau-Karree. Inhalt: Musik, kurze Ansagen,
              gelegentlich Zahlen.
            </p>
            <p>
              Wir bleiben dran. Hinweise bitte verschlüsselt an
              presse@freie-presse.us — PGP-Key auf Anfrage.
            </p>
            <p><FastLink to="radio.untergrund.us" onGo={go}>→ siehe radio.untergrund.us</FastLink></p>
            <p><FastLink to="freie-presse.us" onGo={go}>« zurück</FastLink></p>
          </div>
        ),
      };
    case "gaestebuch.fastweb.us":
      return {
        title: "Gästebuch",
        body: (
          <div style={{ background: "#ffccff", color: "#330033", padding: 8, fontFamily: "Comic Sans MS, sans-serif" }}>
            <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <span style={{ display: "inline-block", animation: "amigaMarquee 12s linear infinite" }}>
                ★彡 Willkommen im Gästebuch! Trag dich ein! 彡★
              </span>
            </div>
            <p>--- ZakMcKracken_92 (CA): „Geile Page, weiter so!!!"</p>
            <p>--- amiga4ever (NRW): „grüße aus dem westen :)"</p>
            <p>--- detlev_e71 (Sektor): „funktioniert das hier eigentlich noch jemand"</p>
            <p>--- ??? (?): „wenn ihr das hier lest, hört das radio nicht weg."</p>
            <p>--- piratin42 (Hbg): „wer hat noch das X-COPY pro original??"</p>
            <p style={{ fontSize: 10 }}>[ 117 Einträge · Seite 1 von 12 ]</p>
            <p><FastLink to="start.fastweb.us" onGo={go}>« Startseite</FastLink></p>
          </div>
        ),
      };
    case "weltzeit.us":
      return {
        title: "Weltzeit",
        body: (
          <div style={{ fontFamily: "monospace", padding: 8 }}>
            <h3 style={{ marginTop: 0 }}>Weltzeit · Wetter</h3>
            <pre style={{ margin: 0 }}>{`San Francisco   06:14   Klar       12°C
New York        09:14   Bewölkt     7°C
London          14:14   Regen       9°C
Hamburg-West    15:14   Smog       11°C
Mandatsgebiet   --:--   [ keine Verbindung ]
Tokio           23:14   Regen      14°C`}</pre>
            <p><FastLink to="weltzeit.us/wechselkurse" onGo={go}>→ Wechselkurse</FastLink></p>
            <p><FastLink to="start.fastweb.us" onGo={go}>« Startseite</FastLink></p>
          </div>
        ),
      };
    case "weltzeit.us/wechselkurse":
      return {
        title: "Weltzeit — Wechselkurse",
        body: (
          <div style={{ fontFamily: "monospace", padding: 8 }}>
            <h3 style={{ marginTop: 0 }}>Wechselkurse (informell)</h3>
            <pre style={{ margin: 0 }}>{`1 USD          = 1.62 DM
1 USD          = 25 RM (offiziell, Mandat)
1 USD          = 88 RM (Schwarzmarkt)
1 GBP          = 2.71 DM
1 JPY          = 0.013 USD
1 ECU          = 1.94 DM

Hinweis: Kurse für das Mandatsgebiet sind
nicht Teil des Sektornetzes und nicht
offiziell. Verwendung auf eigenes Risiko.`}</pre>
            <p><FastLink to="weltzeit.us" onGo={go}>« zurück</FastLink></p>
          </div>
        ),
      };
    case "radio.untergrund.us":
      return {
        title: "Radio Untergrund",
        body: (
          <div style={{ background: "#111", color: "#ddd", fontFamily: "monospace", padding: 8 }}>
            <h2 style={{ color: "#ff5555", marginTop: 0 }}>radio.untergrund.us</h2>
            <p>Liste freier Sender außerhalb des Sektornetzes (Stand 06/97):</p>
            <pre style={{ margin: 0, color: "#9f9" }}>{` 87.6   Pirat Süd     (mobil, A4)
 92.3   Westwelle     (NL-Grenze)
 99.1   Nachtzug      (Berlin-Ost, nach 23h)
104.6   ??            (Mandatsgebiet, Schmalband)
106.2   Hafen-FM      (Hamburg-West)
108.0   Notruf-Welle  (offiziell, gestört)`}</pre>
            <p><FastLink to="radio.untergrund.us/sendeplan" onGo={go}>→ Sendeplan 104,6 (rekonstruiert)</FastLink></p>
            <p><FastLink to="start.fastweb.us" onGo={go}>« Startseite</FastLink></p>
          </div>
        ),
      };
    case "radio.untergrund.us/sendeplan":
      return {
        title: "104,6 — Sendeplan",
        body: (
          <div style={{ background: "#111", color: "#ddd", fontFamily: "monospace", padding: 8 }}>
            <h3 style={{ color: "#ff5555", marginTop: 0 }}>104,6 MHz — rekonstruierter Plan</h3>
            <pre style={{ margin: 0 }}>{`Mo  22:00  Musik (instrumental)
Mo  22:40  Ansage, kurz
Di  --:--  (nicht beobachtet)
Mi  22:00  Musik
Mi  23:10  Zahlenfolge, weiblich, dt.
Do  22:00  Musik
Fr  21:30  Lange Ansage (15 Min.)
Sa  ----   Schweigen
So  20:00  Musik bis Sendeschluss`}</pre>
            <p style={{ color: "#fc8" }}>
              Hinweis: Wer das hier nachsendet oder weiterleitet, ist nach
              Mandatsrecht §41 (4) selbst strafbar. Niemand zwingt euch.
            </p>
            <p><FastLink to="radio.untergrund.us" onGo={go}>« zurück</FastLink></p>
          </div>
        ),
      };
  }
}

// ============================================================
// COMPONENT
// ============================================================

type WindowState =
  | { kind: "drawer"; id: string; node: FileNode & { kind: "drawer" } }
  | { kind: "file"; id: string; name: string; content: ReactNode }
  | { kind: "fastweb"; id: string };

let WIN_ID = 0;
const nextId = () => `w${++WIN_ID}`;

// ============================================================
// WORKBENCH 2.x DESIGN TOKENS
// ============================================================

// Klassische Workbench-Palette (Release-3-Look, 4 Farben)
const WB_GREY = "#a8a8a8";        // Desktop / Fenster-Background
const WB_GREY_LIGHT = "#c8c8c8";  // Bevel hell
const WB_BLUE = "#5566aa";        // Aktive Titelbar (Streifen-Basis)
const WB_WHITE = "#ffffff";
const WB_BLACK = "#000000";
const WB_FONT = '"Courier New", "Topaz-8", monospace';

// 3D-Bevel: oben/links hell, unten/rechts dunkel (raised)
const BEVEL_OUT: React.CSSProperties = {
  borderTop: `2px solid ${WB_WHITE}`,
  borderLeft: `2px solid ${WB_WHITE}`,
  borderRight: `2px solid ${WB_BLACK}`,
  borderBottom: `2px solid ${WB_BLACK}`,
};
const BEVEL_IN: React.CSSProperties = {
  borderTop: `2px solid ${WB_BLACK}`,
  borderLeft: `2px solid ${WB_BLACK}`,
  borderRight: `2px solid ${WB_WHITE}`,
  borderBottom: `2px solid ${WB_WHITE}`,
};

// Klassische WB-Titelbar-Streifen (horizontale 1px-Linien)
const TITLEBAR_STRIPES_ACTIVE =
  `repeating-linear-gradient(0deg, ${WB_BLUE} 0px, ${WB_BLUE} 1px, ${WB_WHITE} 1px, ${WB_WHITE} 2px)`;
// (Inactive-Variante bei Bedarf später ergänzen)

function ScreenTitleBar() {
  return (
    <div
      style={{
        background: WB_GREY_LIGHT,
        borderBottom: `1px solid ${WB_BLACK}`,
        padding: "1px 6px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: WB_BLACK,
        fontSize: 12,
        fontFamily: WB_FONT,
        height: 18,
      }}
    >
      <span>Amiga Workbench  982400 graphics mem  4003792 other mem</span>
      <span style={{ width: 14, height: 12, background: WB_GREY, ...BEVEL_OUT, display: "inline-block" }} />
    </div>
  );
}

export function AmigaWorkbench() {
  const { amigaWorkbenchOpen, closeAmigaWorkbench } = useGame();
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [zOrder, setZOrder] = useState<string[]>([]);

  if (!amigaWorkbenchOpen) return null;

  const focus = (id: string) => setZOrder((z) => [...z.filter((x) => x !== id), id]);

  const openDrawer = (node: FileNode & { kind: "drawer" }) => {
    const id = nextId();
    setWindows((w) => [...w, { kind: "drawer", id, node }]);
    setZOrder((z) => [...z, id]);
  };
  const openFile = (name: string, content: ReactNode) => {
    const id = nextId();
    setWindows((w) => [...w, { kind: "file", id, name, content }]);
    setZOrder((z) => [...z, id]);
  };
  const openFastWeb = () => {
    if (windows.some((w) => w.kind === "fastweb")) {
      const existing = windows.find((w) => w.kind === "fastweb")!;
      focus(existing.id);
      return;
    }
    const id = nextId();
    setWindows((w) => [...w, { kind: "fastweb", id }]);
    setZOrder((z) => [...z, id]);
  };
  const closeWindow = (id: string) => {
    setWindows((w) => w.filter((x) => x.id !== id));
    setZOrder((z) => z.filter((x) => x !== id));
  };

  const handleNodeOpen = (node: FileNode) => {
    if (node.kind === "drawer") openDrawer(node);
    else if (node.kind === "tool" && node.onOpen === "fastweb") openFastWeb();
    else if (node.kind === "file") openFile(node.name, node.content);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ background: WB_GREY, fontFamily: WB_FONT, color: "#000", imageRendering: "pixelated" }}
      >
        {/* Screen-Titelbar (WB 2.x): grau, schwarzer Text, Memory-Anzeige */}
        <ScreenTitleBar />

        {/* Desktop-Disk-Icons (rechts, vertikal) */}
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <DesktopIcon
            label="Workbench2.1"
            icon={<DiskIcon />}
            onOpen={() => openDrawer(WORKBENCH_DISK as FileNode & { kind: "drawer" })}
          />
          <DesktopIcon
            label="FastWeb"
            icon={<DiskIcon />}
            onOpen={() => openDrawer(FASTWEB_DISK as FileNode & { kind: "drawer" })}
          />
          <DesktopIcon label="Ram Disk" icon={<RamDiskIcon />} onOpen={() => openFile("Ram Disk", <em>(leer · 0% full)</em>)} />
          <DesktopIcon label="Trashcan" icon={<TrashIcon />} onOpen={() => openFile("Trashcan", <em>(leer)</em>)} />
        </div>

        {/* Fenster */}
        {windows.map((w, i) => {
          const z = zOrder.indexOf(w.id);
          const offset = i * 18;
          return (
            <WindowFrame
              key={w.id}
              title={
                w.kind === "drawer" ? `${w.node.name}:` :
                w.kind === "file" ? w.name :
                "FastWeb"
              }
              z={10 + z}
              offset={offset}
              isFastWeb={w.kind === "fastweb"}
              onFocus={() => focus(w.id)}
              onClose={() => closeWindow(w.id)}
            >
              {w.kind === "drawer" && (
                <DrawerView node={w.node} onOpen={handleNodeOpen} />
              )}
              {w.kind === "file" && (
                <div style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#000", background: "#fff", height: "100%", overflow: "auto" }}>
                  {w.content}
                </div>
              )}
              {w.kind === "fastweb" && <FastWebBrowser />}
            </WindowFrame>
          );
        })}

        <div style={{ position: "absolute", top: 4, right: 8, zIndex: 1000 }}>
          <CloseButton onClick={closeAmigaWorkbench} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DRAWER (Datei-Fenster)
// ============================================================

function DrawerView({ node, onOpen }: { node: FileNode & { kind: "drawer" }; onOpen: (n: FileNode) => void }) {
  const totalBytes = node.children.reduce((s, c) => s + (c.kind === "drawer" ? 0 : c.size), 0);
  return (
    <div style={{ background: WB_GREY, height: "100%", display: "flex", flexDirection: "column", color: WB_BLACK, fontFamily: WB_FONT }}>
      <div style={{ padding: "2px 8px", fontSize: 11, borderBottom: `1px solid ${WB_BLACK}`, background: WB_GREY_LIGHT }}>
        {node.children.length} items · {Math.round(totalBytes / 1024)}K used · 880K free
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(86px, 1fr))", gap: 16, alignContent: "start" }}>
        {node.children.map((child) => (
          <FileIcon key={child.name} node={child} onOpen={() => onOpen(child)} />
        ))}
      </div>
    </div>
  );
}

function FileIcon({ node, onOpen }: { node: FileNode; onOpen: () => void }) {
  const icon =
    node.kind === "drawer" ? <DrawerIcon /> :
    node.kind === "tool" ? <ToolIcon /> :
    <DocIcon />;
  return (
    <button
      type="button"
      onClick={onOpen}
      onDoubleClick={onOpen}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        textAlign: "center",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "rgba(0,0,0,0.2)",
        fontFamily: WB_FONT,
      }}
    >
      <div style={{ width: 52, height: 40, margin: "0 auto 2px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ color: WB_BLACK, fontSize: 11, padding: "0 2px", display: "inline-block", maxWidth: 86, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {node.name}
      </div>
    </button>
  );
}

// ============================================================
// FASTWEB BROWSER
// ============================================================

function FastWebBrowser() {
  const [history, setHistory] = useState<SiteKey[]>(["start.fastweb.us"]);
  const [idx, setIdx] = useState(0);
  const site = history[idx];
  const go = (s: SiteKey) => {
    const next = history.slice(0, idx + 1).concat(s);
    setHistory(next);
    setIdx(next.length - 1);
  };
  const back = () => idx > 0 && setIdx(idx - 1);
  const fwd = () => idx < history.length - 1 && setIdx(idx + 1);
  const home = () => go("start.fastweb.us");
  const { title, body } = siteBody(site, go);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#dddddd" }}>
      {/* Toolbar */}
      <div style={{ background: "#bbbbbb", borderBottom: "2px solid #000", padding: 4, display: "flex", gap: 4, alignItems: "center" }}>
        <ToolbarButton onClick={back} disabled={idx === 0}>◀</ToolbarButton>
        <ToolbarButton onClick={fwd} disabled={idx >= history.length - 1}>▶</ToolbarButton>
        <ToolbarButton onClick={home}>⌂</ToolbarButton>
        <div style={{ flex: 1, background: "#fff", border: "1px inset #888", padding: "1px 6px", fontSize: 11, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          http://{site}/
        </div>
      </div>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Bookmarks */}
        <div style={{ width: 140, background: "#bbb", borderRight: "2px solid #000", padding: 4, fontSize: 11, color: "#000", overflow: "auto" }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>Bookmarks</div>
          {(["start.fastweb.us","amiga-zone.us","freie-presse.us","gaestebuch.fastweb.us","weltzeit.us","radio.untergrund.us"] as SiteKey[]).map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => go(url)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                background: site === url ? "#000099" : "transparent",
                color: site === url ? "#fff" : "#000",
                border: "none", padding: "2px 4px", marginBottom: 1, cursor: "pointer",
                fontFamily: "monospace", fontSize: 11,
                touchAction: "manipulation",
              }}
            >
              {url}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
          <div style={{ background: "#eee", borderBottom: "1px solid #888", padding: "2px 8px", fontSize: 11, color: "#000" }}>
            {title}
          </div>
          <div style={{ padding: 8 }}>{body}</div>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#999" : "#ccc",
        border: "1px outset #fff",
        color: "#000",
        padding: "2px 8px",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "monospace",
        fontSize: 12,
        touchAction: "manipulation",
      }}
    >
      {children}
    </button>
  );
}

// ============================================================
// WINDOW FRAME
// ============================================================

function WindowFrame({
  title, z, offset, isFastWeb, onClose, onFocus, children,
}: {
  title: string;
  z: number;
  offset: number;
  isFastWeb: boolean;
  onClose: () => void;
  onFocus: () => void;
  children: ReactNode;
}) {
  // Initialposition (ziehbar via Titelbar)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const d = dragRef.current;
      if (!d) return;
      setPos({ x: d.baseX + (e.clientX - d.startX), y: d.baseY + (e.clientY - d.startY) });
    }
    function onUp() { dragRef.current = null; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    onFocus();
    const cur = pos ?? { x: 0, y: 0 };
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: cur.x, baseY: cur.y };
  };

  // FastWeb fills most of the screen; drawers are smaller
  const baseStyle: React.CSSProperties = isFastWeb
    ? { position: "absolute", top: 26, left: "3%", right: "3%", bottom: 12, zIndex: z }
    : {
        position: "absolute",
        top: 40 + offset,
        left: `calc(2% + ${offset}px)`,
        width: "min(420px, 70%)",
        height: "min(320px, 60%)",
        zIndex: z,
      };
  const style: React.CSSProperties = pos
    ? { ...baseStyle, transform: `translate(${pos.x}px, ${pos.y}px)` }
    : baseStyle;

  return (
    <div
      style={{ ...style, background: WB_GREY, ...BEVEL_OUT, display: "flex", flexDirection: "column", fontFamily: WB_FONT }}
      onMouseDown={onFocus}
      onTouchStart={onFocus}
    >
      {/* WB-Titelbar: solides Blau, weißer Text, links Close, rechts Zoom + Depth */}
      <div
        onMouseDown={startDrag}
        style={{
          display: "flex",
          alignItems: "stretch",
          height: 18,
          borderBottom: `1px solid ${WB_BLACK}`,
          background: TITLEBAR_STRIPES_ACTIVE,
          color: WB_WHITE,
          cursor: "move",
          userSelect: "none",
        }}
      >
        {/* Close-Gadget */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Schließen"
          style={{
            width: 20, height: 18, background: WB_GREY, ...BEVEL_OUT,
            padding: 0, margin: 0, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            touchAction: "manipulation", WebkitTapHighlightColor: "rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ width: 6, height: 6, background: WB_BLACK, display: "block" }} />
        </button>
        <div
          style={{
            flex: 1, display: "flex", alignItems: "center",
            paddingLeft: 4, paddingRight: 4, fontSize: 12,
            color: WB_WHITE, overflow: "hidden",
          }}
        >
          {/* Title-Block: solider blauer Kasten über den Streifen (WB-typisch) */}
          <span style={{
            background: WB_BLUE, color: WB_WHITE,
            padding: "0 8px", height: 14, lineHeight: "14px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            display: "inline-block", maxWidth: "100%",
          }}>{title}</span>
        </div>
        {/* Zoom-Gadget (kleines + großes Rechteck) */}
        <div onMouseDown={(e) => e.stopPropagation()} style={{ width: 20, height: 18, background: WB_GREY, ...BEVEL_OUT, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="10" viewBox="0 0 14 10" shapeRendering="crispEdges">
            <rect x="0" y="0" width="14" height="10" fill="none" stroke={WB_BLACK} strokeWidth="1" />
            <rect x="0" y="0" width="6" height="5" fill={WB_WHITE} stroke={WB_BLACK} strokeWidth="1" />
          </svg>
        </div>
        {/* Depth-Gadget (zwei überlappende Rechtecke) */}
        <div onMouseDown={(e) => e.stopPropagation()} style={{ width: 20, height: 18, background: WB_GREY, ...BEVEL_OUT, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="10" viewBox="0 0 14 10" shapeRendering="crispEdges">
            <rect x="3" y="0" width="11" height="7" fill={WB_GREY_LIGHT} stroke={WB_BLACK} strokeWidth="1" />
            <rect x="0" y="3" width="11" height="7" fill={WB_WHITE} stroke={WB_BLACK} strokeWidth="1" />
          </svg>
        </div>
      </div>
      {/* Inhalt + Scrollbar-Rinnen rechts und unten (rein dekorativ, WB-typisch) */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>{children}</div>
          <ScrollGutter vertical />
        </div>
        <ScrollGutter />
      </div>
    </div>
  );
}

// ============================================================
// ICONS
// ============================================================

function DesktopIcon({ label, icon, onOpen }: { label: string; icon: ReactNode; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      onDoubleClick={onOpen}
      style={{
        width: 84, textAlign: "center", cursor: "pointer", userSelect: "none",
        background: "transparent", border: "none", padding: 0, color: WB_BLACK,
        touchAction: "manipulation",
        WebkitTapHighlightColor: "rgba(0,0,0,0.2)",
        fontFamily: WB_FONT,
      }}
    >
      <div style={{ width: 56, height: 44, margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ color: WB_BLACK, fontSize: 11, padding: 0, display: "inline-block", background: "transparent" }}>
        {label}
      </div>
    </button>
  );
}

// Scrollbar-Rinne (dekorativ, WB-typisch — Pfeile am Ende, Knubbel in der Mitte)
function ScrollGutter({ vertical }: { vertical?: boolean }) {
  const size = 14;
  if (vertical) {
    return (
      <div style={{ width: size, background: WB_GREY, borderLeft: `1px solid ${WB_BLACK}`, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, background: WB_GREY_LIGHT, ...BEVEL_IN, margin: 1 }} />
        <ArrowGadget dir="up" />
        <ArrowGadget dir="down" />
      </div>
    );
  }
  return (
    <div style={{ height: size, background: WB_GREY, borderTop: `1px solid ${WB_BLACK}`, display: "flex" }}>
      <div style={{ flex: 1, background: WB_GREY_LIGHT, ...BEVEL_IN, margin: 1 }} />
      <ArrowGadget dir="left" />
      <ArrowGadget dir="right" />
      <div style={{ width: 14, background: WB_GREY, ...BEVEL_OUT }} />
    </div>
  );
}

function ArrowGadget({ dir }: { dir: "up" | "down" | "left" | "right" }) {
  const ch = dir === "up" ? "▲" : dir === "down" ? "▼" : dir === "left" ? "◀" : "▶";
  return (
    <div
      style={{
        width: 14, height: 14, background: WB_GREY, ...BEVEL_OUT,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 8, color: WB_BLACK, lineHeight: 1,
      }}
    >
      {ch}
    </div>
  );
}

function ToolIcon() {
  // WB-typisches "Tool"-Icon: gerahmtes Rechteck mit Inhalt
  return (
    <svg width="40" height="32" viewBox="0 0 40 32" aria-hidden shapeRendering="crispEdges">
      {/* Outer raised box */}
      <rect x="1" y="3" width="38" height="26" fill={WB_GREY_LIGHT} stroke={WB_BLACK} strokeWidth="1" />
      <rect x="2" y="4" width="36" height="2" fill={WB_WHITE} />
      <rect x="2" y="4" width="2" height="24" fill={WB_WHITE} />
      <rect x="2" y="26" width="36" height="2" fill={WB_BLACK} />
      <rect x="36" y="4" width="2" height="24" fill={WB_BLACK} />
      {/* "screen" patch */}
      <rect x="6" y="9" width="28" height="14" fill={WB_GREY} />
      <rect x="9" y="12" width="22" height="2" fill={WB_BLACK} />
      <rect x="9" y="16" width="16" height="2" fill={WB_BLACK} />
      <rect x="9" y="20" width="20" height="2" fill={WB_BLACK} />
    </svg>
  );
}

function DiskIcon() {
  // 3,5"-Diskette wie in WB 2.x: weißes Floppy mit Shutter, "//" Label
  return (
    <svg width="36" height="40" viewBox="0 0 36 40" aria-hidden shapeRendering="crispEdges">
      {/* Floppy body */}
      <rect x="2" y="2" width="32" height="36" fill={WB_WHITE} stroke={WB_BLACK} strokeWidth="1" />
      {/* Metal shutter */}
      <rect x="9" y="3" width="18" height="12" fill={WB_GREY_LIGHT} stroke={WB_BLACK} strokeWidth="1" />
      <rect x="17" y="4" width="3" height="10" fill={WB_BLACK} />
      {/* Label area */}
      <rect x="6" y="19" width="24" height="16" fill={WB_WHITE} stroke={WB_BLACK} strokeWidth="1" />
      {/* "//" mark inside label (WB-typisch) */}
      <line x1="11" y1="31" x2="17" y2="22" stroke={WB_BLACK} strokeWidth="2" />
      <line x1="16" y1="31" x2="22" y2="22" stroke={WB_BLACK} strokeWidth="2" />
    </svg>
  );
}

function RamDiskIcon() {
  return (
    <svg width="36" height="40" viewBox="0 0 36 40" aria-hidden shapeRendering="crispEdges">
      <rect x="2" y="2" width="32" height="36" fill={WB_WHITE} stroke={WB_BLACK} strokeWidth="1" />
      <rect x="9" y="3" width="18" height="12" fill={WB_GREY_LIGHT} stroke={WB_BLACK} strokeWidth="1" />
      <rect x="17" y="4" width="3" height="10" fill={WB_BLACK} />
      <rect x="6" y="19" width="24" height="16" fill={WB_WHITE} stroke={WB_BLACK} strokeWidth="1" />
      {/* Chip-Pins als RAM-Hinweis */}
      <rect x="11" y="24" width="14" height="6" fill={WB_GREY} stroke={WB_BLACK} strokeWidth="1" />
      <line x1="13" y1="30" x2="13" y2="33" stroke={WB_BLACK} strokeWidth="1" />
      <line x1="18" y1="30" x2="18" y2="33" stroke={WB_BLACK} strokeWidth="1" />
      <line x1="23" y1="30" x2="23" y2="33" stroke={WB_BLACK} strokeWidth="1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="32" height="38" viewBox="0 0 32 38" aria-hidden shapeRendering="crispEdges">
      {/* Lid */}
      <ellipse cx="16" cy="8" rx="12" ry="3" fill={WB_GREY_LIGHT} stroke={WB_BLACK} strokeWidth="1" />
      <rect x="13" y="3" width="6" height="3" fill={WB_GREY_LIGHT} stroke={WB_BLACK} strokeWidth="1" />
      {/* Body */}
      <path d="M5 9 L8 35 L24 35 L27 9" fill={WB_WHITE} stroke={WB_BLACK} strokeWidth="1" />
      <line x1="11" y1="13" x2="12" y2="32" stroke={WB_BLACK} strokeWidth="1" />
      <line x1="16" y1="13" x2="16" y2="32" stroke={WB_BLACK} strokeWidth="1" />
      <line x1="21" y1="13" x2="20" y2="32" stroke={WB_BLACK} strokeWidth="1" />
    </svg>
  );
}

function DrawerIcon() {
  // WB-Schublade: Karteikasten mit Reiter
  return (
    <svg width="48" height="36" viewBox="0 0 48 36" aria-hidden shapeRendering="crispEdges">
      {/* Tab */}
      <rect x="6" y="4" width="14" height="5" fill={WB_GREY_LIGHT} stroke={WB_BLACK} strokeWidth="1" />
      {/* Box */}
      <rect x="2" y="9" width="44" height="22" fill={WB_GREY_LIGHT} stroke={WB_BLACK} strokeWidth="1" />
      {/* Inner bevel */}
      <rect x="5" y="12" width="38" height="16" fill={WB_WHITE} stroke={WB_BLACK} strokeWidth="1" />
      <line x1="5" y1="20" x2="43" y2="20" stroke={WB_BLACK} strokeWidth="1" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="28" height="36" viewBox="0 0 28 36" aria-hidden shapeRendering="crispEdges">
      <path d="M3 2 L19 2 L25 8 L25 33 L3 33 Z" fill={WB_WHITE} stroke={WB_BLACK} strokeWidth="1" />
      <path d="M19 2 L19 8 L25 8" fill={WB_GREY_LIGHT} stroke={WB_BLACK} strokeWidth="1" />
      <line x1="6" y1="14" x2="22" y2="14" stroke={WB_BLACK} strokeWidth="1" />
      <line x1="6" y1="18" x2="22" y2="18" stroke={WB_BLACK} strokeWidth="1" />
      <line x1="6" y1="22" x2="22" y2="22" stroke={WB_BLACK} strokeWidth="1" />
      <line x1="6" y1="26" x2="18" y2="26" stroke={WB_BLACK} strokeWidth="1" />
    </svg>
  );
}