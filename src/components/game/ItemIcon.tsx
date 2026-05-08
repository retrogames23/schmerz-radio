import { memo } from "react";
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

/** Wartungsnotiz 5610 — kleines Karteikärtchen mit Zifferncode. */
function WartungsnotizIcon() {
  return (
    <>
      {/* Karteikarte */}
      <rect x="3" y="5" width="18" height="14" fill={ICON_DK} />
      <rect x="4" y="6" width="16" height="12" fill={ICON_HI} />
      {/* Reiter oben */}
      <rect x="6" y="4" width="6" height="2" fill={ICON_DK} />
      <rect x="7" y="5" width="4" height="1" fill={ICON_HI} />
      {/* Code 7-0-3-2 als Klötzchen */}
      <rect x="6" y="9" width="2" height="3" fill={ICON_BG} />
      <rect x="9" y="9" width="2" height="3" fill={ICON_BG} />
      <rect x="13" y="9" width="2" height="3" fill={ICON_BG} />
      <rect x="16" y="9" width="2" height="3" fill={ICON_BG} />
      {/* Linie darunter */}
      <rect x="6" y="14" width="12" height="1" fill={ICON_BG} opacity="0.7" />
      <rect x="6" y="16" width="9" height="1" fill={ICON_BG} opacity="0.5" />
    </>
  );
}

/** Ölkännchen — kleine zinnerne Kanne mit langem Schnabel. */
function OilCanIcon() {
  return (
    <>
      {/* Korpus */}
      <rect x="9" y="10" width="9" height="9" fill={ICON_DK} />
      <rect x="10" y="11" width="7" height="7" fill={ICON_FG} />
      <rect x="10" y="11" width="7" height="1" fill={ICON_HI} />
      {/* Boden */}
      <rect x="8" y="19" width="11" height="1" fill={ICON_DK} />
      {/* Deckel */}
      <rect x="11" y="9" width="3" height="1" fill={ICON_DK} />
      {/* Schnabel: lange diagonale Tülle nach oben links */}
      <rect x="7" y="9" width="2" height="2" fill={ICON_DK} />
      <rect x="5" y="7" width="2" height="2" fill={ICON_DK} />
      <rect x="3" y="5" width="2" height="2" fill={ICON_DK} />
      <rect x="2" y="4" width="2" height="2" fill={ICON_FG} />
      {/* Henkel rechts */}
      <rect x="18" y="12" width="2" height="1" fill={ICON_DK} />
      <rect x="20" y="13" width="1" height="3" fill={ICON_DK} />
      <rect x="18" y="16" width="2" height="1" fill={ICON_DK} />
      {/* Tropfen */}
      <rect x="2" y="7" width="1" height="1" fill={ICON_HI} />
    </>
  );
}

/** Bodos grüne Thermoskanne — zylindrisch, mit Delle und Schraubdeckel. */
function BodoThermosIcon() {
  const GREEN_DK = "#1f3a1c";
  const GREEN_FG = "#3f7a35";
  const GREEN_HI = "#7fc26b";
  return (
    <>
      {/* Schraubdeckel oben */}
      <rect x="9" y="2" width="6" height="2" fill={ICON_DK} />
      <rect x="9" y="3" width="6" height="1" fill={GREEN_HI} opacity="0.6" />
      {/* Halsring */}
      <rect x="8" y="4" width="8" height="1" fill={ICON_DK} />
      {/* Korpus */}
      <rect x="7" y="5" width="10" height="16" fill={GREEN_DK} />
      <rect x="8" y="5" width="8" height="16" fill={GREEN_FG} />
      {/* Highlight links */}
      <rect x="8" y="6" width="1" height="14" fill={GREEN_HI} opacity="0.7" />
      {/* Delle (dunkler Fleck) */}
      <rect x="12" y="11" width="3" height="2" fill={GREEN_DK} />
      <rect x="13" y="10" width="2" height="1" fill={GREEN_DK} opacity="0.6" />
      {/* Etikett */}
      <rect x="9" y="14" width="6" height="3" fill={ICON_HI} opacity="0.85" />
      <rect x="10" y="15" width="4" height="1" fill={ICON_DK} />
      {/* Boden */}
      <rect x="7" y="21" width="10" height="1" fill={ICON_DK} />
    </>
  );
}

