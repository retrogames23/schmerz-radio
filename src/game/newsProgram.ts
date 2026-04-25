/**
 * "news" — Textbrowser für die Quadranten-Nachrichten.
 *
 * Verfügbar auf Layards UND Bodos Terminal. Es gibt nur eine einzige
 * "Website": ZENTRAL.NETZ / Quadranten-Bote. Sie hat eine Startseite mit
 * verlinkten Untersektoren (Politik, Sicherheit, Versorgung, Kultur,
 * Vermischtes, Wetter) und einen "Newsticker" — eine endlose Lauflinie
 * aus Kurzmeldungen, die im Loop durchläuft, bis der Nutzer eine Taste
 * (Enter) drückt.
 *
 * Die Artikel sind verklausuliert geschrieben: amtsdeutsch, Behörden-
 * jargon, viele Passivkonstruktionen. Zwischen den Zeilen lesbar ist:
 * vieles wurde NICHT von oben angeordnet, sondern von Bewohnern selbst
 * eingefordert. Sicherheitsbedenken, Petitionen, kollektive Anträge.
 *
 * "Grafiken": einfache ASCII-Kontrastbilder, passend zur Phosphor-Optik.
 */

// ── Datenmodell ───────────────────────────────────────────
export interface NewsArticle {
  /** Kurzer Identifier (klein, alphanumerisch + bindestrich). */
  id: string;
  /** Sektor-Id, in dem der Artikel gelistet ist. */
  sektor: string;
  /** Sichtbarer Titel in der Übersicht. */
  titel: string;
  /** Datum / Rubrik-Zeile unter dem Titel. */
  meta: string;
  /** Optionale ASCII-Grafik (Reihenfolge: oben). */
  grafik?: string[];
  /** Artikeltext, eine Zeile pro Absatz / Leerzeile. */
  text: string[];
}

export interface NewsSektor {
  id: string;
  titel: string;
  /** Kurzer Untertitel in der Sektor-Übersicht. */
  untertitel: string;
}

export interface NewsState {
  /** "home" | "<sektor-id>" | "artikel:<id>" | "ticker". */
  view: string;
  /** Aktueller Index in TICKER, wenn view === "ticker". */
  tickerIdx: number;
  finished: boolean;
}

export function newNewsState(): NewsState {
  return { view: "home", tickerIdx: 0, finished: false };
}

// ── Inhalte ───────────────────────────────────────────────
export const NEWS_SEKTOREN: NewsSektor[] = [
  { id: "politik", titel: "Politik & Verwaltung", untertitel: "Verlautbarungen aus den Quadranten-Räten" },
  { id: "sicherheit", titel: "Sicherheit & Ordnung", untertitel: "Zugangsregelungen, Sperrcodes, Bewohner-Anträge" },
  { id: "versorgung", titel: "Versorgung & Lieferung", untertitel: "B-Lieferketten, Kantine, Engpässe" },
  { id: "kultur", titel: "Kultur & Funkbetrieb", untertitel: "Programmhinweise 104,6 · Lesungen · Aushänge" },
  { id: "vermischtes", titel: "Vermischtes", untertitel: "Aus den Korridoren · Leserbriefe · Kleinanzeigen" },
  { id: "wetter", titel: "Wetter & Klima", untertitel: "Innenraumklima · Sektorlüftung" },
];

