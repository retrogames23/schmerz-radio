import { useState } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";

/**
 * Amiga-Workbench-Overlay (Gemeinschaftsraum E71, Tür 1530).
 *
 * Bewusst sehr „90er": graue Workbench-Optik, Topaz-artige Monospace-Font,
 * eckige Buttons. Im Inneren läuft „FastWeb" — diese Welt-Variante des
 * Internets. Fünf statische Mini-Sites im 90er-Web-Look.
 */
const SITES = {
  "start.fastweb.us": {
    title: "FastWeb · Start",
    body: (
      <div style={{ fontFamily: "Times, serif", color: "#000022" }}>
        <h1 style={{ background: "#000099", color: "#ffff00", padding: 4 }}>
          FastWeb — Das Tor zur Welt
        </h1>
        <p>Willkommen! Wählen Sie ein Bookmark links.</p>
        <ul>
          <li>Über 12.000 indizierte Seiten weltweit!</li>
          <li>Letzte Aktualisierung: 14. März 1992</li>
        </ul>
        <p style={{ fontSize: 12, color: "#666" }}>
          Hosted in Sunnyvale, CA · Best viewed at 640×480
        </p>
      </div>
    ),
  },
  "amiga-zone.us": {
    title: "Amiga Zone",
    body: (
      <div style={{ background: "#000", color: "#0f0", fontFamily: "monospace", padding: 8 }}>
        <pre>{`
   ___    __  __ ___ ___   _
  / _ |  /  |/  /  _/ _ \\ /_\\
 / __ | / /|_/ // // // /_\\ \\
/_/ |_|/_/  /_/___/____/\\_/\\_\\

        AMIGA ZONE — since 1989
`}</pre>
        <p>» 880 KB pro Diskette. PCs können einpacken.</p>
        <p>» Neue MOD-Sammlung im Download-Bereich</p>
        <p>» Cheats für Lemmings, Turrican II, Shadow of the Beast</p>
      </div>
    ),
  },
  "freie-presse.us": {
    title: "Freie Presse — Mitteleuropa-Beobachter",
    body: (
      <div style={{ fontFamily: "Times, serif", background: "#fdfaf0", padding: 8 }}>
        <h2>Mandatsgebiet Mitteleuropa: Quarantäne-Zahlen weiter unklar</h2>
        <p>
          Beobachter im Westen schätzen die Zahl der unter „Resonanz-Hygiene"
          verhängten Wohnungs-Quarantänen auf inzwischen über 40.000. Die
          Verwaltung des Mandatsgebiets bestreitet die Erhebung als solche.
        </p>
        <hr />
        <h3>Frequenz 104,6 — Mythos oder Methode?</h3>
        <p>
          Aussteiger berichten von einer Schmalband-Frequenz, die im
          Sektornetz offiziell nicht existiert, dort aber regelmäßig
          gestört wird. Wir bleiben dran.
        </p>
      </div>
    ),
  },
  "gaestebuch.fastweb.us": {
    title: "Gästebuch",
    body: (
      <div style={{ background: "#ffccff", color: "#330033", padding: 8, fontFamily: "Comic Sans MS, sans-serif" }}>
        <marquee>★彡 Willkommen im Gästebuch! Trag dich ein! 彡★</marquee>
        <p>--- ZakMcKracken_92 (CA): „Geile Page, weiter so!!!"</p>
        <p>--- amiga4ever (NRW): „grüße aus dem westen :)"</p>
        <p>--- ??? (?): „wenn ihr das hier lest, hört das radio nicht weg."</p>
        <p style={{ fontSize: 10 }}>[ 117 Einträge · Seite 1 von 12 ]</p>
      </div>
    ),
  },
  "weltzeit.us": {
    title: "Weltzeit",
    body: (
      <div style={{ fontFamily: "monospace", padding: 8 }}>
        <h3>Weltzeit · Wechselkurse · Wetter</h3>
        <pre>{`
San Francisco   06:14   Klar       12°C
New York        09:14   Bewölkt     7°C
London          14:14   Regen       9°C
Hamburg-West    15:14   Smog       11°C
Mandatsgebiet   --:--   [ keine Verbindung ]
Tokio           23:14   Regen      14°C

1 Reichsmark = 0.04 USD (inoffiziell)
`}</pre>
      </div>
    ),
  },
} as const;

