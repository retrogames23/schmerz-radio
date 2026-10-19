import type { DialogChoice, GameApi, DialogLine, DialogTree } from "../types";

/**
 * Ralf am Fenster — E71-Bewohner hinter einem fast geschlossenen Rollo.
 *
 * Kein Themen-Automat: Die Bekanntschaft wächst über drei Stufen.
 *  1. `ralfIntro`  — Erstkontakt, Smalltalk, Ralf fragt zuerst.
 *  2. `ralfTalk`   — man kennt sich; leichte Themen, Ralf fragt zurück.
 *  3. `ralfDeep`   — Vertrauen; die schweren Themen, er duzt Layard.
 * Welcher Baum startet, entscheidet die Szene (siehe windowNiche.ts).
 */

/** Leichte Themen (Stufe 2 und 3). */
function lightTopics(api: GameApi): DialogChoice[] {
  const out: DialogChoice[] = [];
  if (!api.hasFlag("ralfToldSektoren"))
    out.push({ text: "Warum sind E67 und E71 überhaupt getrennt?", next: "tSektoren", action: (a) => a.setFlag("ralfToldSektoren") });
  if (!api.hasFlag("ralfToldMandat"))
    out.push({ text: "Was ist das Mandatsgebiet eigentlich?", next: "tMandat", action: (a) => a.setFlag("ralfToldMandat") });
  if (!api.hasFlag("ralfToldBewohner"))
    out.push({ text: "Erzählen Sie mir was über die Leute hier.", next: "tBewohner", action: (a) => a.setFlag("ralfToldBewohner") });
  if (!api.hasFlag("ralfToldRollo"))
    out.push({ text: "Und Sie stehen wirklich den ganzen Tag hier?", next: "tRollo", action: (a) => a.setFlag("ralfToldRollo") });
  if (!api.hasFlag("ralfToldBoxbude"))
    out.push({ text: "Was haben Sie eigentlich vor dem Archiv gemacht?", next: "tBoxbude", action: (a) => a.setFlag("ralfToldBoxbude") });
  // Kleine Gefallen — Vertrauen wächst über Handlungen, nicht nur über Themen.
  if (api.hasFlag("ralfAskedWork") && !api.hasFlag("ralfWantsTea"))
    out.push({ text: "Kann ich Ihnen eigentlich etwas mitbringen?", next: "fTeaAsk", action: (a) => a.setFlag("ralfWantsTea") });
  if (api.hasFlag("ralfWantsTea") && !api.hasFlag("ralfFavorTea") && api.hasItem("teeRalf"))
    out.push({ text: "[ Den Tee aus der Kantine durch den Schlitz reichen ]", next: "fTeaGive", action: (a) => { a.removeItem("teeRalf"); a.setFlag("ralfFavorTea"); } });
  if (api.hasFlag("ralfAskedWork") && !api.hasFlag("ralfWantsNews"))
    out.push({ text: "Bekommen Sie hier hinter dem Rollo eigentlich Nachrichten mit?", next: "fNewsAsk", action: (a) => a.setFlag("ralfWantsNews") });
  if (api.hasFlag("readTickerForRalf") && !api.hasFlag("ralfFavorNews"))
    out.push({ text: "„Ich habe Ihnen das Laufband im Konbini abgelesen.“", next: "fNewsGive", action: (a) => a.setFlag("ralfFavorNews") });
  return out;
}

