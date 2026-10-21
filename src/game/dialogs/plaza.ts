import type { DialogTree } from "../types";

/** Optional encounters: no quest flags, insider information or rewards. */
export const plazaDialogs: Record<string, DialogTree> = {
  plaza_walker: {
    id: "plaza_walker", start: "hello", lines: {
      hello: { id: "hello", speaker: "MANN MIT AKTENTASCHE", text: "Entschuldigung. Wenn ich stehen bleibe, überlege ich mir das mit dem Termin noch anders.", end: true },
    },
  },
  plaza_bote: {
    id: "plaza_bote", start: "hello", lines: {
      hello: { id: "hello", speaker: "BOTE", text: "Morgen. Muss weiter — solange die Umschläge noch trocken sind.", end: true },
    },
  },
  plaza_beamtin: {
    id: "plaza_beamtin", start: "hello", lines: {
      hello: { id: "hello", speaker: "FRAU MIT AKTENMAPPE", text: "Ja? Einen Augenblick habe ich. Mehr hat meine Mappe leider nicht eingeplant.", choices: [
        { text: "Ein langer Tag?", next: "day" },
        { text: "Arbeiten Sie hier?", next: "work" },
        { text: "Dann halte ich Sie nicht auf.", next: "bye" },
      ] },
      day: { id: "day", speaker: "FRAU MIT AKTENMAPPE", text: "Noch gar nicht. Ich habe den Tee auf meinem Schreibtisch stehen lassen. Jetzt denke ich die ganze Zeit daran, wie er kalt wird.", choices: [
        { text: "Vielleicht wartet jemand mit frischem Tee.", next: "tea" },
        { text: "Kalter Tee ist immerhin schon fertig.", next: "cold" },
      ] },
      tea: { id: "tea", speaker: "FRAU MIT AKTENMAPPE", text: "Meine Kollegin macht das manchmal. Sie sagt nie etwas dazu. Die Tasse steht dann einfach da. Darauf freue ich mich eigentlich mehr als auf Feierabend.", next: "bye" },
      cold: { id: "cold", speaker: "FRAU MIT AKTENMAPPE", text: "So könnte man es ins Protokoll schreiben. Aber nicht in meine Tasse.", next: "bye" },
      work: { id: "work", speaker: "FRAU MIT AKTENMAPPE", text: "Nur zur Abgabe. Mein Schreibtisch steht anderswo. Zum Glück mit Fenster. Eine Birke davor — im Sommer sehe ich kaum etwas, aber ich vermisse sie im Winter.", choices: [
        { text: "Hier stehen auch welche.", next: "birches" },
        { text: "Ich wünsche Ihnen einen ruhigen Tag.", next: "bye" },
      ] },
      birches: { id: "birches", speaker: "FRAU MIT AKTENMAPPE", text: "Ja. Ich gehe deshalb diesen Weg, auch wenn er länger ist. Wenn die Blätter nass sind, riecht man sie sogar durch den Beton.", next: "bye" },
      bye: { id: "bye", speaker: "FRAU MIT AKTENMAPPE", text: "Kommen Sie gut durch den Tag.", end: true },
    },
  },
  plaza_handwerker: {
    id: "plaza_handwerker", start: "hello", lines: {
      hello: { id: "hello", speaker: "HANDWERKER", text: "Wenn Sie nach dem Eingang suchen: da. Wenn Sie nach einer trockenen Stelle suchen: sagen Sie mir Bescheid.", choices: [
        { text: "Ist der Kasten nicht schwer?", next: "tools" },
        { text: "Was wird heute repariert?", next: "repair" },
        { text: "Ich lasse Sie weitergehen.", next: "bye" },
      ] },
      tools: { id: "tools", speaker: "HANDWERKER", text: "Doch. Die Hälfte brauche ich nie. Aber wenn ich sie rausnehme, brauche ich sie am nächsten Tag. Der Kasten weiß das irgendwie.", choices: [
        { text: "Dann ist er der erfahrenere von Ihnen beiden.", next: "joke" },
        { text: "Was ist das älteste Werkzeug darin?", next: "old" },
      ] },
      joke: { id: "joke", speaker: "HANDWERKER", text: "Er beschwert sich jedenfalls weniger. Nur der Verschluss klappert. Den wollte ich seit Jahren reparieren.", next: "bye" },
      old: { id: "old", speaker: "HANDWERKER", text: "Ein Schraubendreher von meinem Vater. Der Griff ist glatt wie Seife. Neue habe ich genug — trotzdem greife ich immer nach dem.", next: "bye" },
      repair: { id: "repair", speaker: "HANDWERKER", text: "Eine Tür, die unten schleift. Nichts Großes. Aber wer jeden Tag dagegen drückt, merkt den Unterschied.", choices: [
        { text: "Kleine Erleichterungen zählen auch.", next: "small" },
        { text: "Dann viel Erfolg.", next: "bye" },
      ] },
      small: { id: "small", speaker: "HANDWERKER", text: "Ja. Hinterher sagt selten jemand was. Manchmal höre ich nur, wie die Tür ohne das Kratzen zufällt. Das reicht meistens.", next: "bye" },
      bye: { id: "bye", speaker: "HANDWERKER", text: "Machen Sie's gut. Und vorsichtig auf den glatten Platten.", end: true },
    },
  },
  plaza_rentner: {
    id: "plaza_rentner", start: "hello", lines: {
      hello: { id: "hello", speaker: "ÄLTERER MANN", text: "Ach, guten Tag. Nur langsam. Ich höre Sie schon, ich drehe mich bloß nicht mehr so schnell um.", choices: [
        { text: "Gehen Sie zur Haltestelle?", next: "bus" },
        { text: "Kommen Sie öfter hier vorbei?", next: "walk" },
        { text: "Einen schönen Spaziergang noch.", next: "bye" },
      ] },
      bus: { id: "bus", speaker: "ÄLTERER MANN", text: "Noch nicht. Erst einmal über den Platz. Wenn ich gleich einsteige, war ich draußen, aber nicht wirklich draußen.", choices: [
        { text: "Auch bei diesem Wetter?", next: "rain" },
        { text: "Das kann ich verstehen.", next: "air" },
      ] },
      rain: { id: "rain", speaker: "ÄLTERER MANN", text: "Gerade dann riecht es nach etwas. Die nassen Blätter, die Erde bei den Birken. Drinnen riecht es meistens nur nach gestern.", next: "bye" },
      air: { id: "air", speaker: "ÄLTERER MANN", text: "Früher wollte ich immer schnell wieder nach Hause. Jetzt lasse ich den Schlüssel schon in der Tasche, wenn ich noch weit weg bin. Als könnte ich die Zeit damit festhalten.", next: "bye" },
      walk: { id: "walk", speaker: "ÄLTERER MANN", text: "Wenn die Beine mitmachen. Meine Frau mochte die Birken. Ich gehe noch immer daran vorbei, auch wenn ich niemandem mehr erzählen muss, ob sie schon gelb sind.", choices: [
        { text: "Heute könnten Sie es mir erzählen.", next: "leaves" },
        { text: "Dann lasse ich Ihnen Ihren Weg.", next: "bye" },
      ] },
      leaves: { id: "leaves", speaker: "ÄLTERER MANN", text: "Gelb. Ein paar halten sich noch. Danke, dass Sie gefragt haben.", next: "bye" },
      bye: { id: "bye", speaker: "ÄLTERER MANN", text: "Lassen Sie sich nicht hetzen.", end: true },
    },
  },
  plaza_schirmfrau: {
    id: "plaza_schirmfrau", start: "hello", lines: {
      hello: { id: "hello", speaker: "FRAU MIT REGENSCHIRM", text: "Vorsicht, der Schirm tropft. Ich würde ihn höher halten, aber dann läuft es mir in den Ärmel.", choices: [
        { text: "Der Mantel bringt etwas Farbe auf den Platz.", next: "coat" },
        { text: "Ich wollte nur guten Tag sagen.", next: "bye" },
      ] },
      coat: { id: "coat", speaker: "FRAU MIT REGENSCHIRM", text: "Danke. Den habe ich schon ewig. Auf alten Fotos erkennt man mich daran, selbst wenn mein Gesicht verwischt ist.", choices: [
        { text: "Dann behalten Sie ihn noch lange.", next: "keep" },
        { text: "Kommen Sie trocken an.", next: "bye" },
      ] },
      keep: { id: "keep", speaker: "FRAU MIT REGENSCHIRM", text: "Habe ich vor. Das Futter ist schon zweimal neu. Von außen sieht man das nicht. Manche Dinge dürfen bleiben.", next: "bye" },
      bye: { id: "bye", speaker: "FRAU MIT REGENSCHIRM", text: "Guten Tag Ihnen auch. Und eine trockene Heimfahrt.", end: true },
    },
  },
};