export const NEWS_ARTICLES: NewsArticle[] = [
  // ── Politik ─────────────────────────────────────────────
  {
    id: "e67-zugang",
    sektor: "politik",
    titel: "Quadrant E67: Verwaltung folgt Bewohner-Antrag auf Zugangsregelung",
    meta: "POLITIK · 04.11.1997 · Beschluss-Nr. E67/97-441",
    grafik: [
      "  ┌──────────────────────┐",
      "  │  ZUTRITT NUR MIT     │",
      "  │  ░░░░ CODE ░░░░       │",
      "  └──────────────────────┘",
    ],
    text: [
      "ZENTRAL.NETZ / Quadranten-Bote. Sektor E67.",
      "",
      "Die Sektorverwaltung E67 ist dem mehrfach vorgebrachten Wunsch der",
      "ortsansässigen Bewohnerschaft nachgekommen und hat den Zugang zum",
      "Quadranten ab sofort über eine standardisierte Code-Sperre",
      "reglementiert. Der entsprechende Antrag — eingebracht durch eine",
      "informelle Bewohner-Versammlung im Mai d. J. — war zuvor durch die",
      "Sektorleitstelle 001 fachlich begleitet und positiv gewürdigt worden.",
      "",
      "Die antragstellende Bewohnerschaft hatte ausdrücklich auf",
      "»wiederholte Begegnungen mit unbekannten Personen aus angrenzenden",
      "Quadranten« sowie ein »diffuses, aber andauerndes Unsicherheits-",
      "gefühl« verwiesen. Die Verwaltung betont in diesem Zusammenhang,",
      "dass eine entsprechende Maßnahme »nicht von Amts wegen", 
      "veranlasst, sondern aus der Mitte der Bewohnerschaft erbeten«",
      "worden sei.",
      "",
      "Der Zugangscode wird durch die Leitstelle 001 verwaltet und auf",
      "schriftlichen Antrag an berechtigte Personen ausgegeben. Eine",
      "Übergangsfrist ist nicht vorgesehen, da »die Bewohnerschaft den",
      "raschen Wirksamkeitseintritt ausdrücklich gewünscht hat«.",
      "",
      "Kritische Stimmen sind in der vorgelagerten Anhörung nicht",
      "vermerkt worden. Die Geschäftsstelle weist darauf hin, dass",
      "Einsprüche binnen einer Frist von vier Wochen schriftlich",
      "eingelegt werden können — vorausgesetzt, die einlegende Person",
      "verfügt bereits über einen gültigen Zugangscode.",
      "",
      "(siehe auch: »Sicherheit & Ordnung« › Petition zur Reglementierung)",
    ],
  },
  {
    id: "selbstverwaltung",
    sektor: "politik",
    titel: "Sektor-Selbstverwaltung: »Wir entscheiden uns für die Ordnung«",
    meta: "POLITIK · 28.10.1997 · Verlautbarung 97-419",
    text: [
      "Die diesjährige Bilanz der Sektor-Selbstverwaltung weist erneut",
      "einen hohen Anteil an Maßnahmen aus, die — wörtlich — »auf",
      "ausdrücklichen Wunsch der Bewohnerschaft« in Kraft gesetzt",
      "worden sind. Hierzu zählen u. a.:",
      "",
      "  · die einheitliche Nachtruheregelung ab 21:30 Uhr",
      "    (Petition Q-E66, 1.142 Unterschriften)",
      "  · das Verbot privater Empfangsantennen außerhalb der",
      "    104,6-Bandbreite (Petition Q-E67, 988 Unterschriften)",
      "  · die Verlängerung der Kantinen-Schließzeiten am Wochenende",
      "    (Petition Q-E68, 1.310 Unterschriften)",
      "  · die Einführung der Quadranten-Code-Sperren (s. eigene Meldung)",
      "",
      "Eine Sprecherin der Geschäftsstelle erklärte hierzu: »Es ist nicht",
      "die Verwaltung, die Grenzen zieht. Es sind die Bewohner, die uns",
      "die Stifte in die Hand drücken. Wir führen lediglich aus.«",
      "",
      "Eine systematische Erfassung abweichender Voten ist verwaltungs-",
      "seitig nicht vorgesehen, da Bewohner mit abweichender Auffassung",
      "die ihnen zustehenden Petitionsrechte »jederzeit eigenständig",
      "wahrnehmen« könnten.",
    ],
  },

  // ── Sicherheit ───────────────────────────────────────────
  {
    id: "petition-reglementierung",
    sektor: "sicherheit",
    titel: "Petition E67-PT-0411: Bewohner fordern strengere Zugangsregelung",
    meta: "SICHERHEIT · 11.04.1997 · Eingangsbestätigung 97-187",
    grafik: [
      "   ╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳",
      "   ╳ 1.247 UNTERSCHRIFTEN ╳",
      "   ╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳",
    ],
    text: [
      "Im Sektorbüro E67 ist die Petition Nr. E67-PT-0411 mit insgesamt",
      "1.247 gültigen Unterschriften eingegangen. Die Petenten — sämtlich",
      "Bewohner des Quadranten E67 — fordern darin »eine unverzügliche",
      "Reglementierung des Zugangs zu unserem Quadranten durch eine",
      "verbindliche, von der Verwaltung ausgegebene Sperrkennung«.",
      "",
      "Zur Begründung führen die Petenten aus:",
      "",
      "  »Wiederholt haben sich in den Korridoren des Quadranten",
      "  Personen aufgehalten, deren Anwesenheit weder durch ein",
      "  Bewohnerverhältnis noch durch einen erkennbaren dienstlichen",
      "  Anlass gerechtfertigt erschien. Diese Beobachtung führt unter",
      "  den Unterzeichnenden zu einem nachhaltigen Unwohlsein, das",
      "  die Wahrnehmung der eigenen Wohnverhältnisse als geschützter",
      "  Bereich erheblich beeinträchtigt.«",
      "",
      "  »Wir verkennen nicht, dass eine Sperrkennung den eigenen",
      "  Bewegungsspielraum geringfügig einschränkt. Diesen Verzicht",
      "  nehmen wir ausdrücklich auf uns. Wer berechtigt ist, dem",
      "  wird der Code mitgeteilt; wer nicht berechtigt ist, hat in",
      "  unserem Korridor nichts zu suchen.«",
      "",
      "Die Verwaltung hat die Petition mit Beschluss vom 04.11.1997",
      "vollumfänglich angenommen (s. »Politik« › Beschluss E67/97-441).",
      "",
      "Im Sektorbüro liegt die Unterschriftenliste zur Einsicht aus.",
      "Eine namentliche Abfrage einzelner Unterzeichner ist nicht",
      "vorgesehen.",
    ],
  },
  {
    id: "code-ausgabe",
    sektor: "sicherheit",
    titel: "Code-Ausgabe E67: Hinweise zur Antragstellung",
    meta: "SICHERHEIT · 05.11.1997 · Merkblatt 97-203",
    text: [
      "Bewohner des Quadranten E67 erhalten den Zugangscode auf",
      "schriftlichen Antrag bei der Sektorleitstelle 001. Folgende",
      "Unterlagen sind beizubringen:",
      "",
      "  1. Bewohner-Erfassungsbogen (Formular B-2611)",
      "  2. Unbedenklichkeits-Erklärung der Hausverwaltung",
      "  3. Bestätigung des derzeitigen Wohnverhältnisses",
      "     (nicht älter als 14 Tage)",
      "",
      "Eine Ersatzausstellung bei Verlust des Codes ist möglich; sie",
      "erfordert eine erneute Erklärung sowie die schriftliche",
      "Versicherung, »den verlorenen Code keiner unbefugten Person",
      "weitergegeben oder zur Kenntnis gebracht zu haben«.",
      "",
      "Die Verwaltung weist erneut darauf hin, dass die Reglementierung",
      "auf ausdrücklichen Bewohner-Antrag eingeführt worden ist (s.",
      "»Sicherheit« › Petition E67-PT-0411).",
    ],
  },
  {
    id: "nachbarschaftswache",
    sektor: "sicherheit",
    titel: "Bewohner-Initiative »Achtsamer Korridor« meldet 312 Beobachtungen",
    meta: "SICHERHEIT · 30.10.1997 · Initiativbericht III-97",
    text: [
      "Die Bewohner-Initiative »Achtsamer Korridor«, gegründet vor zwei",
      "Jahren auf Anregung mehrerer Sektoren, hat im laufenden Jahr",
      "insgesamt 312 Beobachtungen an die zuständigen Leitstellen",
      "weitergegeben. Die Meldungen betrafen:",
      "",
      "  · ungewöhnliches Klopfen an Wohnungstüren  (104)",
      "  · längeres Verweilen vor fremden Türen     ( 78)",
      "  · Empfangsversuche außerhalb 104,6         ( 61)",
      "  · auffällige Stille einzelner Wohnungen    ( 41)",
      "  · sonstige sicherheitsrelevante Vorgänge   ( 28)",
      "",
      "Die Initiative betont, sie verstehe sich »ausdrücklich nicht als",
      "verlängerter Arm der Verwaltung«, sondern als »ein Zusammenschluss",
      "verantwortungsbewusster Bewohner, denen die Ruhe ihrer Nachbarn",
      "ein persönliches Anliegen« sei.",
      "",
      "Die Verwaltung bedankt sich für die »unermüdliche, ehrenamtliche",
      "Mitwirkung«. Eine Aufwandsentschädigung sei mangels Antrag nicht",
      "vorgesehen; die Mitwirkung erfolge »aus innerer Überzeugung«.",
    ],
  },

  // ── Versorgung ───────────────────────────────────────────
  {
    id: "b3-engpass",
    sektor: "versorgung",
    titel: "B3-Lieferkette: »Punktuelle Verzögerungen« bestätigt",
    meta: "VERSORGUNG · 06.11.1997 · Mitteilung Z.N. / Beschaffung",
    grafik: [
      "  ▓▓▓▓▓▓▓▓▓░░░░░░  60 %",
      "  Lagerbestand B3, Stand: 06.11.",
    ],
    text: [
      "Die Beschaffungsstelle ZENTRAL.NETZ bestätigt »punktuelle",
      "Verzögerungen« in der B3-Lieferkette einzelner Sektoren. Betroffen",
      "sind insbesondere die Quadranten E66 bis E68. Eine Wiederaufnahme",
      "der regulären Belieferung ist für Freitag d. W. vorgesehen.",
      "",
      "Die Verzögerung ist nach Auskunft der Beschaffungsstelle nicht auf",
      "logistische Engpässe, sondern auf »eine durch die Bewohnerschaft",
      "selbst getragene Umstellung der Bestellmodalitäten« zurückzuführen.",
      "Hintergrund ist eine im Frühjahr eingebrachte Petition, die eine",
      "»konsumbewusstere und verbindlichere« Bestellpraxis gefordert",
      "hatte.",
      "",
      "Die ZENTRAL.NETZ empfiehlt betroffenen Bewohnern, »Bestände",
      "behutsam einzuteilen« und gegebenenfalls auf Ersatzsorten",
      "auszuweichen. Reklamationen sind über die Hausverwaltung zu",
      "richten — nicht über die Beschaffungsstelle direkt.",
    ],
  },
  {
    id: "kantine-oeffnung",
    sektor: "versorgung",
    titel: "Kantine 26: Schließzeiten erneut verlängert — Bewohner-Beschluss",
    meta: "VERSORGUNG · 22.10.1997 · Aushang K-26",
    text: [
      "Die Schließzeiten der Kantine 26 werden — wie schon im Vorjahr —",
      "auf ausdrücklichen Beschluss der Bewohnerversammlung erneut",
      "ausgeweitet. Die Kantine ist ab sofort an Wochenenden ganztags",
      "geschlossen. Werktags wird das Mittagsfenster auf eine Stunde",
      "(12:30 – 13:30 Uhr) verkürzt.",
      "",
      "In der Begründung der Bewohnerversammlung heißt es u. a.:",
      "»Längere Öffnungszeiten verleiten zu unnötigen Korridor-",
      "bewegungen und tragen zur diffusen Geräuschkulisse im Sektor",
      "bei.« Die Verwaltung bestätigt diese Einschätzung und dankt",
      "der Versammlung für die »eigenverantwortliche Selbstdisziplin«.",
      "",
      "Bewohner, die auf erweiterte Versorgung angewiesen sind, werden",
      "gebeten, einen entsprechenden Härtefall-Antrag einzubringen.",
      "Bisher liegen keine derartigen Anträge vor.",
    ],
  },

  // ── Kultur ───────────────────────────────────────────────
  {
    id: "104-6-programm",
    sektor: "kultur",
    titel: "104,6 — Programmwoche 45: »Stille zwischen den Stunden«",
    meta: "KULTUR · 03.11.1997 · Programmblatt 45/97",
    grafik: [
      "    .-\"\"-.",
      "   /  ((  \\    104,6",
      "   \\  ))  /    Quadranten-Funk",
      "    '-..-'",
    ],
    text: [
      "Das Quadranten-Programm 104,6 setzt in der laufenden Woche seine",
      "im Frühjahr begonnene Reihe »Stille zwischen den Stunden« fort.",
      "Vorgesehen sind tägliche Sendepausen von je drei Minuten Länge,",
      "die laut Sendeleitung »dem Hörer ein Innehalten« ermöglichen",
      "sollen.",
      "",
      "Die Sendepausen werden nicht angekündigt. Die Sendeleitung weist",
      "darauf hin, dass die »ungeplante Konfrontation mit Stille« Teil",
      "des Konzeptes sei und nicht als technische Störung interpretiert",
      "werden solle.",
      "",
      "Empfangsstörungen außerhalb der Sendepausen sind der Leitstelle",
      "schriftlich zu melden. Eine Überprüfung erfolgt im Rahmen der",
      "regulären Wartung.",
      "",
      "Hörer-Reaktionen werden ausdrücklich erbeten — vorzugsweise auf",
      "dem Postweg.",
    ],
  },
  {
    id: "lesung-1534",
    sektor: "kultur",
    titel: "Lesung in 1534: »Räume, die zu lange leer stehen«",
    meta: "KULTUR · 02.11.1997 · Aushang Sektor 15",
    text: [
      "In der Wohnung 1534 (Quadrant E15) ist für den kommenden Donnerstag",
      "eine private Lesung angekündigt. Vorgetragen werden, so der",
      "handgeschriebene Aushang, »kürzere Texte über Menschen, die nicht",
      "zurückkommen, und über Räume, die zu lange leer stehen«.",
      "",
      "Eine Anmeldung ist nicht vorgesehen. Die Lesung sei »offen für",
      "alle, die zuhören möchten — und auch für die, die nicht sicher",
      "sind, ob sie zuhören möchten«.",
      "",
      "Die Sektorverwaltung weist vorsorglich darauf hin, dass private",
      "Versammlungen ab acht Personen anmeldepflichtig sind. Eine",
      "Anmeldung ist im vorliegenden Fall nicht eingegangen; die",
      "Verwaltung geht davon aus, dass die Teilnehmerzahl unter dem",
      "genannten Schwellenwert verbleibt.",
    ],
  },

  // ── Vermischtes ──────────────────────────────────────────
  {
    id: "leserbrief-klopfen",
    sektor: "vermischtes",
    titel: "Leserbrief: »Das Klopfen in der Wand« — Ein Anwohner schreibt",
    meta: "VERMISCHTES · 28.10.1997 · Eingang per Hauspost",
    text: [
      "Im redaktionellen Eingang ging in der vergangenen Woche folgender",
      "Leserbrief ein, den wir — gekürzt und sprachlich behutsam",
      "geglättet — wiedergeben:",
      "",
      "  »Seit einigen Wochen klopft es in der Wand zwischen meiner",
      "  Wohnung und der Nachbarwohnung. Es ist kein Klopfen wie von",
      "  Rohren, sondern eines, das antwortet, wenn man selbst klopft.",
      "  Ich habe es der Hausverwaltung gemeldet. Die Hausverwaltung",
      "  hat mir mitgeteilt, dass für nicht-rohrgebundenes Klopfen",
      "  keine Zuständigkeit bestehe. Vielleicht weiß ein anderer Leser",
      "  Rat. — Ph., E67«",
      "",
      "Anmerkung der Redaktion: Wir bitten um Verständnis, dass wir auf",
      "individuelle Klopfgeräusche nicht im Einzelnen eingehen können.",
      "Eine Weiterleitung an die zuständige Stelle ist erfolgt, sofern",
      "eine zuständige Stelle besteht.",
    ],
  },
  {
    id: "kleinanzeigen",
    sektor: "vermischtes",
    titel: "Kleinanzeigen Woche 45",
    meta: "VERMISCHTES · 03.11.1997 · Anzeigenblock W-45",
    text: [
      "  ▸ Suche: gut erhaltene B2-Konserve, Sorte beliebig.",
      "    Tausch gegen B3-trocken (1:1) möglich.  — W., E67/2611",
      "",
      "  ▸ Biete: handgeschriebene Abschriften älterer 104,6-",
      "    Sendungen. Pro Stunde Sendung eine Stunde Vorlesen",
      "    in Ihrer Wohnung.  — anonym, Hauspost an Sektor 15",
      "",
      "  ▸ Zu verschenken: ein Schreibheft, etwa zur Hälfte voll.",
      "    Die zweite Hälfte kann unter Umständen zurückerbeten",
      "    werden, falls der Verfasser sie noch braucht.  — L., E67",
      "",
      "  ▸ Verloren: Zugangscode E67. Bitte NICHT abgeben — bitte",
      "    direkt zerstören.  — namentlich nicht angegeben",
      "",
      "  ▸ Suche Kontakt zu Bewohnern, die ihren Nachbarn noch beim",
      "    Vornamen nennen. Antworten erbeten, ggf. mit Vornamen.",
      "    — P., E67/2613",
    ],
  },

  // ── Wetter ───────────────────────────────────────────────
  {
    id: "klima-e67",
    sektor: "wetter",
    titel: "Innenraumklima E67: stabil bei 19,4 °C — Bewohnerwunsch",
    meta: "WETTER · 06.11.1997 · Klimaprotokoll E67",
    grafik: [
      "    │     ____",
      "    │    /    \\___",
      "    │   /         \\____",
      "    │__/_______________\\__",
      "    Mo  Di  Mi  Do  Fr  Sa",
      "    Verlauf 19,2 – 19,5 °C",
    ],
    text: [
      "Die Innenraumtemperatur im Quadranten E67 wurde in der laufenden",
      "Woche durchgehend zwischen 19,2 und 19,5 °C gemessen. Die",
      "Klimasteuerung folgt damit dem in der Bewohnerumfrage 96/04",
      "festgelegten Sollwert von 19,4 °C (± 0,3 K).",
      "",
      "Die Sollwert-Festlegung war seinerzeit auf ausdrücklichen",
      "Bewohner-Beschluss erfolgt, mit der Begründung, ein »wärmerer",
      "Sektor« lade zu »übermäßigem Verweilen in den Gemeinschafts-",
      "bereichen« ein.",
      "",
      "Eine Anpassung des Sollwerts ist über das übliche Antragsverfahren",
      "möglich. Bislang sind keine Anträge auf Anhebung eingegangen.",
    ],
  },
];