/** Schwere Themen — erst mit Vertrauen (Stufe 3). */
function deepTopics(api: GameApi): DialogChoice[] {
  const out: DialogChoice[] = [];
  if (!api.hasFlag("ralfToldResonanz"))
    out.push({ text: "Resonanz-Hygiene — woher kommt das?", next: "tResonanz", action: (a) => a.setFlag("ralfToldResonanz") });
  if (!api.hasFlag("ralfToldZeitungen"))
    out.push({ text: "Es gab mal Zeitungsartikel über E67.", next: "tZeitungen", action: (a) => a.setFlag("ralfToldZeitungen") });
  if (!api.hasFlag("ralfToldSelbst"))
    out.push({
      text: api.hasFlag("ralfToldBoxbude")
        ? "Was hast du nach der Boxbuden-Zeit gemacht?"
        : "Was hast du eigentlich mal gemacht, Ralf?",
      next: "tSelbst",
      action: (a) => a.setFlag("ralfToldSelbst"),
    });
  if (api.hasFlag("metMira") && !api.hasFlag("ralfToldMira"))
    out.push({ text: "Was hältst du von Miras Theorien?", next: "tMira", action: (a) => a.setFlag("ralfToldMira") });
  if (api.hasFlag("act2Started") && !api.hasFlag("ralfToldGang"))
    out.push({ text: "Wer läuft hier eigentlich so durch den Gang?", next: "tGang", action: (a) => a.setFlag("ralfToldGang") });
  if (api.hasFlag("act2Started") && (api.hasFlag("ralfFavorTea") || api.hasFlag("ralfFavorNews")) && !api.hasFlag("ralfToldDelivery"))
    out.push({ text: "Ist dir hier draußen in letzter Zeit irgendwas Komisches aufgefallen?", next: "tDelivery", action: (a) => a.setFlag("ralfToldDelivery") });
  // Vorbereitet: wird erst mit dem Warnbrief freigeschaltet.
  if (api.hasFlag("gotWarnbrief") && !api.hasFlag("ralfToldWarnbrief"))
    out.push({ text: "Jemand hat mir einen Brief zugesteckt. Hast du was gesehen?", next: "tWarnbrief", action: (a) => a.setFlag("ralfToldWarnbrief") });
  return out;
}

function stage2Choices(api: GameApi): DialogChoice[] {
  const topics = lightTopics(api);
  if (topics.length === 0) topics.push({ text: "Erzählen Sie noch mal von früher.", next: "tFrueher" });
  topics.push({ text: "[ Weitergehen ]", endsDialog: true });
  return topics;
}

function stage3Choices(api: GameApi): DialogChoice[] {
  const topics = [...deepTopics(api), ...lightTopics(api)];
  if (topics.length === 0) topics.push({ text: "Nichts Bestimmtes. Nur kurz stehen bleiben.", next: "tLeer" });
  topics.push({ text: "[ Weitergehen ]", endsDialog: true });
  return topics;
}

