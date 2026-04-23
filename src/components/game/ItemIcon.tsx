import type { InventoryItemId } from "@/game/types";

/**
 * Pixelige 16-Bit-Adventure-Item-Icons.
 * Bewusst grobes shape-rendering: crispEdges, damit sie wie Sprites wirken.
 * Alle Icons haben dieselbe 24x24-Bounding und sind monochrom-bernstein,
 * damit sie zur Bürokratie-/CRT-Welt passen.
 */

interface Props {
  id: InventoryItemId;
  className?: string;
  /** CSS-pixel-Größe der Render-Box. */
  size?: number;
  title?: string;
}

const ICON_BG = "#1a1410"; // dunkles Innenleben
const ICON_FG = "#f0b14a"; // amber-glow
const ICON_HI = "#fce8b8"; // helle Highlights
const ICON_DK = "#7a4f1c"; // tiefer Schatten

function Frame({
  children,
  size = 24,
  className,
  title,
}: {
  children: React.ReactNode;
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label={title}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/* ─── Einzelne Icons ─────────────────────────────────────── */

/** Einsatzprotokoll — versiegelte Datenkapsel mit Etikett & Wachssiegel. */
function ProtocolIcon() {
  return (
    <>
      {/* Kapselkörper */}
      <rect x="5" y="3" width="14" height="18" fill={ICON_DK} />
      <rect x="6" y="4" width="12" height="16" fill={ICON_FG} />
      <rect x="6" y="4" width="12" height="2" fill={ICON_HI} />
      {/* Etikett */}
      <rect x="8" y="8" width="8" height="6" fill={ICON_BG} />
      <rect x="9" y="9" width="6" height="1" fill={ICON_FG} />
      <rect x="9" y="11" width="4" height="1" fill={ICON_FG} />
      <rect x="9" y="13" width="5" height="1" fill={ICON_FG} />
      {/* Wachssiegel */}
      <rect x="10" y="16" width="4" height="3" fill="#b3331a" />
      <rect x="11" y="17" width="2" height="1" fill={ICON_HI} />
    </>
  );
}

/** Ausgangscode — Notiz mit Ziffern. */
function ExitCodeIcon() {
  return (
    <>
      {/* Notizzettel */}
      <rect x="4" y="5" width="16" height="14" fill={ICON_DK} />
      <rect x="5" y="6" width="14" height="12" fill={ICON_HI} />
      {/* Eselsohr */}
      <rect x="17" y="6" width="2" height="2" fill={ICON_DK} />
      {/* Ziffern */}
      <rect x="7" y="9" width="2" height="2" fill={ICON_BG} />
      <rect x="10" y="9" width="2" height="2" fill={ICON_BG} />
      <rect x="13" y="9" width="2" height="2" fill={ICON_BG} />
      <rect x="16" y="9" width="2" height="2" fill={ICON_BG} />
      <rect x="7" y="13" width="2" height="2" fill={ICON_BG} />
      <rect x="10" y="13" width="2" height="2" fill={ICON_BG} />
      <rect x="13" y="13" width="2" height="2" fill={ICON_BG} />
      <rect x="16" y="13" width="2" height="2" fill={ICON_BG} />
    </>
  );
}

/** B3-Probe — Becher / Reagenzglas mit Flüssigkeit. */
function B3SampleIcon() {
  return (
    <>
      {/* Stopfen */}
      <rect x="9" y="2" width="6" height="2" fill={ICON_DK} />
      <rect x="10" y="3" width="4" height="1" fill={ICON_HI} />
      {/* Glas */}
      <rect x="8" y="4" width="8" height="17" fill={ICON_FG} opacity="0.25" />
      <rect x="8" y="4" width="1" height="17" fill={ICON_FG} />
      <rect x="15" y="4" width="1" height="17" fill={ICON_FG} />
      <rect x="8" y="20" width="8" height="1" fill={ICON_FG} />
      <rect x="9" y="21" width="6" height="1" fill={ICON_FG} />
      {/* Flüssigkeit */}
      <rect x="9" y="13" width="6" height="7" fill="#74c47a" />
      <rect x="9" y="13" width="6" height="1" fill={ICON_HI} opacity="0.6" />
      {/* Bläschen */}
      <rect x="11" y="15" width="1" height="1" fill={ICON_HI} />
      <rect x="13" y="17" width="1" height="1" fill={ICON_HI} />
    </>
  );
}

/** Bernstein-Kristall — geschliffener Quarz. */
function TuningCrystalIcon() {
  return (
    <>
      {/* Outer hex */}
      <rect x="11" y="2" width="2" height="1" fill={ICON_DK} />
      <rect x="9" y="3" width="6" height="1" fill={ICON_DK} />
      <rect x="7" y="4" width="10" height="2" fill={ICON_DK} />
      <rect x="6" y="6" width="12" height="12" fill={ICON_DK} />
      <rect x="7" y="18" width="10" height="2" fill={ICON_DK} />
      <rect x="9" y="20" width="6" height="1" fill={ICON_DK} />
      <rect x="11" y="21" width="2" height="1" fill={ICON_DK} />
      {/* Inner amber */}
      <rect x="10" y="4" width="4" height="1" fill={ICON_FG} />
      <rect x="8" y="5" width="8" height="1" fill={ICON_FG} />
      <rect x="7" y="6" width="10" height="12" fill={ICON_FG} />
      <rect x="8" y="18" width="8" height="1" fill={ICON_FG} />
      <rect x="10" y="19" width="4" height="1" fill={ICON_FG} />
      {/* Highlights */}
      <rect x="9" y="6" width="2" height="6" fill={ICON_HI} opacity="0.85" />
      <rect x="13" y="9" width="1" height="4" fill={ICON_HI} opacity="0.7" />
      {/* Facet line */}
      <rect x="7" y="12" width="10" height="1" fill={ICON_DK} opacity="0.5" />
    </>
  );
}

/** Brief an Insa — versiegelter Umschlag. */
function MikaelLetterIcon() {
  return (
    <>
      <rect x="3" y="6" width="18" height="13" fill={ICON_DK} />
      <rect x="4" y="7" width="16" height="11" fill={ICON_HI} />
      {/* Falten */}
      <polygon points="4,7 12,14 20,7" fill="none" />
      <rect x="4" y="7" width="1" height="1" fill={ICON_DK} />
      <rect x="5" y="8" width="1" height="1" fill={ICON_DK} />
      <rect x="6" y="9" width="1" height="1" fill={ICON_DK} />
      <rect x="7" y="10" width="1" height="1" fill={ICON_DK} />
      <rect x="8" y="11" width="1" height="1" fill={ICON_DK} />
      <rect x="9" y="12" width="1" height="1" fill={ICON_DK} />
      <rect x="10" y="13" width="1" height="1" fill={ICON_DK} />
      <rect x="11" y="14" width="2" height="1" fill={ICON_DK} />
      <rect x="13" y="13" width="1" height="1" fill={ICON_DK} />
      <rect x="14" y="12" width="1" height="1" fill={ICON_DK} />
      <rect x="15" y="11" width="1" height="1" fill={ICON_DK} />
      <rect x="16" y="10" width="1" height="1" fill={ICON_DK} />
      <rect x="17" y="9" width="1" height="1" fill={ICON_DK} />
      <rect x="18" y="8" width="1" height="1" fill={ICON_DK} />
      <rect x="19" y="7" width="1" height="1" fill={ICON_DK} />
      {/* Wachssiegel */}
      <rect x="10" y="14" width="4" height="3" fill="#b3331a" />
      <rect x="11" y="15" width="2" height="1" fill={ICON_HI} />
    </>
  );
}

/** Flugblatt — gefaltetes Papier mit fettem Aufdruck. */
function FlyerIcon() {
  return (
    <>
      <rect x="4" y="3" width="16" height="18" fill={ICON_DK} />
      <rect x="5" y="4" width="14" height="16" fill={ICON_HI} />
      {/* Knickfalte */}
      <rect x="11" y="4" width="1" height="16" fill={ICON_DK} opacity="0.35" />
      {/* Schlagzeile */}
      <rect x="7" y="7" width="10" height="2" fill={ICON_BG} />
      {/* Megaphon-Rune */}
      <rect x="8" y="11" width="2" height="4" fill={ICON_BG} />
      <rect x="10" y="10" width="2" height="6" fill={ICON_BG} />
      <rect x="12" y="9" width="1" height="8" fill={ICON_BG} />
      <rect x="13" y="11" width="1" height="1" fill={ICON_BG} />
      <rect x="13" y="14" width="1" height="1" fill={ICON_BG} />
      {/* Z.K.S.-Signatur */}
      <rect x="7" y="17" width="2" height="1" fill={ICON_BG} />
      <rect x="10" y="17" width="2" height="1" fill={ICON_BG} />
      <rect x="13" y="17" width="2" height="1" fill={ICON_BG} />
    </>
  );
}

const ICON_MAP: Record<InventoryItemId, () => React.ReactElement> = {
  protocol: ProtocolIcon,
  exitCode: ExitCodeIcon,
  b3sample: B3SampleIcon,
  tuningCrystal: TuningCrystalIcon,
  mikaelLetter: MikaelLetterIcon,
  flyer: FlyerIcon,
};

export function ItemIcon({ id, className, size = 24, title }: Props) {
  const Render = ICON_MAP[id];
  if (!Render) return null;
  return (
    <Frame size={size} className={className} title={title}>
      <Render />
    </Frame>
  );
}

/** Aktentaschen-Icon für den Inventar-Button (ebenfalls Pixel-Stil). */
export function BriefcaseIcon({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {/* Griff */}
      <rect x="9" y="4" width="6" height="1" fill={ICON_DK} />
      <rect x="8" y="5" width="1" height="2" fill={ICON_DK} />
      <rect x="15" y="5" width="1" height="2" fill={ICON_DK} />
      <rect x="9" y="5" width="6" height="1" fill={ICON_HI} />
      {/* Koffer-Korpus */}
      <rect x="3" y="7" width="18" height="13" fill={ICON_DK} />
      <rect x="4" y="8" width="16" height="11" fill={ICON_FG} />
      {/* Highlight oben */}
      <rect x="4" y="8" width="16" height="1" fill={ICON_HI} />
      {/* Verschluss */}
      <rect x="11" y="7" width="2" height="2" fill={ICON_DK} />
      <rect x="11" y="11" width="2" height="2" fill={ICON_DK} />
      <rect x="11" y="11" width="2" height="1" fill={ICON_HI} />
      {/* Naht in der Mitte */}
      <rect x="3" y="13" width="18" height="1" fill={ICON_DK} opacity="0.6" />
      {/* Eckbeschlag */}
      <rect x="3" y="19" width="2" height="1" fill={ICON_HI} opacity="0.4" />
      <rect x="19" y="19" width="2" height="1" fill={ICON_HI} opacity="0.4" />
    </svg>
  );
}