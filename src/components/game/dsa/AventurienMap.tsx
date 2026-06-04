import { DSA_PLACES, DSA_REGIONS, findPlace, type DsaPlace } from "@/game/dsa/lore/places";

/**
 * Schematische Aventurienkarte als SVG (eigene, lizenzfreie
 * Interpretation — kein Ulisses-Asset). Geografisch korrekt im
 * Großen: Thorwal nordwestlich, Bornland nordöstlich, Mittelreich
 * im Zentrum, Khôm in der Südmitte, Maraskan als Insel im Osten,
 * Al'Anfa & Co. an der Südküste. Pergament-Look passend zum
 * Heldenbogen.
 *
 * Wenn `currentLocation` gesetzt ist und in `DSA_PLACES` gefunden
 * wird, malen wir einen pulsierenden Marker (rotes X auf goldenem
 * Ring) an der entsprechenden Position.
 */
export function AventurienMap({
  currentLocation,
  className,
}: {
  currentLocation?: string | null;
  className?: string;
}) {
  const here: DsaPlace | null = currentLocation
    ? findPlace(currentLocation)
    : null;
  return (
    <svg
      viewBox="0 0 1000 1400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Karte Aventuriens"
    >
      <defs>
        <pattern id="parchment" patternUnits="userSpaceOnUse" width="200" height="200">
          <rect width="200" height="200" fill="#e9d6a8" />
          <path d="M0 50 H200 M0 100 H200 M0 150 H200" stroke="#d4bd86" strokeWidth="0.3" opacity="0.4" />
        </pattern>
        <pattern id="sea" patternUnits="userSpaceOnUse" width="80" height="80">
          <rect width="80" height="80" fill="#7ea8c4" />
          <path d="M0 20 Q 20 14 40 20 T 80 20 M0 40 Q 20 34 40 40 T 80 40 M0 60 Q 20 54 40 60 T 80 60"
            stroke="#9ec0d8" strokeWidth="0.6" fill="none" opacity="0.55" />
        </pattern>
        <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c0392b" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#c0392b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#c0392b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Meer */}
      <rect width="1000" height="1400" fill="url(#sea)" />

      {/* Inseln Nordwest (Thorwaler Außenposten) */}
      <g fill="url(#parchment)" stroke="#8a6a3a" strokeWidth="1.2">
        <ellipse cx="155" cy="200" rx="22" ry="14" />
        <ellipse cx="180" cy="230" rx="14" ry="9" />
        <ellipse cx="135" cy="240" rx="10" ry="6" />
        <ellipse cx="200" cy="260" rx="9" ry="6" />
        <ellipse cx="165" cy="285" rx="14" ry="8" />
        <ellipse cx="190" cy="310" rx="9" ry="6" />
      </g>

      {/* Hauptkontinent — handgezeichnete, stilisierte Aventurien-Silhouette.
          Nordwest: Thorwaler Halbinsel; Nordost: Bornland-Vorsprung; Süden:
          schmale Spitze Richtung Südmeer. */}
      <path
        d="
          M 380 160
          L 360 200 L 320 240 L 310 290 L 340 320
          L 380 310 L 410 340 L 440 320 L 470 350
          L 510 330 L 560 350 L 600 320 L 660 310
          L 720 290 L 780 310 L 810 340 L 800 380
          L 830 420 L 850 460 L 840 510 L 870 560
          L 860 620 L 830 670 L 800 720 L 760 770
          L 740 820 L 720 870 L 690 920 L 660 970
          L 620 1020 L 580 1080 L 540 1140 L 500 1200
          L 460 1260 L 420 1300 L 390 1290 L 380 1240
          L 360 1180 L 340 1120 L 330 1050 L 320 980
          L 300 910 L 290 840 L 280 770 L 290 700
          L 280 630 L 260 560 L 240 490 L 230 420
          L 240 360 L 270 300 L 290 250 L 330 200
          Z
        "
        fill="url(#parchment)"
        stroke="#8a6a3a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Maraskan (Insel im Osten) */}
      <path
        d="M 880 760 Q 910 740 920 800 Q 940 870 910 940 Q 880 970 870 920 Q 855 870 870 820 Z"
        fill="url(#parchment)"
        stroke="#8a6a3a"
        strokeWidth="2"
      />

      {/* Kleine Südinseln (Altoum / Maraskan-Süd) */}
      <g fill="url(#parchment)" stroke="#8a6a3a" strokeWidth="1.2">
        <ellipse cx="700" cy="1180" rx="22" ry="10" />
        <ellipse cx="760" cy="1220" rx="16" ry="8" />
        <ellipse cx="820" cy="1190" rx="12" ry="6" />
      </g>

      {/* Gebirge — schematische Dreiecksketten */}
      <g fill="#8b6b3e" opacity="0.55">
        {/* Salamandersteine (zentral-nord) */}
        {mountains([[500, 320], [530, 305], [560, 320], [590, 305], [620, 320]])}
        {/* Eisenwald / Greifenfurt-Hochland */}
        {mountains([[620, 410], [650, 395], [680, 410]])}
        {/* Koschberge */}
        {mountains([[470, 380], [500, 365], [530, 380]])}
        {/* Raschtulswall (südlich von Mittelreich Richtung Khôm) */}
        {mountains([[480, 720], [510, 705], [540, 720], [570, 705], [600, 720]])}
        {/* Maraskan-Berge */}
        {mountains([[890, 820], [905, 808], [920, 820]])}
      </g>

      {/* Wälder — kleine Punktcluster */}
      <g fill="#3a6a3a" opacity="0.55">
        {forest(420, 280, 18)}
        {forest(540, 420, 22)}
        {forest(380, 470, 16)}
        {forest(680, 480, 20)}
        {forest(450, 600, 18)}
        {forest(620, 580, 14)}
      </g>

      {/* Wüste (Khôm) — sandige Fläche */}
      <ellipse cx="510" cy="780" rx="170" ry="80" fill="#d9b878" opacity="0.55" />

      {/* Flüsse — angedeutet */}
      <g fill="none" stroke="#5b8aa8" strokeWidth="2.2" opacity="0.85">
        {/* Großer Fluss (Reichsstrom-Analogon) */}
        <path d="M 540 360 Q 560 440 580 500 Q 600 580 590 640 Q 580 700 560 760 Q 540 820 520 880" />
        {/* Bornlandfluss (Walsach) */}
        <path d="M 760 300 Q 740 360 720 420 Q 700 480 720 510" />
        {/* Mhanadi (im Süden) */}
        <path d="M 580 720 Q 560 800 540 880 Q 520 950 480 1020" />
      </g>

      {/* Region-Beschriftungen */}
      <g fontFamily="'Cormorant Garamond', 'Times New Roman', serif" fill="#5a3a18" fontWeight="600" textAnchor="middle">
        {DSA_REGIONS.map((r) => (
          <text
            key={r.id}
            x={(r.x / 100) * 1000}
            y={(r.y / 100) * 1400}
            fontSize={r.fontSize ?? 12}
            letterSpacing="2"
            opacity="0.85"
          >
            {r.name}
          </text>
        ))}
      </g>

      {/* Ozean-Beschriftungen */}
      <g fontFamily="'Cormorant Garamond', serif" fill="#1c4a6a" fontStyle="italic" fontSize="22" opacity="0.85">
        <text x="100" y="500" transform="rotate(-78 100 500)">Meer der Sieben Winde</text>
        <text x="920" y="380" transform="rotate(78 920 380)">Tobrische See</text>
        <text x="500" y="60">Ifirns Ozean</text>
        <text x="500" y="1360" textAnchor="middle">Südmeer</text>
      </g>

      {/* Ortsmarken */}
      <g>
        {DSA_PLACES.map((p) => {
          const cx = (p.x / 100) * 1000;
          const cy = (p.y / 100) * 1400;
          const r = p.kind === "stadt" ? 4 : 3;
          return (
            <g key={p.id}>
              <circle cx={cx} cy={cy} r={r} fill="#3a2a14" stroke="#f1e6c8" strokeWidth="0.8" />
              <text
                x={cx + 7}
                y={cy + 3}
                fontSize="11"
                fontFamily="'Cormorant Garamond', serif"
                fill="#3a2a14"
              >
                {p.name}
              </text>
            </g>
          );
        })}
      </g>

      {/* Aktueller Aufenthaltsort — pulsierender Marker */}
      {here && (
        <g>
          {(() => {
            const cx = (here.x / 100) * 1000;
            const cy = (here.y / 100) * 1400;
            return (
              <>
                <circle cx={cx} cy={cy} r="55" fill="url(#markerGlow)">
                  <animate attributeName="r" values="40;60;40" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={cx} cy={cy} r="9" fill="#c0392b" stroke="#f1e6c8" strokeWidth="2" />
                <path
                  d={`M ${cx - 5} ${cy - 5} L ${cx + 5} ${cy + 5} M ${cx + 5} ${cy - 5} L ${cx - 5} ${cy + 5}`}
                  stroke="#f1e6c8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <text
                  x={cx}
                  y={cy - 18}
                  textAnchor="middle"
                  fontFamily="'Cormorant Garamond', serif"
                  fontWeight="700"
                  fontSize="20"
                  fill="#c0392b"
                  stroke="#fbf2d8"
                  strokeWidth="3"
                  paintOrder="stroke"
                >
                  {here.name}
                </text>
              </>
            );
          })()}
        </g>
      )}

      {/* Kompass-Rose unten rechts */}
      <g transform="translate(900, 1280)" opacity="0.7">
        <circle r="32" fill="none" stroke="#5a3a18" strokeWidth="1.2" />
        <path d="M 0 -30 L 6 0 L 0 30 L -6 0 Z" fill="#5a3a18" />
        <path d="M -30 0 L 0 -6 L 30 0 L 0 6 Z" fill="#5a3a18" opacity="0.5" />
        <text x="0" y="-38" textAnchor="middle" fontSize="11" fill="#5a3a18" fontFamily="serif" fontWeight="700">N</text>
      </g>

      {/* Titel-Kartusche oben links */}
      <g transform="translate(60, 80)">
        <rect x="-20" y="-32" width="220" height="60" fill="#fbf2d8" stroke="#5a3a18" strokeWidth="1.5" rx="3" />
        <text x="90" y="6" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="28" fontWeight="700" fill="#7a2a1a" letterSpacing="4">
          AVENTURIEN
        </text>
        <text x="90" y="22" textAnchor="middle" fontFamily="serif" fontSize="9" fill="#5a3a18" fontStyle="italic">
          Ein Kontinent voll Ruhm und Abenteuer
        </text>
      </g>
    </svg>
  );
}

/** Erzeugt eine schematische Gebirgskette aus Dreiecken. */
function mountains(peaks: Array<[number, number]>) {
  return peaks.map(([px, py], i) => (
    <path
      key={i}
      d={`M ${px - 10} ${py + 10} L ${px} ${py - 12} L ${px + 10} ${py + 10} Z`}
    />
  ));
}

/** Verteilt kleine Punkte als Wald-Andeutung um (cx, cy). */
function forest(cx: number, cy: number, count: number) {
  const out = [];
  // Deterministischer Pseudo-Random aus Index (kein Math.random — SSR-stabil).
  for (let i = 0; i < count; i += 1) {
    const a = (i * 137) % 360;
    const r = 6 + ((i * 13) % 22);
    const x = cx + Math.cos((a * Math.PI) / 180) * r;
    const y = cy + Math.sin((a * Math.PI) / 180) * r * 0.7;
    out.push(<circle key={i} cx={x} cy={y} r="2.2" />);
  }
  return out;
}