/** Themenzeilen, die in Stufe 2 und 3 identisch sind. */
function lightTopicLines(hubIds: string[]): Record<string, DialogLine> {
  const back = (i: number) => hubIds[i % hubIds.length]!;
  return {
    tSektoren: {
      id: "tSektoren",
      speaker: "RALF",
      text: "E67 und E71 waren mal Nachbarn mit einem offenen Hof dazwischen. Bis die Leute drüben bei Ihnen in E67 nervös wurden. 1986 gab es eine Unterschriftenliste — „Sicheres E67“, angeblich zu viele Vorfälle, zu viel Durchgangsverkehr aus E71. Also haben Ihre Nachbarn die Schleuse mit dem Tastenfeld verlangt. Und bekommen. 1996 hat die Verwaltung mit der Sektor-Reform dann nur noch den Stempel draufgesetzt: E71 wurde die Medizin, E67 das, was übrig blieb. Jetzt tippen Sie jedes Mal vier Ziffern ein, weil Ihre Nachbarn damals Angst vor uns hatten.",
      subtext: "Er sagt es ganz ohne Bitterkeit. Eher wie jemand, der sich über schlechte Zäune amüsiert.",
      next: "afterTopic",
    },
    tMandat: {
      id: "tMandat",
      speaker: "RALF",
      text: "Man nannte es zuerst das Provisorium. Heute nennt man es Mandatsgebiet. Der Unterschied ist nur der Briefkopf. Der Mandatsrat sollte drei Jahre verwalten, bis geklärt ist, wer zuständig ist. Das war vor deutlich mehr als drei Jahren.",
      subtext: "Nichts ist so dauerhaft wie ein Provisorium mit Briefkopf.",
      next: "afterTopic",
    },
    tBewohner: {
      id: "tBewohner",
      speaker: "RALF",
      text: "Wen wollen Sie hören? Bodo hält den Bau zusammen und tut so, als wäre das Hausmeisterei. Insa in der Leitstelle weiß mehr, als sie weitergeben darf, und das frisst sie. Vossbeck hat sich in die Sprechzeit zurückgezogen wie andere in den Wald. Frau Okwu in 1532 hört zu, ohne zu notieren — glaube ich jedenfalls.",
      subtext: "Er zählt sie auf wie Inventar. Ohne Häme, ohne Wärme.",
      next: "afterTopic",
    },
    tRollo: {
      id: "tRollo",
      speaker: "RALF",
      text: "Nicht den ganzen Tag. Nur den Teil davon, in dem ich rauche. Das ist inzwischen ein großer Teil. Drinnen ist es untersagt, draußen bin ich nicht gemeldet — also ist der Schlitz mein Kompromiss mit der Hausordnung.",
      subtext: "Er sagt „Kompromiss“, als hätte er ihn selbst ausgehandelt.",
      next: back(0),
    },
    tBoxbude: {
      id: "tBoxbude",
      speaker: "RALF",
      text: "Vor dem Archiv? Kirmes. Eine Boxbude. Ende der Sechziger bis Mitte der Achtziger, von der Ringstraße bis in die kleineren Städte hinter der Sektor-Grenze. Man mietet einen Platz, baut das Zelt, und abends steht man im Rauch und schreit die Mutigen auf die Rampe.",
      subtext: "Er sagt das so leicht, als hätte er es lange nicht mehr ausgesprochen.",
      next: "tBoxbude2",
    },
    tBoxbude2: {
      id: "tBoxbude2",
      speaker: "RALF",
      text: "Die große Lüge ist der K.o. Der K.o. ist die Show, die das Zelt füllt. In Wahrheit führen die Jungs den Herausforderer durch die Runden, blocken das Wilde ab, teilen dosiert aus. Zwei Runden à einer Minute, Unentschieden heißt das Geld bleibt in der Bude. Wer wirklich ausgeknockt wird, ist entweder gefährlich geworden oder blind in eine Faust gelaufen. Die meisten gehen auf die Knie, weil die Luft weg ist — Leberhaken, keine Köpfe. Das ist sauberer und sieht von außen genug nach Niederlage aus.",
      subtext: "Er zählt es auf wie eine Inventarliste, ohne Stolz, ohne Reue.",
      next: "tBoxbude3",
    },
    tBoxbude3: {
      id: "tBoxbude3",
      speaker: "RALF",
      text: "Das Preisgeld kommt aus der Gage des Boxers. Verliert er, hat er umsonst gearbeitet. Deshalb verteidigen die Jungs ihr Portemonnaie. Und deshalb lehnen wir lizenzierte Profis ab — auf der Rampe oder hinter dem Vorhang. Wer beim DBV oder bei den Profiverbänden steht, darf nicht in einem ungenehmigten Zelt um Geld kämpfen, sonst ist die Lizenz weg. Die Bude braucht den mutigen Laien, den angetrunkenen Selbstdarsteller, den Kampfsportler aus dem Fitnesskeller. Nicht den Hochleistungssportler, der das Geschäft lahmlegt.",
      subtext: "„Wir“ sagt er, ohne es zu korrigieren.",
      next: "tBoxbude4",
    },
    tBoxbude4: {
      id: "tBoxbude4",
      speaker: "RALF",
      text: "Alkohol ist offiziell verboten, inoffiziell der Treibstoff. Ohne drei, vier Kölsch vorher steigen die meisten nicht freiwillig in den Ring. Der Rekommandeur scannt die Menge danach. Aber Filmriss fliegt raus — unkontrolliert ist gefährlich, für den Herausforderer und für uns. Und unter den Nazis waren wir komplett untersagt. Wehrsport statt Jahrmarkt, alles musste in den staatlichen Verband, und viele der guten Boxer waren jüdisch oder Sinti. Die haben uns gezielt die Existenz genommen. Nach dem Krieg kam die Renaissance. Ich habe sie mitgemacht und irgendwann gemerkt, dass ich mehr Anträge unterschrieben als Handschläge verteilt habe. Dann habe ich aufgehört.",
      subtext: "Das Ende klingt nicht wie ein Trauma. Eher wie eine Rechnung.",
      next: back(1),
    },
    fTeaAsk: {
      id: "fTeaAsk",
      speaker: "RALF",
      text: "Mitbringen. Das hat lange keiner gefragt. — Einen Tee. Heiß, aus der Kantine drüben in 3602. Mir geben sie nichts mit, ich bin dort nicht gelistet. Und ich gehe da auch nicht hin.",
      subtext: "Er sagt es beiläufig. Es ist trotzdem eine Bitte.",
      next: back(0),
    },
    fTeaGive: {
      id: "fTeaGive",
      speaker: "RALF",
      text: "[ Die Hand verschwindet, kommt zurück, nimmt den Becher vorsichtig am Rand. ] — Heiß. Tatsächlich heiß. Danke, Worag. Das merke ich mir.",
      subtext: "Kein großes Wort. Aber er klingt anders als vorher.",
      next: back(1),
    },
    fNewsAsk: {
      id: "fNewsAsk",
      speaker: "RALF",
      text: "Nachrichten? Ich höre Schritte. Das sind meine Nachrichten. — Im Konbini drüben läuft so ein Leuchtband. Wenn Sie mal da sind: Lesen Sie mir vor, was draufsteht. Egal was. Hauptsache, es ist von heute.",
      next: back(0),
    },
    fNewsGive: {
      id: "fNewsGive",
      speaker: "RALF",
      text: "[ Er hört zu, ohne zu unterbrechen. ] — Das ist alles? Wunderbar. Die schreiben seit Jahren denselben Satz um. Aber es ist ihr Satz von heute. Danke.",
      subtext: "Er lacht kurz. Es ist das erste Mal, dass Layard ihn lachen hört.",
      next: back(1),
    },
    tLeer: {
      id: "tLeer",
      speaker: "RALF",
      text: "Dann stehen wir eben. Das kann ich gut. Der Rauch geht heute waagerecht, das heißt: kein Wind, kein Wetter, nichts, worüber man sich einigen müsste.",
      next: back(1),
    },
    tFrueher: {
      id: "tFrueher",
      speaker: "RALF",
      text: "Früher. Ja. Früher roch der Herbst nach Zeltplane und Bratfett, und wenn die Bude stand, war der Tag geregelt. Rampe, Rekommandeur, zwei Runden, Kasse. Heute ist der Tag ein Fensterschlitz. Erzählt ist es schnell — gelebt hat es länger gedauert.",
      subtext: "Er sagt es ohne Wehmut. Eher wie jemand, der ein Datum abliest.",
      next: back(1),
    },
  };
}