/** Medizinische Maske — rechteckige OP-Maske mit zwei Bändern. */
function MedMaskIcon() {
  return (
    <>
      {/* Bänder links/rechts */}
      <rect x="2" y="9" width="2" height="1" fill={ICON_DK} />
      <rect x="3" y="10" width="2" height="1" fill={ICON_DK} />
      <rect x="3" y="14" width="2" height="1" fill={ICON_DK} />
      <rect x="2" y="15" width="2" height="1" fill={ICON_DK} />
      <rect x="20" y="9" width="2" height="1" fill={ICON_DK} />
      <rect x="19" y="10" width="2" height="1" fill={ICON_DK} />
      <rect x="19" y="14" width="2" height="1" fill={ICON_DK} />
      <rect x="20" y="15" width="2" height="1" fill={ICON_DK} />
      {/* Maskenkörper */}
      <rect x="5" y="8" width="14" height="9" fill={ICON_DK} />
      <rect x="6" y="9" width="12" height="7" fill={ICON_HI} />
      {/* Plissee-Falten */}
      <rect x="6" y="11" width="12" height="1" fill={ICON_DK} opacity="0.5" />
      <rect x="6" y="13" width="12" height="1" fill={ICON_DK} opacity="0.5" />
      <rect x="6" y="15" width="12" height="1" fill={ICON_DK} opacity="0.5" />
      {/* Nasenbügel */}
      <rect x="9" y="9" width="6" height="1" fill={ICON_FG} />
    </>
  );
}

/** E67-Bewohner-Ausweis — kleine Plastikkarte mit Lichtbild und Magnetstreifen. */
function ResidentIdIcon() {
  return (
    <>
      {/* Karte */}
      <rect x="2" y="6" width="20" height="13" fill={ICON_DK} />
      <rect x="3" y="7" width="18" height="11" fill={ICON_HI} />
      {/* Lichtbild */}
      <rect x="4" y="9" width="6" height="7" fill={ICON_DK} />
      <rect x="5" y="10" width="4" height="3" fill={ICON_FG} />
      <rect x="6" y="13" width="2" height="3" fill={ICON_FG} />
      {/* Textzeilen */}
      <rect x="11" y="9" width="9" height="1" fill={ICON_BG} />
      <rect x="11" y="11" width="7" height="1" fill={ICON_BG} opacity="0.8" />
      <rect x="11" y="13" width="6" height="1" fill={ICON_BG} opacity="0.6" />
      {/* Magnetstreifen unten */}
      <rect x="2" y="19" width="20" height="2" fill={ICON_BG} />
    </>
  );
}

/** E67-Handbuch — geheftete Broschüre mit Stempel. */
function E67HandbookIcon() {
  return (
    <>
      {/* Buchrücken-Schatten */}
      <rect x="4" y="3" width="16" height="18" fill={ICON_DK} />
      {/* Cover */}
      <rect x="5" y="4" width="14" height="16" fill={ICON_FG} />
      {/* Heft-Klammern */}
      <rect x="5" y="7" width="2" height="1" fill={ICON_BG} />
      <rect x="5" y="16" width="2" height="1" fill={ICON_BG} />
      {/* Titelbalken */}
      <rect x="8" y="6" width="9" height="2" fill={ICON_BG} />
      {/* Quadrant-Code */}
      <rect x="8" y="10" width="3" height="1" fill={ICON_BG} />
      <rect x="12" y="10" width="2" height="1" fill={ICON_BG} />
      <rect x="15" y="10" width="2" height="1" fill={ICON_BG} />
      {/* Stempel (rund, schief) */}
      <rect x="9" y="13" width="6" height="1" fill={ICON_DK} />
      <rect x="8" y="14" width="8" height="1" fill={ICON_DK} />
      <rect x="9" y="15" width="6" height="1" fill={ICON_DK} />
      {/* Eselsohr unten rechts */}
      <rect x="17" y="18" width="2" height="2" fill={ICON_HI} />
      <rect x="18" y="17" width="1" height="1" fill={ICON_HI} />
    </>
  );
}

