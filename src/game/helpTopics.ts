/**
 * Inhalt der Spielehilfe («Spickzettel«).
 *
 * Jede Sektion ist ein eigener Block mit Titel, Schlagworten und Einträgen.
 * Die Einträge werden in der UI durchsuchbar dargestellt — sowohl Tastatur
 * (Desktop) als auch Touch-Bedienung (Mobile) sind hier dokumentiert.
 *
 * Achtung: KEINE Story-Spoiler. Die Hilfe erklärt nur Mechaniken.
 */

export interface HelpEntry {
  /** Kompakte Beschriftung der Aktion, z. B. «Hotspots hervorheben«. */
  label: string;
  /** Verknüpfte Tasten/Gesten — Reihenfolge: Desktop, dann Mobile. */
  keys: string[];
  /** Erklärender Fließtext (1–3 Sätze). */
  description: string;
  /** Zusätzliche Schlagworte für die Suche (alles wird lowercase verglichen). */
  tags?: string[];
}

export interface HelpSection {
  id: string;
  title: string;
  /** Kurzbeschreibung unter dem Sektionstitel. */
  intro?: string;
  entries: HelpEntry[];
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: «basics«,
    title: «Grundlagen«,
    intro:
      «Schmerz-Radio ist ein Point-&-Click-Adventure. Du erkundest Räume, sprichst mit Personen und kombinierst Gegenstände, um voranzukommen.«,
    entries: [
      {
        label: «Hotspots hervorheben«,
        keys: [«Leertaste (halten)«, «Mobile: nicht nötig«],
        description:
          «Halte die Leertaste gedrückt, um alle interaktiven Stellen in der Szene kurz aufleuchten zu lassen. Auf dem Handy sind Hotspots dauerhaft dezent sichtbar.«,
        tags: [«leertaste«, «space«, «hotspots«, «highlight«, «verstecken«],
      },
      {
        label: «Mit Personen / Objekten interagieren«,
        keys: [«Linksklick«, «Mobile: Tippen«],
        description:
          «Klicke auf ein Hotspot oder eine Person, um die Standardaktion auszulösen (anschauen, ansprechen, benutzen).«,
        tags: [«klick«, «tap«, «interagieren«, «ansprechen«],
      },
      {
        label: «Szene wechseln«,
        keys: [«Klick auf Ausgang«, «Mobile: Tippen«],
        description:
          «Türen und Pfeile am Bildrand wechseln den Raum. Der Cursor wird zum Ausgangs-Symbol, sobald du eine Übergangszone berührst.«,
        tags: [«tür«, «ausgang«, «exit«, «raum«],
      },
    ],
  },
  {
    id: «inventory«,
    title: «Inventar & Aktentasche«,
    intro: «Gefundene Gegenstände landen in deiner Aktentasche unten am Bildschirmrand.«,
    entries: [
      {
        label: «Aktentasche öffnen«,
        keys: [«Klick auf Aktentasche«, «Mobile: Tippen«],
        description:
          «Die Aktentasche bleibt immer am unteren Rand sichtbar. Klicke / tippe darauf, um alle Gegenstände einzusehen.«,
        tags: [«inventar«, «aktentasche«, «tasche«],
      },
      {
        label: «Gegenstand verwenden / kombinieren«,
        keys: [«Drag & Drop«, «Mobile: Tippen → Tippen«],
        description:
          «Desktop: Ziehe einen Gegenstand aus der Aktentasche auf ein Hotspot oder eine Person. Mobile: Tippe einmal auf den Gegenstand (Aktentasche schließt sich, Gegenstand ist »in der Hand«), tippe dann auf das Ziel.«,
        tags: [«drag«, «drop«, «ziehen«, «tap«, «kombinieren«, «verwenden«, «use-with«],
      },
      {
        label: «Gegenstand ansehen / lesen«,
        keys: [«Rechtsklick auf Item«, «Mobile: Lange drücken (~0,5 s)«],
        description:
          «Zeigt die ausführliche Beschreibung eines Gegenstands. Bei Briefen, Zetteln und Büchern öffnet sich der Lesemodus.«,
        tags: [«ansehen«, «lesen«, «long press«, «rechtsklick«, «beschreibung«],
      },
      {
        label: «Auswahl abbrechen (Mobile)«,
        keys: [«Banner oben → ✕«, «Erneut auf Item tippen«],
        description:
          «Hast du auf dem Handy einen Gegenstand »in die Hand« genommen, erscheint oben ein Banner. Über das ✕ legst du ihn zurück in die Aktentasche.«,
        tags: [«abbrechen«, «cancel«, «deselect«, «mobile«],
      },
    ],
  },
  {
    id: «ui«,
    title: «Wichtige Schaltflächen oben«,
    entries: [
      {
        label: «Radio öffnen«,
        keys: [«Klick auf »Radio««],
        description:
          «Öffnet das Schmerz-Radio. Du kannst Sender wählen, Lautstärke regeln und Botschaften empfangen.«,
        tags: [«radio«, «104,6«, «schmerz-radio«, «sender«],
      },
      {
        label: «Terminal öffnen«,
        keys: [«Klick auf »Terminal««],
        description:
          «Öffnet das CentralOS-Terminal. Befehle wie `help`, `ls`, `cat` und `cd` funktionieren wie in einer klassischen Konsole.«,
        tags: [«terminal«, «konsole«, «centralos«, «befehle«, «kommandos«],
      },
      {
        label: «Charakterbogen (DSA)«,
        keys: [«C«, «Klick auf »Bogen««],
        description:
          «Sobald du einen DSA-Charakter erstellt hast, kannst du seinen Bogen mit der Taste C oder über den Knopf in der Kopfzeile öffnen.«,
        tags: [«dsa«, «charakter«, «bogen«, «schwarze auge«],
      },
      {
        label: «Spielmenü / Pause«,
        keys: [«ESC«, «Klick auf »Menü««],
        description:
          «Öffnet das Pause-Menü mit Einstellungen (Musik, Sprachausgabe), Speicherständen und der Option, ins Hauptmenü zurückzukehren.«,
        tags: [«pause«, «menü«, «esc«, «einstellungen«, «speichern«],
      },
      {
        label: «Spielehilfe (dieses Fenster)«,
        keys: [«Klick auf »?««, «F1«],
        description:
          «Öffnet diese durchsuchbare Spielehilfe. Schließen mit ESC oder Klick außerhalb.«,
        tags: [«hilfe«, «help«, «?«, «fragezeichen«, «f1«],
      },
    ],
  },
  {
    id: «dialog«,
    title: «Dialoge & Texte«,
    entries: [
      {
        label: «Text weiterklicken«,
        keys: [«Leertaste / Enter«, «Mobile: Tippen«],
        description:
          «Erzähltexte und Dialoge gehen mit Leertaste, Enter oder einem Tipp/Klick auf den Bildschirm weiter.«,
        tags: [«dialog«, «text«, «weiter«, «enter«, «leertaste«],
      },
      {
        label: «Antwort wählen«,
        keys: [«Klick auf Option«, «Mobile: Tippen«],
        description:
          «In Gesprächen erscheinen Antwortoptionen. Wähle eine durch Klick / Tipp aus.«,
        tags: [«antwort«, «option«, «dialog«],
      },
      {
        label: «Fenster schließen«,
        keys: [«ESC«, «Klick auf ✕«],
        description:
          «Alle Overlays (Terminal, Handbuch, Charakterbogen, Hilfe …) schließen mit ESC oder dem ✕ rechts oben.«,
        tags: [«esc«, «schließen«, «close«],
      },
    ],
  },
  {
    id: «mobile«,
    title: «Hinweise für Mobile«,
    intro:
      «Auf Touch-Geräten ist die Bedienung leicht abgewandelt — alles bleibt mit einem Finger machbar.«,
    entries: [
      {
        label: «Querformat empfohlen«,
        keys: [«Gerät drehen«],
        description:
          «Das Spiel skaliert auch im Hochformat, ist im Querformat aber komfortabler. Bei textlastigen Fenstern (Terminal, DSA-Abenteuer) bleibt die Ausrichtung aufrecht.«,
        tags: [«mobile«, «rotation«, «landscape«, «portrait«, «querformat«],
      },
      {
        label: «Tap-to-Use statt Drag & Drop«,
        keys: [«Tippen → Tippen«],
        description:
          «Statt Gegenstände zu ziehen, tippst du erst auf das Item in der Aktentasche und dann auf das Ziel in der Szene. Ein Banner oben zeigt dir, was du gerade »in der Hand« hältst.«,
        tags: [«mobile«, «tap«, «use-with«, «drag«, «drop«],
      },
      {
        label: «Ansehen statt Verwenden«,
        keys: [«Lange drücken (~0,5 s)«],
        description:
          «Halte den Finger länger auf einem Item in der Aktentasche, um seine Beschreibung zu sehen, ohne es zu verwenden.«,
        tags: [«mobile«, «long press«, «halten«, «ansehen«, «lesen«],
      },
    ],
  },
];

/** Hilfsfunktion: filtert Sektionen + Einträge nach Volltext-Query. */
export function filterHelp(query: string): HelpSection[] {
  const q = query.trim().toLowerCase();
  if (!q) return HELP_SECTIONS;
  const tokens = q.split(/\s+/).filter(Boolean);
  const matches = (text: string) =>
    tokens.every((tok) => text.toLowerCase().includes(tok));
  return HELP_SECTIONS.map((sec) => {
    const sectionHay = `${sec.title} ${sec.intro ?? ««}`;
    const entries = sec.entries.filter((e) => {
      const hay = `${e.label} ${e.description} ${e.keys.join(« «)} ${(e.tags ?? []).join(« «)} ${sectionHay}`;
      return matches(hay);
    });
    return { ...sec, entries };
  }).filter((sec) => sec.entries.length > 0);
}