/**
 * Hintergrund-Wortwechsel der DSA-Runde, wenn Layard im
 * Gemeinschaftsraum ist, aber NICHT am Tisch sitzt.
 *
 * Jedes Thema ist eine kurze Sequenz von Zeilen. Ein Thema läuft am
 * Stück durch, dann Pause, dann das nächste. Die `npc`-IDs müssen mit
 * den Sprite-IDs in der Szene übereinstimmen, damit FloatingChatter die
 * Sprechblase über der richtigen Person platzieren kann.
 */

export type ChatterNpcId = "tjark" | "brem" | "yelva";

export interface ChatterLine {
  npc: ChatterNpcId;
  text: string;
}

export interface ChatterTopic {
  id: string;
  lines: ChatterLine[];
}

export const CHATTER_TOPICS: ReadonlyArray<ChatterTopic> = [
  {
    id: "borbaradKampagne",
    lines: [
      { npc: "brem", text: "Wenn wir endlich vier wären, könnten wir die Borbarad-Kampagne anfangen." },
      { npc: "tjark", text: "Du willst die Borbarad-Kampagne nicht. Glaub mir." },
      { npc: "yelva", text: "Doch. Aber Brem will Borbarad nur, weil er rote Augen mag." },
      { npc: "brem", text: "Stimmt nicht. Ich mag auch lila." },
    ],
  },
  {
    id: "zwergeMagie",
    lines: [
      { npc: "brem", text: "Warum haben Zwerge eigentlich keine Magie?" },
      { npc: "tjark", text: "Sie haben Runen. Das ist anders." },
      { npc: "yelva", text: "Das ist nicht anders. Das ist nur kürzer." },
    ],
  },
  {
    id: "borbaradGalotta",
    lines: [
      { npc: "yelva", text: "Borbarad oder Galotta — wer war schlimmer?" },
      { npc: "tjark", text: "Falsche Frage. Borbarad war ehrlicher." },
      { npc: "brem", text: "Galotta hatte den besseren Hut." },
    ],
  },
  {
    id: "khom",
    lines: [
      { npc: "brem", text: "Die Khom ist langweilig." },
      { npc: "yelva", text: "Du warst noch nie da." },
      { npc: "brem", text: "Eben." },
    ],
  },
  {
    id: "praios",
    lines: [
      { npc: "yelva", text: "Praios ist kein guter Gott. Er ist nur der lauteste." },
      { npc: "tjark", text: "Das ist Ketzerei. Drei Stufen Verlust." },
      { npc: "yelva", text: "Wir spielen nicht. Ich kann sagen, was ich will." },
      { npc: "brem", text: "Sie hat recht." },
    ],
  },
  {
    id: "rondra",
    lines: [
      { npc: "tjark", text: "Rondra ist die einzige Göttin, die ich respektiere." },
      { npc: "brem", text: "Du respektierst sie nur, weil sie laut ist." },
      { npc: "tjark", text: "Sie ist nicht laut. Sie ist deutlich." },
    ],
  },
  {
    id: "phex",
    lines: [
      { npc: "brem", text: "Phex ist der einzige Gott, der das Leben verstanden hat." },
      { npc: "yelva", text: "Phex ist ein Dieb." },
      { npc: "brem", text: "Ja. Genau." },
    ],
  },
  {
    id: "drachen",
    lines: [
      { npc: "yelva", text: "Es gibt im Mittelreich keinen einzigen lebenden roten Drachen mehr." },
      { npc: "tjark", text: "Es gibt Pyrdacor." },
      { npc: "yelva", text: "Pyrdacor ist nicht im Mittelreich." },
      { npc: "brem", text: "Pyrdacor ist überall, wo er gerade Lust hat." },
    ],
  },
  {
    id: "elfenLieder",
    lines: [
      { npc: "brem", text: "Spielt deine Elfe eigentlich mal ein Lied?" },
      { npc: "yelva", text: "Sie singt nur, wenn jemand zuhört, der es verdient." },
      { npc: "brem", text: "Also nie." },
      { npc: "yelva", text: "Also nie." },
    ],
  },
  {
    id: "thorwal",
    lines: [
      { npc: "tjark", text: "Thorwal ist die einzige ehrliche Stadt Aventuriens." },
      { npc: "brem", text: "Thorwal ist ein Hafen mit zu vielen Äxten." },
      { npc: "tjark", text: "Eben. Ehrlich." },
    ],
  },
  {
    id: "alManach",
    lines: [
      { npc: "yelva", text: "Hat einer den neuen Almanach gelesen?" },
      { npc: "tjark", text: "Halb. Die Abschnitte über Maraskan." },
      { npc: "brem", text: "Ich warte auf den Hörspielband." },
      { npc: "yelva", text: "Es gibt keinen Hörspielband." },
      { npc: "brem", text: "Sollte es aber." },
    ],
  },
  {
    id: "borbaradAuge",
    lines: [
      { npc: "tjark", text: "Das Schwarze Auge ist nicht nur ein Würfel." },
      { npc: "yelva", text: "Es ist auch eine Pause." },
      { npc: "brem", text: "Es ist auch ein Schaden." },
    ],
  },
  {
    id: "ehemaligeGruppe",
    lines: [
      { npc: "brem", text: "Was ist eigentlich aus Marek geworden?" },
      { npc: "tjark", text: "Marek hat aufgehört. Wegen seiner Eltern." },
      { npc: "yelva", text: "Marek hat nicht aufgehört. Er hat gewechselt." },
      { npc: "brem", text: "Zu was?" },
      { npc: "yelva", text: "Zu einer anderen Gruppe. Er hat es uns nicht gesagt." },
      { npc: "tjark", text: "…" },
    ],
  },
  {
    id: "garest",
    lines: [
      { npc: "yelva", text: "Gareth ist zu groß, um interessant zu sein." },
      { npc: "brem", text: "Gareth ist zu groß, um sicher zu sein." },
      { npc: "tjark", text: "Beides ist richtig." },
    ],
  },
  {
    id: "ignifaxius",
    lines: [
      { npc: "brem", text: "Ignifaxius ist der ehrlichste Zauber." },
      { npc: "yelva", text: "Ignifaxius ist der unhöflichste Zauber." },
      { npc: "brem", text: "Genau." },
    ],
  },
  {
    id: "regelfrage",
    lines: [
      { npc: "tjark", text: "Eine Eigenschaftsprobe ist 3W20 unter dem Wert. Plus Erschwernis." },
      { npc: "brem", text: "Und wenn ich dreimal eine 1 würfle?" },
      { npc: "tjark", text: "Dann hast du einen sehr guten Tag." },
      { npc: "yelva", text: "Dreimal die 20 ist auch interessant." },
      { npc: "brem", text: "Dreimal die 20 ist eine Geschichte." },
    ],
  },
  {
    id: "borbaradKlischee",
    lines: [
      { npc: "yelva", text: "Jede Kampagne, die mit »Ein dunkler Schatten« anfängt, endet mit Borbarad." },
      { npc: "tjark", text: "Nicht jede." },
      { npc: "yelva", text: "Doch. Jede." },
    ],
  },
  {
    id: "elfenAlter",
    lines: [
      { npc: "brem", text: "Wie alt wird eine Elfe?" },
      { npc: "yelva", text: "So alt wie sie will." },
      { npc: "tjark", text: "Im Regelwerk steht 400 bis 600." },
      { npc: "yelva", text: "Im Regelwerk steht vieles." },
    ],
  },
];