/** B3-Vollmacht — Formular mit Unterschrift und Stempel. */
function B3AuthorizationIcon() {
  return (
    <>
      {/* Papier */}
      <rect x="3" y="3" width="18" height="18" fill={ICON_DK} />
      <rect x="4" y="4" width="16" height="16" fill={ICON_HI} />
      {/* Kopfzeile "VOLLMACHT" */}
      <rect x="6" y="6" width="12" height="2" fill={ICON_BG} />
      {/* Textzeilen */}
      <rect x="6" y="10" width="10" height="1" fill={ICON_BG} opacity="0.7" />
      <rect x="6" y="12" width="8" height="1" fill={ICON_BG} opacity="0.7" />
      {/* Vier Ziffern 4-3-1-7 */}
      <rect x="6" y="14" width="2" height="2" fill={ICON_BG} />
      <rect x="9" y="14" width="2" height="2" fill={ICON_BG} />
      <rect x="12" y="14" width="2" height="2" fill={ICON_BG} />
      <rect x="15" y="14" width="2" height="2" fill={ICON_BG} />
      {/* Schwungvolle Unterschrift */}
      <rect x="6" y="18" width="1" height="1" fill={ICON_BG} />
      <rect x="7" y="17" width="1" height="1" fill={ICON_BG} />
      <rect x="8" y="18" width="2" height="1" fill={ICON_BG} />
      <rect x="10" y="17" width="1" height="1" fill={ICON_BG} />
      <rect x="11" y="18" width="1" height="1" fill={ICON_BG} />
      {/* Stempel rund (rot) */}
      <rect x="15" y="17" width="4" height="3" fill="#b3331a" />
      <rect x="16" y="18" width="2" height="1" fill={ICON_HI} />
    </>
  );
}

/** B3-Ration — Konservendose mit B3-Etikett. */
function B3RationIcon() {
  return (
    <>
      {/* Dosendeckel */}
      <rect x="6" y="3" width="12" height="2" fill={ICON_DK} />
      <rect x="7" y="4" width="10" height="1" fill={ICON_HI} />
      {/* Dosenkörper */}
      <rect x="6" y="5" width="12" height="16" fill={ICON_DK} />
      <rect x="7" y="6" width="10" height="14" fill={ICON_FG} />
      {/* Highlight */}
      <rect x="7" y="6" width="2" height="14" fill={ICON_HI} opacity="0.5" />
      {/* Etikett */}
      <rect x="7" y="10" width="10" height="6" fill={ICON_BG} />
      {/* "B3" */}
      <rect x="9" y="11" width="2" height="4" fill={ICON_FG} />
      <rect x="11" y="11" width="1" height="1" fill={ICON_FG} />
      <rect x="11" y="13" width="1" height="1" fill={ICON_FG} />
      <rect x="13" y="11" width="2" height="1" fill={ICON_FG} />
      <rect x="14" y="12" width="1" height="1" fill={ICON_FG} />
      <rect x="13" y="13" width="2" height="1" fill={ICON_FG} />
      <rect x="14" y="14" width="1" height="1" fill={ICON_FG} />
      <rect x="13" y="15" width="2" height="1" fill={ICON_FG} />
      {/* Bodenrille */}
      <rect x="7" y="20" width="10" height="1" fill={ICON_DK} opacity="0.6" />
    </>
  );
}

