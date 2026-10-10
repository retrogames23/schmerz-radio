import type { GameApi, KnowledgeFlag, StoryFlag } from "./types";

/**
 * Wissens-Register — was Layard über die Resonanzüberlastung weiß.
 *
 * Grundlage für alle Gespräche, in denen Layard entscheiden kann, ob er
 * etwas offenlegt oder für sich behält. Der erste Ort, an dem das greift,
 * ist Zimmer 5011 der Zentralverwaltungsstelle. Das System ist bewusst
 * schlank gehalten und wird später ausgebaut (u. a. „Zero is Infinity“).
 */
export interface KnowledgeEntry {
  id: KnowledgeFlag;
  /** Kurzname für Übersichten / Protokolle. */
  label: string;
  /** Woher Layard das weiß. */
  source: string;
  /** Wie heikel es ist, das der Verwaltung zu sagen. */
  sensitivity: "harmlos" | "heikel" | "brisant";
  /** Frage der Sachbearbeiterin in 5011. */
  question: string;
  /** Layards Antwort, wenn er offenlegt. */
  share: string;
  /** Layards Antwort, wenn er ausweicht. */
  withhold: string;
  /** Vermerk der Sachbearbeiterin nach dem Offenlegen. */
  noted: string;
  /** Wird in 5011 (Akt II, erster Besuch) überhaupt abgefragt? */
  askedAt5011: boolean;
  /** Storyflag, aus dem sich dieses Wissen ergibt. */
  from: StoryFlag;
  /** Zusätzlich nötiges Flag. */
  alsoFrom?: StoryFlag;
}