// ── Newsticker ────────────────────────────────────────────
/**
 * Endlosschleife. Im Ticker-View durchläuft eine Meldung nach der
 * anderen, jede für ein paar Sekunden, bis der Nutzer Enter drückt.
 */
export const NEWS_TICKER: string[] = [
  "+++ Sektor E67: Zugangscode-Sperre auf Bewohner-Antrag in Kraft +++",
  "+++ Petition E66/97-518: Nachtruhe ab 21:00 Uhr — 1.402 Unterschriften +++",
  "+++ B3-Belieferung Quadrant E67 ab Freitag wieder im Regelbetrieb +++",
  "+++ Initiative »Achtsamer Korridor« meldet 312 Beobachtungen im Jahr +++",
  "+++ 104,6 — heute drei Sendepausen à drei Minuten, ungeplant ungeplant +++",
  "+++ Kantine 26: Wochenend-Schließung auf Beschluss der Bewohnerversammlung +++",
  "+++ Sektorbüro: keine Einsprüche gegen Code-Sperre eingegangen +++",
  "+++ Klima E67 stabil bei 19,4 °C — Sollwert seit 1996 unverändert +++",
  "+++ Hausverwaltung: nicht-rohrgebundenes Klopfen nicht zuständig +++",
  "+++ Lesung in 1534: »Räume, die zu lange leer stehen« · Donnerstag +++",
  "+++ Bewohnerversammlung dankt Verwaltung für »entgegenkommende Umsetzung« +++",
  "+++ Reklamationen über Hausverwaltung — nicht über Beschaffungsstelle +++",
  "+++ Empfangsstörungen außerhalb 104,6 sind anmeldepflichtig +++",
  "+++ Zentrale erinnert: Wer berechtigt ist, kennt den Code +++",
  "+++ Quadranten-Bote: Leserbriefe weiterhin per Hauspost erbeten +++",
];