type SiteKey = keyof typeof SITES;
const BOOKMARKS: SiteKey[] = [
  "start.fastweb.us",
  "amiga-zone.us",
  "freie-presse.us",
  "gaestebuch.fastweb.us",
  "weltzeit.us",
];

export function AmigaWorkbench() {
  const { amigaWorkbenchOpen, closeAmigaWorkbench } = useGame();
  const [browserOpen, setBrowserOpen] = useState(false);
  const [site, setSite] = useState<SiteKey>("start.fastweb.us");

  if (!amigaWorkbenchOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ background: "#0055aa", fontFamily: "monospace" }}
      >
        {/* Workbench-Titelleiste */}
        <div
          style={{
            background: "#aaaaaa",
            borderBottom: "2px solid #000",
            padding: "2px 8px",
            display: "flex",
            justifyContent: "space-between",
            color: "#000",
            fontSize: 13,
          }}
        >
          <span>Workbench 1.3 — 512K Chip · 512K Fast</span>
          <span>FastWeb v0.9</span>
        </div>

        {/* Desktop-Icons (links) */}
        {!browserOpen && (
          <div style={{ position: "absolute", top: 40, left: 16, color: "#fff" }}>
            <DesktopIcon
              label="FastWeb"
              onOpen={() => setBrowserOpen(true)}
            />
            <DesktopIcon label="WB_2.0" onOpen={() => {}} />
            <DesktopIcon label="Trashcan" onOpen={() => {}} />
          </div>
        )}

        {/* Browser-Fenster */}
        {browserOpen && (
          <div
            style={{
              position: "absolute",
              top: 50,
              left: 32,
              right: 32,
              bottom: 32,
              background: "#dddddd",
              border: "2px solid #000",
              boxShadow: "4px 4px 0 #000",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                background: "#000099",
                color: "#fff",
                padding: "2px 8px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
              }}
            >
              <span>FastWeb — {SITES[site].title}</span>
              <button
                onClick={() => setBrowserOpen(false)}
                style={{ background: "#aaa", border: "1px solid #000", color: "#000", padding: "0 6px" }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
              <div
                style={{
                  width: 180,
                  background: "#bbb",
                  borderRight: "2px solid #000",
                  padding: 6,
                  fontSize: 12,
                  color: "#000",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: 6 }}>Bookmarks</div>
                {BOOKMARKS.map((url) => (
                  <div
                    key={url}
                    onClick={() => setSite(url)}
                    style={{
                      cursor: "pointer",
                      padding: "2px 4px",
                      background: site === url ? "#000099" : "transparent",
                      color: site === url ? "#fff" : "#000",
                      marginBottom: 2,
                    }}
                  >
                    {url}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
                <div
                  style={{
                    background: "#eee",
                    borderBottom: "1px solid #888",
                    padding: "2px 8px",
                    fontSize: 11,
                    color: "#000",
                  }}
                >
                  http://{site}/
                </div>
                <div style={{ padding: 8 }}>{SITES[site].body}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ position: "absolute", top: 4, right: 8, zIndex: 10 }}>
          <CloseButton onClose={closeAmigaWorkbench} />
        </div>
      </div>
    </div>
  );
}

function DesktopIcon({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <div
      onDoubleClick={onOpen}
      onClick={onOpen}
      style={{
        width: 80,
        marginBottom: 16,
        textAlign: "center",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 56,
          height: 40,
          background: "#fff",
          border: "2px solid #000",
          margin: "0 auto 4px",
        }}
      />
      <div style={{ background: "#000099", color: "#fff", fontSize: 11, padding: "0 4px" }}>
        {label}
      </div>
    </div>
  );
}