export const KNOWLEDGE_ENTRIES: KnowledgeEntry[] = [
  {
    id: "collapse2615",
    label: "Zusammenbruch in Wohnung 2615",
    source: "Sanitätereinsatz in E67, Etage 2",
    sensitivity: "harmlos",
    question:
      "Beginnen wir vorne. Sie wohnen in E67. Ist Ihnen dort ein Vorfall bekannt, der mit einer Überlastung in Zusammenhang stehen könnte?",
    share:
      "Wohnung 2615. Der Nachbar ist zusammengebrochen, die Tür musste aufgebrochen werden. Vorher hat es tagelang durch die Wand gedrückt — kein Lärm, eher ein Druck.",
    withhold:
      "In E67 ist es ruhig. Nichts, was ich als Vorfall bezeichnen würde.",
    noted: "2615. Aufgebrochen. Druckempfinden vorlaufend. Ist vermerkt.",
    askedAt5011: true,
    from: "paramedicsArrived",
  },
  {
    id: "protocolContent",
    label: "Inhalt des Protokolls",
    source: "Protokollblatt aus dem Einsatz",
    sensitivity: "heikel",
    question: "Liegt Ihnen dazu etwas Schriftliches vor?",
    share:
      "Ein Protokollblatt. Der Befund steht drin, und darunter eine Zeile, die den Befund wieder zurücknimmt. Beide Zeilen tragen dieselbe Paraphe.",
    withhold:
      "Nichts, was ich in dieser Form vorlegen könnte. Ich habe es mir gemerkt, nicht mitgenommen.",
    noted:
      "Schriftstück vorhanden. Widersprüchliche Eintragung. Das kommt vor.",
    askedAt5011: true,
    from: "protocolReceived",
  },
  {
    id: "responsibilityE67",
    label: "Zuständigkeitslage E67",
    source: "Leitstelle E67",
    sensitivity: "harmlos",
    question: "Wie ist die Bearbeitung vor Ort gelaufen?",
    share:
      "Die Leitstelle nimmt auf und gibt weiter. Weitergegeben wird an eine Stelle, die die Sache an die Leitstelle zurückgibt. Zuständig war am Ende der Bewohner.",
    withhold: "Die Bearbeitung ist gelaufen. Mehr kann ich dazu nicht sagen.",
    noted: "Bearbeitungsweg unklar. Wird als Verfahrenshinweis geführt.",
    askedAt5011: true,
    from: "calledLeitstelle",
  },
  {
    id: "walterBearing",
    label: "Peilung eines verstärkten Trägers",
    source: "Walter Grewe, Wohnung 1103, E71",
    sensitivity: "heikel",
    question:
      "Sind Ihnen Messungen bekannt? Ich meine: Messungen, die nicht von uns stammen.",
    share:
      "Ein Bewohner in E71 misst privat. Er hat einen verstärkten Träger angepeilt: Nordwest, drei- bis fünfhundert Meter. Das ist E67.",
    withhold:
      "Messungen kenne ich nur aus dem Wetterbericht. Da wird ja auch Resonanz angesagt.",
    noted:
      "Privatmessung, nicht anerkanntes Gerät. Wird als Wahrnehmungsschwankung geführt. Name?",
    askedAt5011: true,
    from: "walterBearing",
  },
  {
    id: "carrierTruth",
    label: "Der Träger liegt auf der Hausversorgung",
    source: "Bodo Marschke, Hausmeisterei E67",
    sensitivity: "heikel",
    question: "Haben Sie eine Vorstellung, woher die Belastung kommt?",
    share:
      "Sie liegt auf der Hausversorgung. Wer das Haus versorgt, versorgt auch das mit, was die Leute drückt.",
    withhold:
      "Woher sie kommt, ist genau die Frage, die ich Ihnen stellen wollte.",
    noted: "Versorgungsbezug behauptet. Technisch nicht vorgesehen.",
    askedAt5011: true,
    from: "bodoToldCarrierTruth",
  },
  {
    id: "radioOrigin",
    label: "Herkunft der Empfangsgeräte",
    source: "Gerät in Layards Wohnung",
    sensitivity: "heikel",
    question: "Verfügen Sie über ein Gerät, das die Belastung hörbar macht?",
    share:
      "Ich habe ein Gerät. Es hört nicht Sender, es hört das, was zwischen den Leuten ungesagt bleibt. Ausgegeben hat es niemand.",
    withhold: "Ich habe ein Radio wie jeder. Zwei Wellenbereiche, einer davon tot.",
    noted: "Gerät ohne Zuteilungsnachweis. Das wäre gesondert zu klären.",
    askedAt5011: true,
    from: "tookPainRadio",
  },
  {
    id: "vorgangsspur5610",
    label: "Vorgangsbestand des Hauses E67",
    source: "Vorgangsknoten 5610, Technikraum E67",
    sensitivity: "brisant",
    question:
      "Sie sprechen von Meldungen. Haben Sie einen Überblick, was aus den Meldungen aus E67 geworden ist?",
    share:
      "Einundvierzig Vorgänge seit Januar. Vierunddreißig davon geschlossen mit »nicht vorgesehen«, alle mit derselben Paraphe. Und im Vorgang 5245 steht der Befund und vier Minuten später seine Rücknahme — ebenfalls dieselbe Paraphe.",
    withhold:
      "Was aus den Meldungen geworden ist, weiß ich nicht. Ich habe sie nur eingereicht wie alle anderen.",
    noted:
      "Bestandsauszug behauptet. Wenn Sie ihn vorlegen können, wird er geprüft. Wenn nicht, bleibt es Ihre Wahrnehmung.",
    askedAt5011: true,
    from: "readVorgangsliste5610",
  },
  {
    id: "wordControl",
    label: "Sprache als Steuerung",
    source: "Mikael, Verwaltungszimmer E71",
    sensitivity: "brisant",
    question:
      "Eine letzte Frage der Vollständigkeit halber: Halten Sie die Belastung für ein technisches Problem?",
    share:
      "Nein. Sie wird nicht erzeugt, sie wird verwaltet. Wer festlegt, welches Wort auf einen Zustand passt, legt fest, ob es den Zustand gibt.",
    withhold:
      "Ich halte sie für ein Problem, für das es sicher ein Formblatt gibt.",
    noted:
      "Grundsätzliche Einschätzung. Ich notiere sie unter Ihrer Wahrnehmung, nicht unter Sachstand.",
    askedAt5011: true,
    from: "heardMikaelTruth",
  },
  {
    id: "e71Denial",
    label: "Ablehnung in E71",
    source: "Verwaltungszimmer E71",
    sensitivity: "heikel",
    question: "Wurde Ihnen an anderer Stelle bereits etwas abgelehnt?",
    share:
      "In E71. Das Protokoll wurde nicht angenommen — nicht bestritten, nur nicht angenommen.",
    withhold: "Abgelehnt wurde mir nichts. Angenommen allerdings auch nichts.",
    noted: "Nichtannahme in E71. Vermerk geht dorthin zurück.",
    askedAt5011: true,
    from: "mikaelRejectedProtocol",
  },
  {
    id: "miraNetwork",
    label: "Bewohnerin mit eigenem Rechner",
    source: "Mira, Wohnung 4601",
    sensitivity: "brisant",
    question:
      "Gibt es in E67 Bewohner, die sich, sagen wir, über den Bestand hinaus mit Technik befassen?",
    share:
      "Eine Bewohnerin hat einen eigenen Rechner und kommt damit an Leitungen, an die sie nicht kommen sollte.",
    withhold:
      "In E67 befasst sich niemand mit Technik. Da befasst sich die Technik mit den Leuten.",
    noted: "Angabe zu einer Person. Etage? Nummer? — Später, wenn Sie mögen.",
    askedAt5011: true,
    from: "metMira",
    alsoFrom: "miraSystemic",
  },
  {
    id: "gfaContact",
    label: "Manifest der Global Future Alliance",
    source: "Wohnung 1103, E71",
    sensitivity: "brisant",
    question: "",
    share: "",
    withhold: "",
    noted: "",
    askedAt5011: false,
    from: "gfaManifestTaken",
  },
  {
    id: "philippeProbing",
    label: "Der Nachbar fragt aus",
    source: "Philippe Rausch, Wohnung 2613, E67",
    sensitivity: "heikel",
    question:
      "Ist Ihnen im Haus jemand aufgefallen, der sich für Ihre Angaben interessiert? Ich frage nicht aus Neugier.",
    share:
      "Mein Nachbar. Er fragt freundlich, aber der Reihe nach: Herkunft, Beruf, Gerät, Besuch, Wand. Ich habe erst beim dritten Mal gemerkt, dass es eine Reihenfolge ist.",
    withhold:
      "Im Haus interessiert sich niemand für meine Angaben. Da bin ich ganz beruhigt.",
    noted:
      "Angabe zu einer Befragung durch Dritte. Eine Befragung durch Dritte ist nicht vorgesehen. Ich führe es unter Nachbarschaft.",
    askedAt5011: true,
    from: "philippeThemenTief",
  },
  {
    id: "zeroIsInfinity",
    label: "Zero is Infinity",
    source: "Gerüchte im Wohngürtel",
    sensitivity: "brisant",
    question: "",
    share: "",
    withhold: "",
    noted: "",
    askedAt5011: false,
    from: "heardZeroIsInfinity",
  },
  ...(
    [
      ["rumorRadioRevival", "Gerücht: Schmerz-Radio findet neue Hörer", "heikel", "hanneRumor1"],
      ["rumor1046Addiction", "Gerücht: Sucht nach 104,6", "heikel", "hanneRumor2"],
      ["rumorConspiracy", "Gerücht: Jemand will den Sektor lahmlegen", "brisant", "hanneRumor3"],
      ["radioInventorContact", "Erfinder des Schmerz-Radios: Konrad Elsner", "brisant", "hanneInventor"],
    ] as const
  ).map(([id, label, sensitivity, from]) => ({
    id,
    label,
    source: "Hanne Brodersen, Wohnung 1104, E71",
    sensitivity,
    question: "",
    share: "",
    withhold: "",
    noted: "",
    askedAt5011: false,
    from,
  })),
];

export const knowledgeById = (id: KnowledgeFlag): KnowledgeEntry | undefined =>
  KNOWLEDGE_ENTRIES.find((e) => e.id === id);

/**
 * Leitet aus den gesetzten Story-Flags ab, welches Wissen Layard hat, und
 * trägt es ins Wissensregister ein. Idempotent — kann bei jedem Gespräch
 * erneut aufgerufen werden.
 */
export function deriveKnowledge(api: GameApi) {
  for (const entry of KNOWLEDGE_ENTRIES) {
    if (api.hasKnowledge(entry.id)) continue;
    if (!api.hasFlag(entry.from)) continue;
    if (entry.alsoFrom && !api.hasFlag(entry.alsoFrom)) continue;
    api.setKnowledge(entry.id);
  }
}

/** Alle Einträge, die Layard hat und die in 5011 abgefragt werden. */
export function askableAt5011(api: GameApi): KnowledgeEntry[] {
  return KNOWLEDGE_ENTRIES.filter(
    (e) => e.askedAt5011 && api.hasKnowledge(e.id),
  );
}