// ── Anzeige-Helfer ────────────────────────────────────────
const HR = "──────────────────────────────────────────────────";

function bannerLines(): string[] {
  return [
    "╔══════════════════════════════════════════════════╗",
    "║  ZENTRAL.NETZ  ·  QUADRANTEN-BOTE  ·  Ausg. 45  ║",
    "║  Textbrowser »news« v0.9                         ║",
    "╚══════════════════════════════════════════════════╝",
    "",
  ];
}

export function newsStart(_state: NewsState): string[] {
  return [...bannerLines(), ...renderHome()];
}

function renderHome(): string[] {
  const out: string[] = [
    "  ▸ STARTSEITE",
    "",
    "  Untersektoren:",
    "",
  ];
  for (const s of NEWS_SEKTOREN) {
    const id = `[${s.id}]`.padEnd(16);
    out.push(`    ${id} ${s.titel}`);
    out.push(`    ${"".padEnd(16)} ${s.untertitel}`);
    out.push("");
  }
  out.push("  Sonderrubrik:");
  out.push("");
  out.push("    [ticker]         Newsticker — laufende Kurzmeldungen");
  out.push("                     (im Loop, Enter beendet die Anzeige)");
  out.push("");
  out.push(HR);
  out.push("  Befehle:  open <id>  ·  back  ·  hilfe  ·  exit");
  out.push("");
  return out;
}

