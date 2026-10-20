/**
 * Hintergrund-Telefonate der Empfangsdame im E71-Empfang (e71Lobby).
 * Aktiv, solange Layard sich dort aufhält und gerade NICHT in einem
 * Dialog ist. Aufbau identisch zu src/game/cafeteriaChatter.ts.
 *
 * Stilprinzip: einseitige Telefonfetzen — man hört nur sie, nie die
 * Gegenseite. Sachlich, müde, freundlich im Dienstton. Inhalte bleiben
 * lore-konform: Zimmer 1534/Stegmann, Dr. Okwu, Resonanz-Hygiene,
 * Maskenpflicht am Tresen, Konbini, Korridor 15/16.
 */

export type E71ReceptionNpcId = "empfang";

export interface E71ReceptionChatterLine {
  npc: E71ReceptionNpcId;
  text: string;
}

export interface E71ReceptionChatterTopic {
  id: string;
  lines: E71ReceptionChatterLine[];
}

export const E71_RECEPTION_CHATTER_TOPICS: ReadonlyArray<E71ReceptionChatterTopic> = [
  {
    id: "terminOkwu",
    lines: [
      { npc: "empfang", text: "Empfang E71, Jaensch am Apparat." },
      { npc: "empfang", text: "Frau Doktor Okwu hat morgen erst wieder ab der Sieben. … Ja, Sprechstunde. … Gern." },
      { npc: "empfang", text: "Ich trage Sie für halb acht ein. Bringen Sie die Karte mit." },
    ],
  },
  {
    id: "stegmannStapel",
    lines: [
      { npc: "empfang", text: "Herr Stegmann? … Einen Moment, ich stelle durch." },
      { npc: "empfang", text: "Er ist nicht rangegangen. … Ja, die Akten. Ich weiß. Ich sage es ihm." },
      { npc: "empfang", text: "Nein, abholen kann sie hier niemand. Das wissen Sie." },
    ],
  },
  {
    id: "maskenNachschub",
    lines: [
      { npc: "empfang", text: "Die Maskenbox ist wieder leer. … Die zweite diese Woche." },
      { npc: "empfang", text: "Nein, die aus dem Konbini nehme ich nicht. Nicht für den Tresen." },
      { npc: "empfang", text: "Dann bestellen Sie eben welche. Ich warte." },
    ],
  },
  {
    id: "resonanzMeldung",
    lines: [
      { npc: "empfang", text: "Korridor fünfzehn, ja. Das Band hängt noch. … Nein, niemand ist rein." },
      { npc: "empfang", text: "Wann die Prüfung kommt, weiß ich nicht. Das läuft nicht über diesen Tresen." },
      { npc: "empfang", text: "Ich gebe es so weiter. Quarantäne, bis auf Widerruf. Ja." },
    ],
  },
  {
    id: "lichtspielsaal",
    lines: [
      { npc: "empfang", text: "Der Lichtspielsaal? … Fünfte Etage, der Aufzug geht." },
      { npc: "empfang", text: "Was heute läuft, steht am Brett. Ich habe das Programm nicht hier." },
      { npc: "empfang", text: "Karten gibt es oben an der Kasse. … Bitte sehr." },
    ],
  },
  {
    id: "besuchermeldung",
    lines: [
      { npc: "empfang", text: "Besuchermeldung für die Vier? … Name und Kennziffer, bitte." },
      { npc: "empfang", text: "E67. … Das ist weit. Hat er das gemeldet?" },
      { npc: "empfang", text: "Dann lassen Sie ihn das nächste Mal vorher melden. Es erspart uns allen Arbeit." },
    ],
  },
];