export const ralfDialogs: Record<string, DialogTree> = {
  // ── Stufe 1: Erstkontakt ────────────────────────────────────────
  ralfIntro: {
    id: "ralfIntro",
    start: "r1",
    npcId: "ralf",
    lines: {
      r1: {
        id: "r1",
        speaker: "SYSTEM",
        text: "[ Die Hand im Rolloschlitz bewegt sich nicht. Der Zigarettenkegel wird kurz heller. Dann Rauch, langsam, waagerecht. ]",
        next: "r2",
      },
      r2: { id: "r2", speaker: "LAYARD", text: "Entschuldigung. Ich wollte nicht stören.", next: "r3" },
      r3: {
        id: "r3",
        speaker: "RALF",
        text: "Sie stören nicht. Es kommt hier selten jemand vorbei, der stehen bleibt. Die meisten gehen schneller, wenn sie die Hand sehen.",
        subtext: "Die Stimme ist ruhig, tief, sehr geübt im Leisesprechen.",
        next: "r4",
      },
      r4: { id: "r4", speaker: "LAYARD", text: "Ich hatte nicht damit gerechnet, dass die Hand redet.", next: "r5" },
      r5: {
        id: "r5",
        speaker: "RALF",
        text: "Ralf. Ich wohne hier, seit E71 noch keine Nummer hatte. Und Sie sind neu — man hört das am Schritt. Von drüben, oder? E67.",
        subtext: "Keine Neugier. Eher die Routine von jemandem, der Geräusche sortiert.",
        next: "rQ1",
      },
      rQ1: {
        id: "rQ1",
        hiddenWhen: ["act2Started"],
        next: "rQ1d",
        speaker: "RALF",
        text: "Also: Was verschlägt einen um diese Zeit in einen Verbindungsgang, in dem es nichts gibt?",
        choices: [
          { text: "„Worag. Ich wohne drüben in E67, 2611. Ich konnte nicht schlafen.“", next: "rA1", action: (a) => a.setFlag("ralfKnowsLayardTired") },
          { text: "„Ich schaue mich um. Beruflich fällt mir das schwer.“", next: "rA2", action: (a) => a.setFlag("ralfKnowsLayardWriter") },
          { text: "„Nichts. Ich gehe gleich weiter.“", next: "rA3" },
        ],
      },
      rQ1d: {
        id: "rQ1d",
        requires: ["act2Started"],
        speaker: "RALF",
        text: "Also: Was verschlägt einen am Vormittag in einen Verbindungsgang, in dem es nichts gibt? Schuhe, Mappe — Sie sehen nach Termin aus.",
        choices: [
          { text: "„Worag, aus E67, 2611. Ich habe einen Termin drüben.“", next: "rA1d" },
          { text: "„Ich schaue mich um. Beruflich fällt mir das schwer.“", next: "rA2", action: (a) => a.setFlag("ralfKnowsLayardWriter") },
          { text: "„Nichts. Ich gehe gleich weiter.“", next: "rA3" },
        ],
      },
      rA1d: {
        id: "rA1d",
        speaker: "RALF",
        text: "Worag. Ein Termin. Dann kommen Sie hier öfter vorbei. Von meinem Fenster aus sieht man, wer kommt und geht. Mehr kann ich nicht.",
        subtext: "Die Zigarette wird kurz heller.",
        next: "rEnd",
      },
      rA1: {
        id: "rA1",
        speaker: "RALF",
        text: "Worag. Gut. Schlaflos ist hier keine Diagnose, sondern eine Uhrzeit. Willkommen im Klub der Leute, die den Bau nachts hören.",
        subtext: "Die Zigarette wird kurz heller.",
        next: "rEnd",
      },
      rA2: {
        id: "rA2",
        speaker: "RALF",
        text: "Umsehen. Das sagen die, die eigentlich etwas suchen. Nicht schlimm — ich habe das auch jahrelang so genannt.",
        subtext: "Kein Vorwurf. Fast Anerkennung.",
        next: "rEnd",
      },
      rA3: {
        id: "rA3",
        speaker: "RALF",
        text: "Sie sind stehen geblieben. Wer nichts will, geht weiter. Aber gut, lassen wir das.",
        subtext: "Er wirkt kein bisschen beleidigt. Nur präzise.",
        next: "rEnd",
      },
      rEnd: {
        id: "rEnd",
        speaker: "RALF",
        text: "Ich stehe hier ohnehin. Kommen Sie wieder vorbei, wenn Sie Zeit haben. Ich habe nichts anderes als Zeit und eine halbe Schachtel.",
        subtext: "Die Hand hebt sich zwei Zentimeter. Das ist offenbar sein Winken.",
        end: true,
      },
    },
    onEnd: (api) => {
      api.setFlag("ralfStage2");
      // In Akt II kennengelernt: keine „Gestern Abend“-Begrüßung hinterher.
      if (api.hasFlag("act2Started")) api.setFlag("ralfAct2Greeted");
    },
  },

  // ── Stufe 2: Man kennt sich ─────────────────────────────────────
  ralfTalk: {
    id: "ralfTalk",
    start: "hi",
    npcId: "ralf",
    lines: {
      hi: {
        id: "hi",
        speaker: "RALF",
        text: "Der Schritt kommt mir bekannt vor. Worag aus 2611.",
        subtext: "Er hat sich den Schritt gemerkt. Nicht den Namen zuerst.",
        next: "hubA",
      },
      hubA: { id: "hubA", speaker: "RALF", text: "Fragen Sie ruhig. Die Schachtel hält noch.", choicesFn: stage2Choices },
      hubB: { id: "hubB", speaker: "RALF", text: "Er drückt die Kippe auf der Bank aus, sortiert sie in die Reihe. „Weiter.“", choicesFn: stage2Choices },
      hubC: { id: "hubC", speaker: "RALF", text: "Ein Husten, kurz, geübt. Dann: „Noch was?“", choicesFn: stage2Choices },
      ...lightTopicLines(["hubB", "hubC"]),

      // Ralf dreht das Gespräch um — zwei Gegenfragen öffnen Stufe 3.
      afterTopic: {
        id: "afterTopic",
        speaker: "RALF",
        text: "So. Genug von mir und dem Haus. Was machen Sie eigentlich, wenn Sie nicht nachts in Gängen stehen?",
        hiddenWhen: ["ralfAskedWork"],
        next: "afterTopic2",
        choices: [
          { text: "„Ich verwalte Vorgänge. Schmerzensgeldakten.“", next: "qWorkA", action: (a) => a.setFlag("ralfAskedWork") },
          { text: "„Früher habe ich geschrieben. Jetzt ordne ich Papier.“", next: "qWorkB", action: (a) => { a.setFlag("ralfAskedWork"); a.setFlag("ralfKnowsLayardWriter"); } },
        ],
      },
      afterTopic2: {
        id: "afterTopic2",
        speaker: "RALF",
        text: "Und schlafen Sie? Ich frage nicht aus Höflichkeit. Wer hier nachts wach ist, hat meistens einen Grund.",
        hiddenWhen: ["ralfAskedNight"],
        next: "hubA",
        choices: [
          { text: "„Schlecht. Es ist zu leise geworden.“", next: "qNightA", action: (a) => { a.setFlag("ralfAskedNight"); a.setFlag("ralfKnowsLayardTired"); } },
          { text: "„Ich schlafe. Ich träume nur das Falsche.“", next: "qNightB", action: (a) => { a.setFlag("ralfAskedNight"); } },
        ],
      },
      qWorkA: {
        id: "qWorkA",
        speaker: "RALF",
        text: "Schmerzensgeld. Da beziffert also jemand, was ein kaputtes Jahr kostet. Ich habe früher Akten sortiert — das ist derselbe Beruf, nur ohne Betrag.",
        subtext: "Zum ersten Mal klingt Interesse durch.",
        next: "hubB",
      },
      qWorkB: {
        id: "qWorkB",
        speaker: "RALF",
        text: "Geschrieben. Dann sind wir zwei Leute, die aufgehört haben. Ich mit dem Sammeln, Sie mit dem Erzählen. Das erklärt einiges an Ihrem Schritt.",
        subtext: "Die Zigarette bleibt lange still.",
        next: "hubB",
      },
      qNightA: {
        id: "qNightA",
        speaker: "RALF",
        text: "Zu leise. Ja. Es hat mal geknarrt und gestritten hier. Heute hört man nur Lüftung. Man gewöhnt sich nicht daran, man wird nur müder.",
        subtext: "Er redet jetzt langsamer. Es klingt wie der Anfang von Vertrauen.",
        next: "hubC",
      },
      qNightB: {
        id: "qNightB",
        speaker: "RALF",
        text: "Das Falsche träumen. Ich kenne das. Bei mir sind es Ordner, die nicht aufhören. Gut — Sie können also länger stehen bleiben. Dann können wir auch anders reden.",
        subtext: "Er klingt, als hätte er eine Entscheidung getroffen.",
        next: "hubC",
      },
      bye: {
        id: "bye",
        speaker: "RALF",
        text: "Gehen Sie ruhig. Ich bin hier. Das ist ungefähr meine ganze Eigenschaft.",
        end: true,
      },
    },
  },

  // ── Akt II: der Morgen danach ───────────────────────────────────
  ralfAct2: {
    id: "ralfAct2",
    start: "a1",
    npcId: "ralf",
    lines: {
      a1: {
        id: "a1",
        speaker: "RALF",
        text: "Der Schritt. Worag. Gestern Abend ohne Ziel, heute früh mit Ziel. — Jetzt also offiziell?",
        subtext: "Durch den Schlitz sieht er nur Schuhe und eine Mappe. Das reicht ihm.",
        next: "a2",
      },
      a2: {
        id: "a2",
        speaker: "LAYARD",
        text: "Ein Auftrag. Erhebung vor Ort, E71.",
        next: "a3",
      },
      a3: {
        id: "a3",
        speaker: "RALF",
        text: "Dann kommt hier ab jetzt öfter jemand mit Mappe vorbei. Gut. Von hier sieht man, wer kommt und wer geht. Mehr kann ich nicht. Aber das kann ich gründlich.",
        subtext: "Es klingt wie ein Angebot, das er nicht als Angebot formulieren will.",
        end: true,
      },
    },
    onEnd: (api) => api.setFlag("ralfAct2Greeted"),
  },

  // ── Stufe 3: Vertrauen ──────────────────────────────────────────
  ralfDeep: {
    id: "ralfDeep",
    start: "hi",
    npcId: "ralf",
    lines: {
      hi: {
        id: "hi",
        speaker: "RALF",
        text: "Da bist du wieder. — Ja, ich duze dich jetzt. Wer zweimal nachts freiwillig hier steht, kann sich das Siezen sparen.",
        subtext: "Die Hand dreht sich kurz, Handfläche nach oben. Fast eine Geste.",
        next: "hubA",
      },
      hubA: { id: "hubA", speaker: "RALF", text: "Frag. Heute halte ich auch die unangenehmen Sachen aus.", choicesFn: stage3Choices },
      hubB: { id: "hubB", speaker: "RALF", text: "Er zündet die nächste an der alten an. „Weiter.“", choicesFn: stage3Choices },
      hubC: { id: "hubC", speaker: "RALF", text: "Eine Pause, länger als nötig. Dann: „Und sonst?“", choicesFn: stage3Choices },
      ...lightTopicLines(["hubB", "hubC"]),
      afterTopic: { id: "afterTopic", speaker: "RALF", text: "Ein Nicken hinter dem Blech, vermutlich.", next: "hubB" },
      tResonanz: {
        id: "tResonanz",
        speaker: "RALF",
        text: "Resonanz war ein bau-akustischer Begriff. Hellhörige Wände, Beschwerden, Messprotokolle. Irgendwann hat jemand gemerkt, dass sich damit auch alles andere erfassen lässt, was zwischen Wänden zu laut wird. Streit. Trauer. Meinungen. Resonanz-Hygiene heißt heute: leise sein und es freiwillig nennen.",
        subtext: "Ein Wort, das sich gedehnt hat, bis alles hineinpasste.",
        next: "hubC",
      },
      tZeitungen: {
        id: "tZeitungen",
        speaker: "RALF",
        text: "Über E67 stand mal einiges gedruckt. Serie über die Belegungspraxis, ein Foto vom Innenhof, ein sehr höflicher Kommentar über „strukturelle Härten“. Nach der dritten Folge wurde die Serie eingestellt — nicht verboten, nur nicht fortgesetzt. Die Redaktion sitzt heute in E70 und schreibt über Kantinenverordnungen.",
        subtext: "Nichts wird hier verboten. Es hört nur auf.",
        next: "tZeitungen2",
      },
      tZeitungen2: {
        id: "tZeitungen2",
        speaker: "RALF",
        text: "Ich habe die drei Folgen noch. Frag mich nicht, ob ich sie dir gebe — ich gebe nichts weiter. Ich erzähle nur.",
        subtext: "Das ist keine Ausrede. Das ist eine Grenze.",
        next: "hubB",
      },
      tSelbst: {
        id: "tSelbst",
        speaker: "RALF",
        text: "Archivar. Registratur, Datumsstempel, Aktenzeichen. Privat habe ich dasselbe gemacht, nur über dieses Haus: Ordner, Ausschnitte, Vermerke. Dann habe ich gemerkt, dass Sammeln eine Beschäftigung ist und keine Handlung. Jetzt lese ich, rauche und rede mit Leuten, die stehen bleiben.",
        subtext: "Er hat sich eingerichtet. Er weiß das und beschönigt es nicht.",
        next: "hubC",
      },
      tGang: {
        id: "tGang",
        speaker: "RALF",
        text: "Wer hier durchläuft? Schichtleute früh, Lieferkarren um sieben, die Labor-Boten mit ihren Probenkisten. Ein paar Gesichter kenne ich nur am Schritt: eine, die immer zu schnell geht und dabei nach Farbe riecht. Einer, der stehen bleibt und dann doch nicht anklopft. Und seit heute du — mit Mappe.",
        subtext: "Er sagt keine Namen. Er sortiert nur Geräusche.",
        next: "hubC",
      },
      tDelivery: {
        id: "tDelivery",
        speaker: "RALF",
        text: "Komisch war das im Spätsommer. Ein Lieferwagen ohne Aufschrift, nachts an der Rampe. Kartons, alle gleich groß, Schuhkarton-Format. Zwei Leute haben ausgeladen. Einer hat dabei geraucht, die andere hat gezählt.",
        subtext: "Keine Gesichter, keine Namen. Nur die Kartons, die hat er sich gemerkt.",
        next: "hubB",
      },
      tWarnbrief: {
        id: "tWarnbrief",
        speaker: "RALF",
        text: "Ein Brief. Ja. Gestern früh ist jemand mit einem Umschlag Richtung E67 gelaufen und ohne zurückgekommen. Schnell, leise, Farbe an den Fingern. Mehr sage ich nicht — aber ich glaube, wer so etwas schreibt, hat Angst um dich. Nicht vor dir.",
        subtext: "Er wägt jedes Wort ab. Er will helfen, ohne jemanden zu verraten.",
        next: "hubB",
      },
      tMira: {
        id: "tMira",
        speaker: "RALF",
        text: "Layard, du weißt, es gibt keine absoluten Wahrheiten. Aber was Mira sieht, ist noch weitgehend ungetrübt von Erfahrungen. Und ich sage dir: Das eigentlich Erschreckende ist, dass für all das hier gar keine Verschwörung verantwortlich ist. Einfach sehr viele Menschen, die alle für sich die Verantwortung scheuen.",
        subtext: "Es klingt nicht vertraulich, sondern müde.",
        next: "hubB",
      },
      bye: {
        id: "bye",
        speaker: "RALF",
        text: "Geh schlafen, wenn du kannst. Und wenn nicht: Der Schlitz ist offen. Länger als alles andere in diesem Haus.",
        end: true,
      },
    },
  },
};