function renderSektor(sektorId: string): string[] {
  const s = NEWS_SEKTOREN.find((x) => x.id === sektorId);
  if (!s) return [`unbekannter sektor: ${sektorId}`, ""];
  const articles = NEWS_ARTICLES.filter((a) => a.sektor === sektorId);
  const out: string[] = [
    `  ▸ ${s.titel.toUpperCase()}`,
    `    ${s.untertitel}`,
    "",
  ];
  if (!articles.length) {
    out.push("    (keine Meldungen in diesem Sektor.)");
    out.push("");
  } else {
    for (const a of articles) {
      out.push(`    [${a.id}]`);
      out.push(`        ${a.titel}`);
      out.push(`        ${a.meta}`);
      out.push("");
    }
  }
  out.push(HR);
  out.push("  Befehle:  open <id>  ·  back  ·  home  ·  exit");
  out.push("");
  return out;
}

function renderArtikel(id: string): string[] {
  const a = NEWS_ARTICLES.find((x) => x.id === id);
  if (!a) return [`unbekannter artikel: ${id}`, ""];
  const sektor = NEWS_SEKTOREN.find((x) => x.id === a.sektor);
  const out: string[] = [
    `  ▸ ${sektor?.titel ?? a.sektor.toUpperCase()}  ›  ${a.id}`,
    "",
    `  ${a.titel}`,
    `  ${a.meta}`,
    "",
  ];
  if (a.grafik) {
    out.push(...a.grafik);
    out.push("");
  }
  for (const line of a.text) out.push(`  ${line}`);
  out.push("");
  out.push(HR);
  out.push(`  Befehle:  back  ·  home  ·  open <id>  ·  exit`);
  out.push("");
  return out;
}