/** Sanitäter-Bericht — gefaltetes Formblatt mit rotem Kreuz. */
function ParamedicsReportIcon() {
  return (
    <>
      {/* Papier */}
      <rect x="3" y="3" width="18" height="18" fill={ICON_DK} />
      <rect x="4" y="4" width="16" height="16" fill={ICON_HI} />
      {/* Kopfbalken */}
      <rect x="4" y="4" width="16" height="3" fill={ICON_BG} />
      {/* Rotes Kreuz im Kopf */}
      <rect x="11" y="4" width="2" height="3" fill="#b3331a" />
      <rect x="10" y="5" width="4" height="1" fill="#b3331a" />
      {/* Formular-Zeilen */}
      <rect x="6" y="9" width="12" height="1" fill={ICON_BG} opacity="0.8" />
      <rect x="6" y="11" width="10" height="1" fill={ICON_BG} opacity="0.7" />
      <rect x="6" y="13" width="11" height="1" fill={ICON_BG} opacity="0.7" />
      <rect x="6" y="15" width="8" height="1" fill={ICON_BG} opacity="0.6" />
      {/* Ankreuz-Kästchen */}
      <rect x="6" y="17" width="2" height="2" fill={ICON_DK} />
      <rect x="7" y="18" width="1" height="1" fill={ICON_BG} />
      <rect x="10" y="17" width="2" height="2" fill={ICON_DK} />
      <rect x="14" y="17" width="2" height="2" fill={ICON_DK} />
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
  wartungsnotiz5610: WartungsnotizIcon,
  residentId: ResidentIdIcon,
  e67Handbook: E67HandbookIcon,
  b3Authorization: B3AuthorizationIcon,
  b3Ration: B3RationIcon,
  paramedicsReport: ParamedicsReportIcon,
  pencilStub: PencilStubIcon,
  siegelAbdruck: SiegelAbdruckIcon,
  aushang71Original: Aushang71Icon,
  quittungBlankoB: QuittungBlankoIcon,
  quittungForged4317: QuittungForgedIcon,
  tillaTransfer: TillaTransferIcon,
  miraDoorNote: FlyerIcon,
  // Schmerz-Radio-Erweiterung — vorerst aus dem bestehenden Bestand.
  antennaWire: TuningCrystalIcon,
  amplifierAntenna: TuningCrystalIcon,
  wartungsDiktat: WartungsnotizIcon,
  // Bürokratie-Duell — Layards Sammlung gelernter Paragraphen.
  paragraphenNotizbuch: ParagraphenNotizbuchIcon,
  // Ölkännchen für MARV-9 — vorerst geliehenes Notiz-Icon.
  oilCan: OilCanIcon,
  // E71-Hygiene: medizinische Maske aus dem Kondomautomaten.
  medMask: MedMaskIcon,
  // Tragbares Schmerz-Radio.
  painRadio: PainRadioIcon,
  // Bodos vergessene grüne Thermoskanne (Tech-Knoten 5610).
  bodoThermos: BodoThermosIcon,
  reichsmark: ReichsmarkIcon,
  peppermint: PeppermintIcon,
  condom: CondomIcon,
  // Akt II — die alte Akte 1978 (Sertl/Marteau). Vorerst geliehenes
  // Akten-Icon (Aushang-Stil, vergilbtes Papier).
  akte1978Sertl: Aushang71Icon,
};

/* ─── Akt-I-Pflichträtsel: Zusatz-Icons ─────────────────── */

/** Bleistiftstummel — kurzer, abgenutzter Bleistift. */
function PencilStubIcon() {
  return (
    <>
      {/* Spitze */}
      <rect x="4" y="11" width="2" height="2" fill={ICON_BG} />
      <rect x="6" y="10" width="2" height="4" fill={ICON_HI} />
      {/* Holzkörper */}
      <rect x="8" y="9" width="9" height="6" fill={ICON_FG} />
      <rect x="8" y="9" width="9" height="1" fill={ICON_HI} />
      <rect x="8" y="14" width="9" height="1" fill={ICON_DK} />
      {/* Metallhülse + Radiergummi */}
      <rect x="17" y="9" width="2" height="6" fill={ICON_DK} />
      <rect x="19" y="10" width="2" height="4" fill={ICON_HI} />
    </>
  );
}

/** Tragbares Schmerz-Radio — kleines Kasten-Radio mit Antenne und Skala. */
function PainRadioIcon() {
  return (
    <>
      {/* Antenne */}
      <rect x="6" y="3" width="1" height="6" fill={ICON_DK} />
      <rect x="6" y="3" width="1" height="1" fill={ICON_HI} />
      {/* Korpus */}
      <rect x="3" y="9" width="18" height="12" fill={ICON_DK} />
      <rect x="4" y="10" width="16" height="10" fill={ICON_FG} />
      <rect x="4" y="10" width="16" height="1" fill={ICON_HI} />
      {/* Skala */}
      <rect x="6" y="12" width="10" height="4" fill={ICON_BG} />
      <rect x="7" y="13" width="8" height="1" fill={ICON_FG} />
      <rect x="10" y="14" width="1" height="2" fill="#b3331a" />
      {/* Knöpfe */}
      <rect x="17" y="12" width="2" height="2" fill={ICON_DK} />
      <rect x="17" y="15" width="2" height="2" fill={ICON_DK} />
      {/* Lautsprecher-Gitter */}
      <rect x="6" y="17" width="10" height="2" fill={ICON_BG} />
      <rect x="7" y="17" width="1" height="2" fill={ICON_FG} opacity="0.5" />
      <rect x="9" y="17" width="1" height="2" fill={ICON_FG} opacity="0.5" />
      <rect x="11" y="17" width="1" height="2" fill={ICON_FG} opacity="0.5" />
      <rect x="13" y="17" width="1" height="2" fill={ICON_FG} opacity="0.5" />
    </>
  );
}

/** Trockensiegel-Abdruck — Bleistift-Reibung auf dünnem Papier. */
function SiegelAbdruckIcon() {
  return (
    <>
      <rect x="3" y="3" width="18" height="18" fill={ICON_HI} />
      <rect x="3" y="3" width="18" height="1" fill={ICON_FG} />
      {/* Wappen-Kontur */}
      <rect x="9" y="6" width="6" height="1" fill={ICON_DK} />
      <rect x="8" y="7" width="8" height="1" fill={ICON_DK} />
      <rect x="8" y="8" width="1" height="6" fill={ICON_DK} />
      <rect x="15" y="8" width="1" height="6" fill={ICON_DK} />
      <rect x="9" y="14" width="6" height="1" fill={ICON_DK} />
      <rect x="10" y="15" width="4" height="1" fill={ICON_DK} />
      <rect x="11" y="16" width="2" height="1" fill={ICON_DK} />
      {/* Reibungs-Schraffur */}
      <rect x="6" y="18" width="12" height="1" fill={ICON_DK} opacity="0.4" />
    </>
  );
}

/** Paragraphen-Notizbuch — schmales Notizbuch mit deutlichem §-Symbol. */
function ParagraphenNotizbuchIcon() {
  return (
    <>
      {/* Buchrücken (links, dunkel, mit Bindung) */}
      <rect x="4" y="3" width="3" height="18" fill={ICON_BG} />
      <rect x="5" y="5" width="1" height="1" fill={ICON_HI} />
      <rect x="5" y="9" width="1" height="1" fill={ICON_HI} />
      <rect x="5" y="13" width="1" height="1" fill={ICON_HI} />
      <rect x="5" y="17" width="1" height="1" fill={ICON_HI} />
      {/* Cover (Karton) */}
      <rect x="7" y="3" width="13" height="18" fill={ICON_DK} />
      <rect x="8" y="4" width="11" height="16" fill={ICON_FG} />
      <rect x="8" y="4" width="11" height="1" fill={ICON_HI} />
      {/* §-Symbol, mittig auf dem Cover */}
      {/* Oberer Bogen */}
      <rect x="12" y="7"  width="4" height="1" fill={ICON_BG} />
      <rect x="11" y="8"  width="1" height="1" fill={ICON_BG} />
      <rect x="15" y="8"  width="1" height="1" fill={ICON_BG} />
      <rect x="12" y="9"  width="3" height="1" fill={ICON_BG} />
      {/* Mittelschwung */}
      <rect x="13" y="10" width="1" height="1" fill={ICON_BG} />
      <rect x="14" y="11" width="1" height="1" fill={ICON_BG} />
      <rect x="13" y="12" width="1" height="1" fill={ICON_BG} />
      <rect x="12" y="13" width="1" height="1" fill={ICON_BG} />
      {/* Unterer Bogen */}
      <rect x="11" y="14" width="4" height="1" fill={ICON_BG} />
      <rect x="11" y="15" width="1" height="1" fill={ICON_BG} />
      <rect x="15" y="15" width="1" height="1" fill={ICON_BG} />
      <rect x="11" y="16" width="4" height="1" fill={ICON_BG} />
      {/* Schräge Punkte (typisch §) */}
      <rect x="17" y="6" width="1" height="1" fill={ICON_BG} />
      <rect x="10" y="17" width="1" height="1" fill={ICON_BG} />
    </>
  );
}

/** Aushang 7.1 — vergilbtes Faksimile. */
function Aushang71Icon() {
  return (
    <>
      <rect x="4" y="3" width="16" height="18" fill={ICON_FG} />
      <rect x="4" y="3" width="16" height="2" fill={ICON_HI} />
      <rect x="4" y="3" width="16" height="1" fill={ICON_DK} />
      {/* "7.1" */}
      <rect x="6" y="6" width="3" height="1" fill={ICON_DK} />
      <rect x="8" y="7" width="1" height="1" fill={ICON_DK} />
      <rect x="7" y="8" width="1" height="1" fill={ICON_DK} />
      <rect x="10" y="8" width="1" height="1" fill={ICON_DK} />
      <rect x="12" y="6" width="1" height="3" fill={ICON_DK} />
      {/* Textzeilen */}
      <rect x="6" y="11" width="12" height="1" fill={ICON_DK} opacity="0.7" />
      <rect x="6" y="13" width="11" height="1" fill={ICON_DK} opacity="0.7" />
      <rect x="6" y="15" width="12" height="1" fill={ICON_DK} opacity="0.7" />
      <rect x="6" y="17" width="9" height="1" fill={ICON_DK} opacity="0.7" />
    </>
  );
}

/** Blanko-Quittungsbogen Schicht B — leeres Carbon-Formular. */
function QuittungBlankoIcon() {
  return (
    <>
      <rect x="4" y="3" width="16" height="18" fill={ICON_HI} />
      <rect x="4" y="3" width="16" height="2" fill={ICON_DK} />
      <rect x="14" y="4" width="5" height="1" fill={ICON_HI} />
      {/* Linien */}
      <rect x="6" y="8" width="12" height="1" fill={ICON_DK} opacity="0.5" />
      <rect x="6" y="11" width="12" height="1" fill={ICON_DK} opacity="0.5" />
      <rect x="6" y="14" width="12" height="1" fill={ICON_DK} opacity="0.5" />
      <rect x="6" y="17" width="8" height="1" fill={ICON_DK} opacity="0.5" />
      {/* Eselsohr */}
      <rect x="17" y="18" width="3" height="3" fill={ICON_FG} />
      <rect x="17" y="18" width="1" height="1" fill={ICON_DK} />
    </>
  );
}

/** Gefälschte Quittung 4317 — wie Blanko, aber mit Stempel + Eintrag. */
function QuittungForgedIcon() {
  return (
    <>
      <rect x="4" y="3" width="16" height="18" fill={ICON_HI} />
      <rect x="4" y="3" width="16" height="2" fill={ICON_DK} />
      {/* Eintrag */}
      <rect x="6" y="7" width="10" height="1" fill={ICON_DK} />
      <rect x="6" y="9" width="8" height="1" fill={ICON_DK} opacity="0.7" />
      <rect x="6" y="11" width="9" height="1" fill={ICON_DK} opacity="0.7" />
      {/* Stempel oben rechts */}
      <rect x="14" y="13" width="6" height="6" fill={ICON_DK} opacity="0.7" />
      <rect x="15" y="14" width="4" height="4" fill={ICON_FG} />
      <rect x="15" y="14" width="4" height="1" fill={ICON_HI} />
      <rect x="16" y="16" width="2" height="1" fill={ICON_DK} />
    </>
  );
}

/** Tilla-Transferbogen — eingehende Rohrpost-Antwort, mit Pfeil. */
function TillaTransferIcon() {
  return (
    <>
      <rect x="3" y="4" width="18" height="16" fill={ICON_FG} />
      <rect x="3" y="4" width="18" height="1" fill={ICON_HI} />
      <rect x="3" y="19" width="18" height="1" fill={ICON_DK} />
      {/* Pfeil "→" */}
      <rect x="6" y="11" width="9" height="2" fill={ICON_BG} />
      <rect x="13" y="9" width="2" height="2" fill={ICON_BG} />
      <rect x="14" y="10" width="2" height="2" fill={ICON_BG} />
      <rect x="15" y="11" width="2" height="2" fill={ICON_BG} />
      <rect x="14" y="13" width="2" height="2" fill={ICON_BG} />
      <rect x="13" y="14" width="2" height="2" fill={ICON_BG} />
      {/* Stempelpunkt unten */}
      <rect x="6" y="16" width="3" height="2" fill={ICON_DK} />
    </>
  );
}

function ItemIconImpl({ id, className, size = 24, title }: Props) {
  const Render = ICON_MAP[id];
  if (!Render) return null;
  return (
    <Frame size={size} className={className} title={title}>
      <Render />
    </Frame>
  );
}

/** Reichsmark — kleiner Münzstapel aus Aluminiumbronze. */
function ReichsmarkIcon() {
  const COIN_DK = "#7a4f1c";
  const COIN_FG = "#d49a3a";
  const COIN_HI = "#fce8b8";
  return (
    <>
      {/* Untere Münze */}
      <rect x="4" y="17" width="16" height="3" fill={COIN_DK} />
      <rect x="5" y="18" width="14" height="2" fill={COIN_FG} />
      <rect x="5" y="18" width="14" height="1" fill={COIN_HI} opacity="0.6" />
      {/* Mittlere Münze */}
      <rect x="4" y="13" width="16" height="3" fill={COIN_DK} />
      <rect x="5" y="14" width="14" height="2" fill={COIN_FG} />
      <rect x="5" y="14" width="14" height="1" fill={COIN_HI} opacity="0.6" />
      {/* Obere Münze (mit Stern/Symbol) */}
      <rect x="4" y="6" width="16" height="6" fill={COIN_DK} />
      <rect x="5" y="7" width="14" height="4" fill={COIN_FG} />
      <rect x="5" y="7" width="14" height="1" fill={COIN_HI} />
      {/* RM-Symbol als zwei kleine Klötze */}
      <rect x="9" y="8" width="2" height="2" fill={ICON_BG} />
      <rect x="13" y="8" width="2" height="2" fill={ICON_BG} />
      <rect x="11" y="9" width="2" height="1" fill={ICON_BG} />
    </>
  );
}

/** Pfefferminzkaugummi — Schachtel mit Streifenmuster. */
function PeppermintIcon() {
  const MINT = "#7fc26b";
  const MINT_DK = "#1f3a1c";
  return (
    <>
      {/* Schachtel */}
      <rect x="4" y="6" width="16" height="13" fill={MINT_DK} />
      <rect x="5" y="7" width="14" height="11" fill={MINT} />
      {/* Folien-Highlight */}
      <rect x="5" y="7" width="14" height="1" fill={ICON_HI} opacity="0.7" />
      {/* Diagonale Streifen */}
      <rect x="6" y="9" width="12" height="1" fill={ICON_HI} opacity="0.6" />
      <rect x="6" y="12" width="12" height="1" fill={ICON_HI} opacity="0.6" />
      <rect x="6" y="15" width="12" height="1" fill={ICON_HI} opacity="0.6" />
      {/* Etikett mittig */}
      <rect x="9" y="10" width="6" height="4" fill={ICON_HI} />
      <rect x="10" y="11" width="4" height="1" fill={MINT_DK} />
      <rect x="10" y="13" width="4" height="1" fill={MINT_DK} />
    </>
  );
}

/** Kondom — quadratisches Folienpäckchen mit aufgeprägtem Ring. */
function CondomIcon() {
  const FOIL = "#b89968";
  const FOIL_DK = "#5a4220";
  return (
    <>
      {/* Päckchen */}
      <rect x="5" y="5" width="14" height="14" fill={FOIL_DK} />
      <rect x="6" y="6" width="12" height="12" fill={FOIL} />
      {/* Glanz */}
      <rect x="6" y="6" width="12" height="1" fill={ICON_HI} opacity="0.7" />
      <rect x="6" y="6" width="1" height="12" fill={ICON_HI} opacity="0.4" />
      {/* Geriffelter oberer Rand */}
      <rect x="6" y="8" width="2" height="1" fill={FOIL_DK} />
      <rect x="9" y="8" width="2" height="1" fill={FOIL_DK} />
      <rect x="12" y="8" width="2" height="1" fill={FOIL_DK} />
      <rect x="15" y="8" width="2" height="1" fill={FOIL_DK} />
      {/* Aufgeprägter Ring (Kondom-Silhouette) */}
      <rect x="9" y="11" width="6" height="1" fill={FOIL_DK} />
      <rect x="8" y="12" width="1" height="3" fill={FOIL_DK} />
      <rect x="15" y="12" width="1" height="3" fill={FOIL_DK} />
      <rect x="9" y="15" width="6" height="1" fill={FOIL_DK} />
      <rect x="10" y="13" width="4" height="1" fill={FOIL_DK} opacity="0.5" />
    </>
  );
}

/**
 * Pixel-Item-Icon. Memoisiert: Props sind primitive (id/size/className/title),
 * dadurch werden die ~550 Zeilen SVG-Switch nicht bei jedem Inventory-/
 * GameContext-Re-Render neu evaluiert.
 */
export const ItemIcon = memo(ItemIconImpl);

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