/**
 * Eine Ticker-Frame: zeigt drei aufeinanderfolgende Meldungen aus dem
 * NEWS_TICKER, beginnend bei state.tickerIdx. Der Index wird im State
 * weitergeschoben — der Aufrufer kümmert sich um das Loopen.
 */
export function renderTickerFrame(state: NewsState): string[] {
  const n = NEWS_TICKER.length;
  const i0 = ((state.tickerIdx % n) + n) % n;
  const i1 = (i0 + 1) % n;
  const i2 = (i0 + 2) % n;
  return [
    "  ▸ NEWSTICKER  ·  ZENTRAL.NETZ live",
    "",
    `  >  ${NEWS_TICKER[i0]}`,
    `     ${NEWS_TICKER[i1]}`,
    `     ${NEWS_TICKER[i2]}`,
    "",
    HR,
    "  Enter beendet den Ticker.  ·  exit beendet news.",
    "",
  ];
}

// ── Kommandos ─────────────────────────────────────────────
export interface NewsResult {
  out: string[];
  quit?: boolean;
  /** Wenn true: Aufrufer soll den Ticker-Loop starten. */
  startTicker?: boolean;
  /** Wenn true: Aufrufer soll den Ticker-Loop beenden. */
  stopTicker?: boolean;
}

const HILFE: string[] = [
  "befehle:",
  "  home                 — startseite anzeigen",
  "  open <id>            — sektor oder artikel öffnen",
  "                         (z. B. »open politik«, »open e67-zugang«)",
  "  back                 — eine ebene zurück",
  "  ticker               — newsticker starten (loop, enter beendet)",
  "  hilfe                — diese liste",
  "  exit                 — news beenden",
  "",
];

/** Auflösen einer ID: zuerst Sektor, dann Artikel. */
function resolveOpen(id: string): { kind: "sektor" | "artikel"; id: string } | null {
  const lower = id.toLowerCase();
  if (NEWS_SEKTOREN.some((s) => s.id === lower)) return { kind: "sektor", id: lower };
  if (NEWS_ARTICLES.some((a) => a.id === lower)) return { kind: "artikel", id: lower };
  return null;
}

export function newsCommand(state: NewsState, input: string): NewsResult {
  const raw = input.trim();
  // Ticker-View: jede Eingabe (auch leere) beendet den Ticker und kehrt
  // zur Startseite zurück.
  if (state.view === "ticker") {
    state.view = "home";
    return { out: renderHome(), stopTicker: true };
  }

  if (!raw) return { out: [] };
  const tokens = raw.split(/\s+/);
  const head = (tokens[0] ?? "").toLowerCase();
  const arg = (tokens[1] ?? "").toLowerCase();

  if (head === "exit" || head === "quit" || head === "logout" || head === "ende") {
    return { out: ["news beendet."], quit: true };
  }

  if (head === "hilfe" || head === "help" || head === "?") {
    return { out: HILFE };
  }

  if (head === "home" || head === "start") {
    state.view = "home";
    return { out: renderHome() };
  }

  if (head === "back" || head === "zurück" || head === "zurueck" || head === "..") {
    if (state.view.startsWith("artikel:")) {
      const a = NEWS_ARTICLES.find((x) => x.id === state.view.slice("artikel:".length));
      if (a) {
        state.view = a.sektor;
        return { out: renderSektor(a.sektor) };
      }
    }
    state.view = "home";
    return { out: renderHome() };
  }

  if (head === "ticker") {
    state.view = "ticker";
    state.tickerIdx = 0;
    return { out: renderTickerFrame(state), startTicker: true };
  }

  if (head === "open" || head === "öffnen" || head === "oeffnen") {
    if (!arg) {
      return {
        out: [
          "open: id fehlt. bitte: »open <sektor-oder-artikel-id>«",
          "      (verfügbare ids: home zeigt sie an.)",
          "",
        ],
      };
    }
    const target = resolveOpen(arg);
    if (!target) {
      return {
        out: [
          `open: »${tokens[1]}« nicht gefunden.`,
          "      tippe »home« für die übersicht.",
          "",
        ],
      };
    }
    if (target.kind === "sektor") {
      state.view = target.id;
      return { out: renderSektor(target.id) };
    }
    state.view = `artikel:${target.id}`;
    return { out: renderArtikel(target.id) };
  }

  // Bequemlichkeit: »politik«, »e67-zugang« etc. ohne »open« davor.
  const direct = resolveOpen(head);
  if (direct) {
    if (direct.kind === "sektor") {
      state.view = direct.id;
      return { out: renderSektor(direct.id) };
    }
    state.view = `artikel:${direct.id}`;
    return { out: renderArtikel(direct.id) };
  }

  return {
    out: [
      `unbekannter befehl: »${raw}«. tippe »hilfe«.`,
      "",
    ],
  };
}

// ── Tab-Completion ────────────────────────────────────────
const NEWS_COMMANDS = ["home", "open", "back", "ticker", "hilfe", "exit"];

function lcp(strs: string[]): string {
  if (!strs.length) return "";
  let p = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (strs[i].indexOf(p) !== 0) {
      p = p.slice(0, -1);
      if (!p) return "";
    }
  }
  return p;
}

export interface NewsCompleteResult {
  newInput: string;
  matches: string[];
}

export function newsComplete(input: string): NewsCompleteResult {
  const tokens = input.split(/\s+/);
  const last = (tokens[tokens.length - 1] ?? "").toLowerCase();

  if (tokens.length <= 1) {
    const matches = NEWS_COMMANDS.filter((c) => c.startsWith(last));
    if (!matches.length) return { newInput: input, matches: [] };
    const completed = lcp(matches);
    const newLast = matches.length === 1 ? matches[0] + " " : completed;
    return { newInput: newLast, matches };
  }

  const head = tokens[0].toLowerCase();
  if (head === "open" && tokens.length === 2) {
    const ids = [
      ...NEWS_SEKTOREN.map((s) => s.id),
      ...NEWS_ARTICLES.map((a) => a.id),
    ];
    const matches = ids.filter((id) => id.startsWith(last));
    if (!matches.length) return { newInput: input, matches: [] };
    const completed = lcp(matches);
    const newLast = matches.length === 1 ? matches[0] + " " : completed;
    const newInput = [tokens[0], newLast].join(" ");
    return { newInput, matches };
  }

  return { newInput: input, matches: [] };
}

// ── Public: ein Schritt im Ticker-Loop (vom Terminal aufgerufen) ─
export function nextTickerFrame(state: NewsState): string[] {
  state.tickerIdx = (state.tickerIdx + 1) % NEWS_TICKER.length;
  return renderTickerFrame(state);
}