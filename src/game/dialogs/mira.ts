import type { DialogChoice, DialogTree, GameApi } from "../types";

/**
 * Mira wird nicht durch einen einzigen Satz abgeschaltet, sondern kühlt in
 * Stufen ab: Stufe 1 (miraDistance1) = thematischer Rückzug, Stufe 2
 * (miraDistance2) = kühler Ton, Stufe 3 (miraSystemic) = sie redet nicht mehr
 * über ihre Sache. Auch Stufe 3 ist KEIN Dead End: Dienstliches — vor allem
 * die Störungsmeldung zum Wohnungsapparat — bleibt immer ansprechbar.
 */
export function bumpMiraDistance(api: GameApi): void {
  if (!api.hasFlag("miraDistance1")) {
    api.setFlag("miraDistance1");
    return;
  }
  if (!api.hasFlag("miraDistance2")) {
    api.setFlag("miraDistance2");
    return;
  }
  api.setFlag("miraSystemic");
}

/** Ernsthaftes Nachfragen oder ein gelieferter Beleg holt eine Stufe zurück. */
export function easeMiraDistance(api: GameApi): void {
  if (api.hasFlag("miraSystemic")) {
    api.clearFlag("miraSystemic");
    return;
  }
  if (api.hasFlag("miraDistance2")) {
    api.clearFlag("miraDistance2");
    return;
  }
  if (api.hasFlag("miraDistance1")) api.clearFlag("miraDistance1");
}

/**
 * Welches „übliche" Mira-Gespräch steht gerade an? Dieselbe Logik, die auch
 * bei Zufallsbegegnungen greift — je nachdem, was schon gelaufen ist.
 */
export function miraNormalDialogId(api: GameApi): string {
  if (!api.hasFlag("metMira")) return "miraIntro";
  if (api.hasFlag("miraEvidenceDelivered")) return "miraAfterEvidence";
  if (api.hasFlag("miraAskedEvidence")) {
    const belege = [
      "belegAushangAufzug",
      "belegAushangKorridor46",
      "belegAushangGemeinschaftsraum",
    ].filter((f) => api.hasFlag(f as never)).length;
    if (belege === 3) return "miraEvidenceDeliver";
    if (belege === 2) return "miraEvidenceWaitTwo";
    if (belege === 1) return "miraEvidenceWaitOne";
    return "miraEvidenceWait";
  }
  return "miraEvidenceAsk";
}

/**
 * Gemeinsame Auswahl im 4601-Hub: Störungsmeldung + thematischer Einstieg
 * in den jeweiligen Normaldialog + Abbruch.
 */
function miraHubChoices(api: GameApi): DialogChoice[] {
  const choices: DialogChoice[] = [];
  // Einziger ortsunabhängiger Unterschied: kaputtes Telefon.
  if (
    api.hasFlag("phoneBroken") &&
    !api.hasFlag("phoneRepaired") &&
    !api.hasFlag("miraRepairDone")
  ) {
    choices.push({
      text: "Störung am Wohnungsapparat. Etagenwartung Korridor 46, Schicht A — das bist du.",
      nextDialog: "miraFaultReport",
    });
  }
  // Flugblatt-Strang: überall verfügbar, solange Layard es nicht hat.
  if (!api.hasFlag("tookFlyer")) {
    choices.push({
      text: "Was heißt „Resonanz-Hygiene“ eigentlich — wörtlich?",
      nextDialog: "miraReturn",
    });
  }
  // Vertrauensprobe, sobald das Blatt in Layards Tasche liegt.
  if (
    api.hasFlag("tookFlyer") &&
    !api.hasFlag("miraTrustEarned") &&
    !api.hasFlag("miraTrustWithheld")
  ) {
    choices.push({
      text: "Ich habe dein Blatt gelesen. Was jetzt?",
      nextDialog: "miraTrustProbe",
    });
  }
  // Hinweis auf 5610 — nur solange Layard die Tür nicht kennt.
  if (api.hasFlag("tookFlyer") && !api.hasFlag("saw5610Door")) {
    choices.push({
      text: "Gibt es einen Ort, an dem die alten Fassungen liegen?",
      nextDialog: "miraAfter",
    });
  }
  const normalId = miraNormalDialogId(api);
  const openers: Record<string, string> = {
    miraEvidenceAsk: "Woran arbeitest du gerade?",
    miraEvidenceWait: "Wegen der Aushänge — was genau suchst du?",
    miraEvidenceWaitOne: "Wegen der Aushänge. Ich bin dran.",
    miraEvidenceWaitTwo: "Wegen der Aushänge. Zwei habe ich.",
    miraEvidenceDeliver: "Ich habe die drei Aushänge.",
    miraAfterEvidence: "Alles ruhig bei dir?",
  };
  choices.push({
    text: openers[normalId] ?? "Wie läuft's?",
    nextDialog: normalId,
  });
  choices.push({ text: "[ Später ]" });
  return choices;
}

/**
 * Einziger Einstiegspunkt für Mira — Flur wie Wohnung. Gleiche Person,
 * gleicher Zustand, gleiche Optionen; nur die Erstbegegnung ist ortsabhängig.
 */
export function startMiraEncounter(
  api: GameApi,
  opts?: { atHome?: boolean },
): void {
  const atHome = opts?.atHome ?? false;
  // Der Ort steuert nur noch die Regieanweisung der ersten Zeile.
  if (atHome) {
    api.setFlag("miraEncounterAtHome");
    // Nur als Wissens-Flag: Layard kennt 4601 von innen.
    api.setFlag("miraAtHomeMet");
  } else {
    api.clearFlag("miraEncounterAtHome");
  }
  if (
    api.hasFlag("miraTerminalTrespass") &&
    !api.hasFlag("miraConfrontedTrespass")
  ) {
    api.startDialog("miraTrespassConfront");
    return;
  }
  // Pflichtstrang geht vor: Solange der Apparat kaputt ist, muss die
  // Störungsmeldung immer möglich bleiben — sonst kann der Heizungspfad
  // die Reparatur dauerhaft verschlucken.
  const phoneStillBroken =
    api.hasFlag("phoneBroken") && !api.hasFlag("phoneRepaired");
  if (
    api.hasFlag("miraFlatOpen") &&
    !api.hasFlag("miraTerminalTrespass") &&
    !phoneStillBroken
  ) {
    api.startDialog("miraOutInHeat");
    return;
  }
  if (!api.hasFlag("metMira")) {
    api.setFlag("metMira");
    api.startDialog("miraIntro");
    return;
  }
  if (api.hasFlag("miraSystemic")) {
    api.startDialog("miraSystemicGreeting");
    return;
  }
  api.startDialog("miraHub");
}

/**
 * Mira — skeptisch, nicht paranoid.
 *
 * Ihre These ist sprachlich, nicht technisch: „Resonanz-Hygiene" ist nirgends
 * exakt definiert, taucht aber überall auf. Genau diese Unschärfe erlaubt es,
 * jedes Verhalten nachträglich als Verstoß zu deklarieren. Mira kennt das
 * Schmerz-Radio NICHT und spekuliert nie über Frequenzen.
 *
 * Tonlage: reißt sich mit, rudert aber hörbar zurück, sobald man ihr
 * widerspricht. Jede große These hat eine Selbstkorrektur.
 */

const FLYER_TEXT =
  "WAS IST RESONANZ-HYGIENE? Wir haben in vier Monaten elf Aushänge verglichen. Elf Mal ein anderer Wortlaut. Ruhezeiten. Lüftung. Belegungsdichte. Türsiegel-Praxis. Nirgends eine Definition. Ein Wort, das alles bedeuten kann, bedeutet am Ende: was die Verwaltung heute will. Wir behaupten nichts. Wir bitten um eine Definition. — Z.K.S.";

export const miraDialogs: Record<string, DialogTree> = {
  miraIntro: {
    id: "miraIntro",
    npcId: "mira",
    start: "mi1",
    lines: {
      mi1: {
        id: "mi1",
        speaker: "SYSTEM",
        text: "[ An der Wand lehnt eine junge Frau. Sechzehn, vielleicht siebzehn. Sie sieht Layard direkt an. ]",
        hiddenWhen: ["miraEncounterAtHome"],
        next: "mi1h",
      },
      // Gleiche Begegnung, nur in 4601 statt im Korridor.
      mi1h: {
        id: "mi1h",
        speaker: "SYSTEM",
        text: "[ Die Tür war angelehnt. Im Zimmer sitzt eine junge Frau im Schneidersitz auf dem Bett. Sechzehn, vielleicht siebzehn. Neben ihr ein Stapel sortierter Aushänge. Sie sieht Layard direkt an. ]",
        requires: ["miraEncounterAtHome"],
        next: "mi2h",
      },
      mi2h: {
        id: "mi2h",
        speaker: "MIRA",
        text: "Setz dich, wenn du willst. Oder steh, ist eh eng hier.",
        subtext: "Sie klappt das Buch auf ihrem Schoß zu, ohne es wegzulegen.",
        requires: ["miraEncounterAtHome"],
        next: "mi2",
        choices: [
          {
            text: "Störung am Wohnungsapparat. Etagenwartung Korridor 46, Schicht A — das bist du.",
            nextDialog: "miraFaultReport",
            requires: ["phoneBroken"],
            hiddenWhen: ["phoneRepaired", "miraRepairDone"],
          },
          { text: "Was ist das für ein Stapel?", next: "miraOpen1" },
          {
            text: "Ich bin Verwaltungsangestellter. So etwas höre ich lieber nicht.",
            next: "miraClosed1",
            action: (api) => bumpMiraDistance(api),
          },
          { text: "Keine Zeit für sowas." },
        ],
      },
      mi2: {
        id: "mi2",
        speaker: "MIRA",
        text: "Hey. Du bist nicht von dieser Etage. Aber du suchst auch nichts Bestimmtes, oder? Du läufst nur. Das machen die meisten, bevor sie wissen, wovor.",
        subtext: "Sie sagt das ohne Vorwurf. Eher wie eine Beobachtung.",
        hiddenWhen: ["sawEmptyOffice"],
        next: "mi2b",
      },
      mi2b: {
        id: "mi2b",
        speaker: "MIRA",
        text: "Hey. Du bist nicht von dieser Etage. Und du läufst, als hättest du ein Ziel. Wen suchst du?",
        subtext: "Sie sagt das ohne Vorwurf. Eher wie eine Beobachtung.",
        requires: ["sawEmptyOffice"],
        next: "mi3",
      },
      mi3: {
        id: "mi3",
        speaker: "LAYARD",
        text: "Ich … wollte mir nur ein paar andere Etagen ansehen.",
        hiddenWhen: ["sawEmptyOffice"],
        next: "mi3b",
      },
      mi3b: {
        id: "mi3b",
        speaker: "LAYARD",
        text: "Den Abschnittsverantwortlichen. Sein Büro ist leer.",
        requires: ["sawEmptyOffice"],
        next: "mi4",
      },
      mi4: {
        id: "mi4",
        speaker: "MIRA",
        text: "Andere Etagen ansehen. — Weißt du, wie selten das jemand macht? Die meisten bleiben in ihrem Gebäude, bis sie transferiert werden. Du nicht.",
        subtext: "Sie wartet auf deine Reaktion.",
        hiddenWhen: ["sawEmptyOffice"],
        next: "mi4b",
        choices: [
          {
            text: "Störung am Wohnungsapparat. Etagenwartung Korridor 46, Schicht A — das bist du.",
            nextDialog: "miraFaultReport",
            requires: ["phoneBroken"],
            hiddenWhen: ["phoneRepaired", "miraRepairDone"],
          },
          { text: "Was meinst du damit genau?", next: "miraOpen1" },
          {
            text: "Ich bin Verwaltungsangestellter. So etwas höre ich lieber nicht.",
            next: "miraClosed1",
            action: (api) => bumpMiraDistance(api),
          },
          { text: "Keine Zeit für sowas." },
        ],
      },
      mi4b: {
        id: "mi4b",
        speaker: "MIRA",
        text: "Den gibt es heute nicht. Den gibt es meistens nicht. Steht trotzdem auf jedem Aushang, dass es ihn gibt.",
        subtext: "Sie hat das schon oft gesagt. Sie wartet darauf, wie er reagiert.",
        requires: ["sawEmptyOffice"],
        choices: [
          {
            text: "Störung am Wohnungsapparat. Etagenwartung Korridor 46, Schicht A — das bist du.",
            nextDialog: "miraFaultReport",
            requires: ["phoneBroken"],
            hiddenWhen: ["phoneRepaired", "miraRepairDone"],
          },
          { text: "Was meinst du damit genau?", next: "miraOpen1" },
          {
            text: "Ich bin Verwaltungsangestellter. So etwas höre ich lieber nicht.",
            next: "miraClosed1",
            action: (api) => bumpMiraDistance(api),
          },
          { text: "Keine Zeit für sowas." },
        ],
      },
      // OFFEN — die Wort-These
      miraOpen1: {
        id: "miraOpen1",
        speaker: "MIRA",
        text: "Frag mal jemanden, was „Resonanz-Hygiene“ eigentlich ist. Genau. Wortlaut. Kriegst du nicht. Ich hab elf Aushänge verglichen — elf verschiedene Formulierungen. Ruhezeiten, Lüftung, Belegungsdichte, Türsiegel-Praxis.",
        choices: [
          { text: "Und was schließt du daraus?", next: "miraOpen2" },
          { text: "Das ist einfach Verwaltungssprache. Die ist immer schwammig.", next: "miraCorrect1" },
          { text: "Das ist mir jetzt zu groß. Lass gut sein.", next: "miraDefer" },
        ],
      },
      // Selbstkorrektur: Mira nimmt den Einwand ernst und wird kleiner,
      // nicht lauter.
      miraCorrect1: {
        id: "miraCorrect1",
        speaker: "MIRA",
        text: "… kann sein. Das ist ein guter Einwand, ehrlich. Vielleicht ist es einfach Schlamperei. — Nur: Schlamperei wird korrigiert, wenn jemand nachfragt. Ich hab nachgefragt. Zweimal schriftlich. Es kam keine Definition, es kam ein Hinweis auf meine Belegungsakte.",
        choices: [
          { text: "Okay. Erzähl weiter.", next: "miraOpen2" },
          { text: "Trotzdem: Beweis ist das keiner.", next: "miraCorrect2" },
        ],
      },
      miraCorrect2: {
        id: "miraCorrect2",
        speaker: "MIRA",
        text: "Nein. Ist es nicht. Ich sag auch nicht, dass ich recht habe — ich sag, dass mir niemand antwortet. Das ist ein Unterschied, und ich vergesse ihn manchmal.",
        choices: [
          { text: "Erzähl trotzdem weiter.", next: "miraOpen2" },
          { text: "Reicht. Ich muss weiter.", endsDialog: true },
        ],
      },
      miraOpen2: {
        id: "miraOpen2",
        speaker: "MIRA",
        text: "Meine These: Die Unschärfe ist keine Panne, sie ist praktisch. Ein Wort, das nirgends definiert ist, passt hinterher auf alles. Zu laut — Resonanz-Hygiene. Zu viele Leute in der Wohnung — Resonanz-Hygiene. Beschwerde eingereicht — na, rate.",
        choices: [
          { text: "Und wer profitiert davon?", next: "miraOpen4" },
          { text: "Hübsches Bild. Mehr nicht.", next: "miraDeferDry" },
          { text: "Reicht. Ich muss weiter.", endsDialog: true },
        ],
      },
      miraOpen4: {
        id: "miraOpen4",
        speaker: "MIRA",
        text: "Wer entscheiden will, ohne begründen zu müssen. Mehr behaupte ich nicht — ich kenne keine Namen, und ich glaube auch nicht an irgendeinen Raum, in dem das ausgeheckt wird. Bei meinem Vater stand „menschliches Versagen“ im Bericht. Auch so ein Wort, das keine Frage übrig lässt. Steht alles hier drauf.",
        next: "miraOpen5",
      },
      miraOpen5: {
        id: "miraOpen5",
        speaker: "SYSTEM",
        text: "[ Sie zieht ein gefaltetes Blatt aus der Innentasche und drückt es Layard in die Hand. Schnell. Geübt. ]",
        next: "miraOpen7",
        choices: [
          {
            text: "[ Annehmen ]",
            next: "miraOpen7",
            action: (api) => api.setFlag("miraOfferedFlyer"),
          },
          {
            text: "[ Ablehnen ]",
            next: "miraRefuse",
            action: (api) => api.setFlag("miraOfferedFlyer"),
          },
        ],
      },
      miraOpen7: {
        id: "miraOpen7",
        speaker: "MIRA",
        text: "Lies es allein. Und gib's nicht an. Z.K.S.",
        next: "miraOpen8",
      },
      miraOpen8: {
        id: "miraOpen8",
        speaker: "LAYARD",
        text: "Z.K.S.?",
        next: "miraOpen9",
      },
      miraOpen9: {
        id: "miraOpen9",
        speaker: "MIRA",
        text: "Zentrum. Käfig. Stille. — Die Stille ist der schöne Teil: ein Tag ohne Aushänge, ohne Durchsagen, ohne Merkblätter. Einmal ausprobieren, wie das ist. Mehr will ich gar nicht. Geh jetzt.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => {
              api.setFlag("miraOpenness");
              api.setFlag("tookFlyer");
              api.addItem({
                id: "flyer",
                name: "Flugblatt",
                description: FLYER_TEXT,
              });
              api.setKnowledge("wordControl");
            },
          },
        ],
      },
      miraRefuse: {
        id: "miraRefuse",
        speaker: "MIRA",
        text: "Schade. — Aber ich verstehe. Wenn du es dir anders überlegst: Ich bin oft hier oben.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("miraOpenness"),
          },
        ],
      },
      miraDefer: {
        id: "miraDefer",
        speaker: "MIRA",
        text: "Auch gut. — Ich bin oft hier oben, falls du irgendwann doch mal Lust hast, weiterzudenken.",
        subtext:
          "Sie steckt etwas zurück in die Innentasche, ohne es ihm zu zeigen.",
        choices: [
          {
            text: "[ Beenden ]",
          },
        ],
      },
      miraDeferDry: {
        id: "miraDeferDry",
        speaker: "MIRA",
        text: "Mag sein. — Dann eben ein hübsches Bild. Schönen Tag noch.",
        subtext: "Sie wendet den Blick ab. Das Gespräch ist für heute vorbei.",
        choices: [
          {
            text: "[ Beenden ]",
          },
        ],
      },
      // GESCHLOSSEN
      miraClosed1: {
        id: "miraClosed1",
        speaker: "MIRA",
        text: "Schon gut. Vergiss, dass ich was gesagt habe. — Ich rede über sowas auch nicht mit jedem.",
        subtext: "Kein Vorwurf. Sie sortiert einfach weiter.",
        hiddenWhen: ["miraDistance2"],
        next: "miraClosed1b",
        end: true,
      },
      miraClosed1b: {
        id: "miraClosed1b",
        speaker: "MIRA",
        text: "Ach so. Du bist da wirklich ganz auf Linie. — Gut zu wissen. Dann halten wir's dienstlich.",
        subtext: "Der Ton wird kühler. Sie sieht ihn noch an, aber kürzer.",
        requires: ["miraDistance2"],
        hiddenWhen: ["miraSystemic"],
        next: "miraClosed1c",
        end: true,
      },
      miraClosed1c: {
        id: "miraClosed1c",
        speaker: "MIRA",
        text: "Ach. Einer von denen. Schon gut. Vergiss, dass ich was gesagt habe.",
        subtext: "Sie ist nicht überrascht. Sie hat damit gerechnet.",
        requires: ["miraSystemic"],
        next: "miraClosed2",
      },
      miraClosed2: {
        id: "miraClosed2",
        speaker: "MIRA",
        text: "Schönen Tag noch, Bürger.",
        requires: ["miraSystemic"],
        end: true,
      },
    },
  },
  miraReturn: {
    id: "miraReturn",
    npcId: "mira",
    start: "mr1",
    lines: {
      mr1: {
        id: "mr1",
        speaker: "MIRA",
        text: "Wieder hier. Hast du es dir überlegt?",
        requires: ["miraOfferedFlyer"],
        hiddenWhen: ["sawEmptyOffice"],
        next: "mr1b",
        choices: [
          { text: "Ja. Gib mir das Blatt.", next: "mr2" },
          { text: "Nein. Ich wollte nur reden.", next: "mrTalk" },
        ],
      },
      mr1b: {
        id: "mr1b",
        speaker: "MIRA",
        text: "Wieder hier. Hast du ihn gefunden? Den Abschnittsverantwortlichen, meine ich.",
        subtext: "Sie weiß die Antwort schon.",
        requires: ["sawEmptyOffice", "miraOfferedFlyer"],
        next: "mrFresh1",
        choices: [
          { text: "Ja. Gib mir das Blatt.", next: "mr2" },
          { text: "Nein. Aber gib mir trotzdem das Blatt.", next: "mr2" },
          { text: "Nein. Ich wollte nur reden.", next: "mrTalk" },
        ],
      },
      mrFresh1: {
        id: "mrFresh1",
        speaker: "MIRA",
        text: "Du bist nochmal hier. Das machen die wenigsten zweimal.",
        subtext: "Keine Begrüßung. Eher eine Notiz.",
        next: "mrFresh2",
      },
      mrFresh2: {
        id: "mrFresh2",
        speaker: "MIRA",
        text: "Sag mal — wüsstest du, wenn dich jemand fragt, was „Resonanz-Hygiene“ genau heißt, was du antworten würdest?",
        choices: [
          { text: "Was willst du damit sagen?", next: "mrOpen1" },
          { text: "Lass mich in Ruhe damit.", next: "mrSystemic" },
          { text: "Keine Zeit." },
        ],
      },
      mrTalk: {
        id: "mrTalk",
        speaker: "MIRA",
        text: "Angequatscht. Gut. — Worüber denn?",
        choices: [
          { text: "Über das, was du vorhin meintest.", next: "mrOpen1" },
          { text: "Eigentlich über nichts." },
        ],
      },
      mrSystemic: {
        id: "mrSystemic",
        speaker: "MIRA",
        text: "Verstanden. Ich hör auf damit. — Falls du doch mal was brauchst: ich bin oft hier oben.",
        subtext: "Sie klingt nicht beleidigt. Nur ein bisschen sparsamer.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => bumpMiraDistance(api),
          },
        ],
      },
      mrOpen1: {
        id: "mrOpen1",
        speaker: "MIRA",
        text: "„Resonanz-Hygiene“ steht auf jedem zweiten Aushang und in keinem Katalog. Elf Fassungen hab ich verglichen, elf Mal was anderes. Ich glaube, das ist kein Zufall. Beweisen kann ich's nicht.",
        choices: [
          { text: "Sprich weiter.", next: "mrOpen2" },
          { text: "Vielleicht ist es nur schlecht formuliert.", next: "mrCorrect" },
          { text: "Das ist mir jetzt zu groß. Lass gut sein.", next: "mrOpenDefer" },
        ],
      },
      mrCorrect: {
        id: "mrCorrect",
        speaker: "MIRA",
        text: "Möglich. Ich renne manchmal los, bevor ich fertig gedacht habe — sagt mein Onkel auch. Aber schlechte Formulierungen kann man verbessern lassen. Ich hab's versucht. Man hat mir stattdessen meine Akte erwähnt.",
        choices: [
          { text: "Sprich weiter.", next: "mrOpen2" },
          { text: "Reicht. Ich muss weiter.", endsDialog: true },
        ],
      },
      mrOpen2: {
        id: "mrOpen2",
        speaker: "MIRA",
        text: "Ein Wort ohne Definition ist eine Blankovollmacht. Du kannst dich nicht dagegen wehren, weil du nicht weißt, wogegen. Ich denke: genau deshalb bleibt es unscharf. Ich hab keine Sprawka dafür. Ist trotzdem 'ne These.",
        choices: [
          { text: "Wer sorgt dafür?", next: "mrOpen3" },
          { text: "Reicht. Ich muss weiter.", endsDialog: true },
        ],
      },
      mrOpen3: {
        id: "mrOpen3",
        speaker: "MIRA",
        text: "Niemand mit Namen — vielleicht auch niemand überhaupt. Vielleicht ist es einfach bequem, und Bequemlichkeit braucht keinen Plan. Meine Vermutung steht hier drauf.",
        next: "mrOpen4",
      },
      mrOpen4: {
        id: "mrOpen4",
        speaker: "SYSTEM",
        text: "[ Sie zieht ein gefaltetes Blatt aus der Innentasche und drückt es Layard in die Hand. Schnell. Geübt. ]",
        choices: [
          {
            text: "[ Annehmen ]",
            next: "mrOpen5",
            action: (api) => api.setFlag("miraOfferedFlyer"),
          },
          {
            text: "[ Ablehnen ]",
            next: "mrOpenRefuse",
            action: (api) => api.setFlag("miraOfferedFlyer"),
          },
        ],
      },
      mrOpen5: {
        id: "mrOpen5",
        speaker: "MIRA",
        text: "Lies es allein. Z.K.S.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => {
              api.setFlag("miraOpenness");
              api.setFlag("tookFlyer");
              api.addItem({
                id: "flyer",
                name: "Flugblatt",
                description: FLYER_TEXT,
              });
              api.setKnowledge("wordControl");
            },
          },
        ],
      },
      mrOpenRefuse: {
        id: "mrOpenRefuse",
        speaker: "MIRA",
        text: "Schade. — Aber ich verstehe. Wenn du es dir anders überlegst: Ich bin oft hier oben.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("miraOpenness"),
          },
        ],
      },
      mrOpenDefer: {
        id: "mrOpenDefer",
        speaker: "MIRA",
        text: "Auch gut. — Ich bin oft hier oben, falls du irgendwann doch mal Lust hast, weiterzudenken.",
        subtext:
          "Sie steckt etwas zurück in die Innentasche, ohne es ihm zu zeigen.",
        choices: [
          {
            text: "[ Beenden ]",
          },
        ],
      },
      mr2: {
        id: "mr2",
        speaker: "MIRA",
        text: "Gut. Lies es allein. Niemals im Terminal. Z.K.S.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => {
              api.setFlag("tookFlyer");
              api.setFlag("miraOpenness");
              api.addItem({
                id: "flyer",
                name: "Flugblatt",
                description: FLYER_TEXT,
              });
              api.setKnowledge("wordControl");
            },
          },
        ],
      },
    },
  },
  miraAfter: {
    id: "miraAfter",
    npcId: "mira",
    start: "ma1",
    lines: {
      ma1: {
        id: "ma1",
        speaker: "MIRA",
        text: "Du hast es noch. Gut. — Und du bist immer noch hier. Auch gut.",
        hiddenWhen: ["sawEmptyOffice"],
        next: "ma2",
      },
      ma1b: {
        id: "ma1b",
        speaker: "MIRA",
        text: "Du hast es noch. Gut. — Und der Verantwortliche ist immer noch keiner. Auch gut.",
        requires: ["sawEmptyOffice"],
        next: "ma2",
      },
      ma2: {
        id: "ma2",
        speaker: "MIRA",
        text: "Hör zu. Eine Sache noch. Auf 56 ist eine Tür. 5610. Steht „Technik“ dran. Ich glaube, das stimmt nur halb.",
        hiddenWhen: ["saw5610Door"],
        next: "ma3",
      },
      ma3: {
        id: "ma3",
        speaker: "MIRA",
        text: "Da drin liegt Papier, das nicht im Verzeichnis steht — Umläufe, Fassungen, Entwürfe. Wenn ich recht habe, findest du dort eine ältere Version desselben Merkblatts. Wenn ich falsch liege, ist es ein Abstellraum mit Kabeln.",
        hiddenWhen: ["saw5610Door"],
        next: "ma4",
      },
      ma4: {
        id: "ma4",
        speaker: "MIRA",
        text: "Geh hin. Schau dir's an. Sag mir, was du gesehen hast. Ich kann mich auch täuschen — kommt vor. Mehr sage ich nicht. Geh.",
        hiddenWhen: ["saw5610Door"],
        next: "maAck",
        end: true,
      },
      maAck: {
        id: "maAck",
        speaker: "MIRA",
        text: "Du hast die Tür gesehen. Gut. Lass dich nicht erwischen.",
        requires: ["saw5610Door"],
        end: true,
      },
    },
  },
  miraSystemicGreeting: {
    id: "miraSystemicGreeting",
    npcId: "mira",
    start: "msg1",
    lines: {
      msg1: {
        id: "msg1",
        speaker: "MIRA",
        text: "Guten Tag, Bürger.",
        subtext: "Sie sieht ihn nicht einmal an.",
        choices: [
          {
            text: "Störung am Wohnungsapparat. Etagenwartung Korridor 46, Schicht A — das bist du.",
            nextDialog: "miraFaultReport",
            requires: ["phoneBroken"],
            hiddenWhen: ["phoneRepaired", "miraRepairDone"],
          },
          { text: "Ich wollte nichts. Nur fragen, ob hier alles in Ordnung ist.", next: "msg2" },
          { text: "[ Später ]" },
        ],
      },
      msg2: {
        id: "msg2",
        speaker: "MIRA",
        text: "Ordnung ist immer. Steht so im Aushang. — Sonst noch was, Bürger?",
        subtext: "Dienst nach Vorschrift. Kein Zentimeter mehr.",
        choices: [
          {
            text: "Störung am Wohnungsapparat. Etagenwartung Korridor 46, Schicht A — das bist du.",
            nextDialog: "miraFaultReport",
            requires: ["phoneBroken"],
            hiddenWhen: ["phoneRepaired", "miraRepairDone"],
          },
          {
            text: "Ich habe dir unrecht getan. Erzähl mir noch mal, was dich an dem Wort stört.",
            next: "msg3",
            action: (api) => easeMiraDistance(api),
          },
          { text: "[ Beenden ]" },
        ],
      },
      msg3: {
        id: "msg3",
        speaker: "MIRA",
        text: "… hm. Nicht heute. Aber merk dir, dass du gefragt hast. Frag noch mal, wenn du wirklich Zeit hast.",
        subtext: "Sie sieht ihn zum ersten Mal wieder an.",
        end: true,
      },
    },
  },
  miraTrustProbe: {
    id: "miraTrustProbe",
    npcId: "mira",
    start: "mtp1",
    lines: {
      mtp1: {
        id: "mtp1",
        speaker: "MIRA",
        text: "Du bist nochmal da. Mit dem Blatt. Quatschst mich an. Und jetzt willst du was?",
        subtext: "Sie wirkt nicht überrascht. Eher: bereit.",
        next: "mtp2",
      },
      mtp2: {
        id: "mtp2",
        speaker: "MIRA",
        text: "Bevor ich dir mehr sage: zwei Sachen. Erstens — auf Etage 56, am Drucker, hängt ein freier Port. Wenn du einen Rechner hast, der Telnet kann, kommst du auf eine Maschine. Da liegt ein Manifest. Lies es. Nicht jetzt. Allein.",
        next: "mtp3",
      },
      mtp3: {
        id: "mtp3",
        speaker: "MIRA",
        text: "Zweitens — bring mir einen Beleg. Irgendeinen Aushang, ein Merkblatt, irgendwas Amtliches, auf dem „Resonanz-Hygiene“ steht. Nicht abgeschrieben. Gelesen und gemerkt. Ich will wissen, ob du hinschaust oder nur zuhörst.",
        next: "mtp4",
      },
      mtp4: {
        id: "mtp4",
        speaker: "MIRA",
        text: "Und eine Frage. Wenn morgen alle Merkblätter, Aushänge und Durchsagen ausfallen — ein ganzer Tag ohne Verlautbarung: Was tust du als erstes?",
        choices: [
          { text: "Ich gehe raus. Ohne Meldung.", next: "mtpAnswerGood" },
          { text: "Ich rufe die Leitstelle und frage, was los ist.", next: "mtpAnswerBad" },
          { text: "Ich warte auf die nächste Anweisung.", next: "mtpAnswerBad" },
          { text: "Nichts. Ich sitze und höre, was übrig ist.", next: "mtpAnswerGood" },
        ],
      },
      mtpAnswerGood: {
        id: "mtpAnswerGood",
        speaker: "MIRA",
        text: "Gute Antwort. — Komm wieder, wenn du das Manifest gelesen UND einen Beleg gesehen hast. Dann reden wir weiter.",
        next: "mtpCheck",
      },
      mtpAnswerBad: {
        id: "mtpAnswerBad",
        speaker: "MIRA",
        text: "Schade. — Du bist noch nicht so weit. Das ist okay, ehrlich. Ich war es letztes Jahr auch nicht.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("miraTrustWithheld"),
          },
        ],
      },
      mtpCheck: {
        id: "mtpCheck",
        speaker: "SYSTEM",
        text: "[ Mira mustert ihn kurz. ]",
        requires: ["readMiraManifest", "sawResonanzAushang"],
        next: "mtpReveal",
      },
      mtpReveal: {
        id: "mtpReveal",
        speaker: "MIRA",
        text: "Beides erledigt. Ich seh's an dir. — Also gut. 4601. Vierte Etage, gleich hier um die Ecke. Klopf nicht. Tür ist offen, wenn ich da bin.",
        requires: ["readMiraManifest", "sawResonanzAushang"],
        next: "mtpReveal2",
      },
      mtpReveal2: {
        id: "mtpReveal2",
        speaker: "SYSTEM",
        text: "[ Sie drückt Layard einen kleinen, gefalteten Zettel in die Hand. ]",
        requires: ["readMiraManifest", "sawResonanzAushang"],
        choices: [
          {
            text: "[ Annehmen ]",
            action: (api) => {
              api.setFlag("miraTrustEarned");
              api.addItem({
                id: "miraDoorNote",
                name: "Zettel von Mira",
                description:
                  "Karierter Schnipsel, eckige Schrift: »4601. nicht klopfen. wenn ich da bin, ist offen. — m.« Auf der Rückseite ein winzig gemaltes Fragezeichen in einem Kasten.",
              });
            },
          },
        ],
      },
      mtpHold: {
        id: "mtpHold",
        speaker: "MIRA",
        text: "Komm wieder, wenn du beides hast. Du weißt, was zu tun ist.",
        hiddenWhen: ["miraTrustEarned"],
        end: true,
      },
    },
  },
  miraDoorBlock: {
    id: "miraDoorBlock",
    npcId: "mira",
    start: "mdb1",
    lines: {
      mdb1: {
        id: "mdb1",
        speaker: "MIRA",
        text: "Finger weg, Layard.",
        next: "mdb2",
      },
      mdb2: {
        id: "mdb2",
        speaker: "MIRA",
        text: "Solange ich hier sitze, sitzt hier niemand sonst. Und ich sitze hier gern — außer im Sommer '95, als der Steigstrang durchgedreht ist. Da stand ich zwei Stunden im Korridor und habe die Wand gekühlt.",
        subtext: "Sie sagt es beiläufig, ohne den Blick vom Schirm zu nehmen.",
        end: true,
      },

    },
  },
  // ── Ein Hub für alle Orte: gleiche Themen, gleicher Zustand ────────
  miraHub: {
    id: "miraHub",
    npcId: "mira",
    start: "mhubKnown",
    lines: {
      // Bekannt: Mira kann Layard beim Namen/Anblick begrüßen.
      mhubKnown: {
        id: "mhubKnown",
        speaker: "MIRA",
        text: "Du bist es. Alles in Regel?",
        requires: ["metMira"],
        next: "mhubChoices",
      },
      // Erstbesuch in 4601: neutral, keine vertraute Anrede.
      mhubFirst: {
        id: "mhubFirst",
        speaker: "MIRA",
        text: "Setz dich. Oder steh. — Was willst du?",
        hiddenWhen: ["metMira"],
        next: "mhubChoices",
      },
      mhubChoices: {
        id: "mhubChoices",
        speaker: "SYSTEM",
        text: "[ Mira wartet. ]",
        choicesFn: miraHubChoices,
      },
    },
  },
  // ── Pflicht-Rätsel: kaputtes Telefon ──────────────────────────────
  miraFaultReport: {
    id: "miraFaultReport",
    npcId: "mira",
    start: "mfr3",
    lines: {
      mfr3: {
        id: "mfr3",
        speaker: "MIRA",
        text: "Schicht A, Korridor 46. Ja. Steht auf einem Aushang, den außer mir keiner liest. — Ich bin Anwärterin, kein Techniker. Aber ich habe den Prüfstecker. Die einzige Zange auf der Etage, die noch was taugt.",
        subtext: "Sie sagt es ohne Stolz. Eher wie eine Tatsache, die sie ärgert.",
        next: "mfr4",
      },
      mfr4: {
        id: "mfr4",
        speaker: "MIRA",
        text: "Dienstvorgang. Ich muss. Also los, bevor ich's mir überlege.",
        hiddenWhen: ["miraTrustEarned"],
        next: "mfr4b",
        choices: [
          {
            text: "[ Mira mitnehmen ]",
            action: (api) => {
              api.startCutscene("miraRepair");
            },
          },
        ],
      },
      mfr4b: {
        id: "mfr4b",
        speaker: "MIRA",
        text: "Du hättest auch einfach fragen können, statt den Dienstweg zu zitieren. — Warte, ich hole den Gürtel.",
        requires: ["miraTrustEarned"],
        choices: [
          {
            text: "[ Mira mitnehmen ]",
            action: (api) => {
              api.startCutscene("miraRepair");
            },
          },
        ],
      },
    },
  },
  miraRepairScene: {
    id: "miraRepairScene",
    npcId: "mira",
    start: "mrs2",
    lines: {
      mrs2: {
        id: "mrs2",
        speaker: "MIRA",
        text: "Da. Ader durchgescheuert, an der Klemme. Das passiert, wenn jemand die Leitung mal quer durch den Schacht gezogen hat und danach niemand mehr zuständig war.",
        next: "mrs3",
      },
      mrs3: {
        id: "mrs3",
        speaker: "MIRA",
        text: "Weißt du, wie das im Meldebogen heißt? „Resonanzbedingte Beeinträchtigung der Hausleitung.“ — Es ist ein Draht. Ein durchgescheuerter Draht.",
        subtext: "Sie hält den Kupferrest hoch wie ein Beweisstück.",
        next: "mrs4",
      },
      mrs4: {
        id: "mrs4",
        speaker: "MIRA",
        text: "Und? Sagst du jetzt, ich soll nicht so viel hineinlesen?",
        choices: [
          { text: "Nein. Sprich weiter!", next: "mrs5" },
          { text: "Es ist trotzdem nur ein Draht.", next: "mrs5b" },
        ],
      },
      mrs5: {
        id: "mrs5",
        speaker: "MIRA",
        text: "Wenn ein Wort für alles herhalten kann, prüft am Ende keiner mehr, was wirklich kaputt war. — Kann sein, dass ich das zu groß denke. Kommt vor.",
        next: "mrs6",
      },
      mrs5b: {
        id: "mrs5b",
        speaker: "MIRA",
        text: "Ja. Genau das ist mein Punkt. Es ist ein Draht — und im Bogen steht ein Wort, das nach Zustand klingt. Ich behaupte nichts. Ich finde es nur bemerkenswert.",
        next: "mrs6",
      },
      mrs6: {
        id: "mrs6",
        speaker: "SYSTEM",
        text: "[ Sie prüft die Leitung ein zweites Mal, dann steckt sie den Prüfstecker zurück in den Gürtel. ]",
        hiddenWhen: ["miraTrustEarned"],
        // Wenn Layard Miras Vertrauen schon hat, wird diese Zeile
        // übersprungen — dann muss der persönlichere Zweig folgen,
        // sonst bricht die Reparatur ohne Ergebnis ab.
        next: "mrs6b",
        choices: [
          {
            text: "[ Danke sagen ]",
            action: (api) => {
              api.setFlag("miraRepairDone");
              api.setFlag("phoneRepaired");
              api.setFlag("port2611Locked");
              api.showText([
                "„Geht wieder“, sagt Mira. „Meldebogen schreibe ich nicht. Dann bleibt es ein Draht.“",
                "„Eins noch: Ich musste Apparat und Datenport auf den Leitstellen-Knoten ummelden — anders kriege ich die Leitung nicht stabil. Telefonieren geht wieder. Aber deine Post läuft ab jetzt bei der Leitstelle auf, leitstelle.e67, nicht mehr in deinem Terminal.“",
                "„Mich stört das nicht weiter. Mein Kasten hängt am Wartungsstrang, 10.67.56er-Bereich. Und genau den lässt die Leitstelle ohne Dienstpasswort rein. Deine Post liegt also da, wo nur ich hinkomme. Sag nicht, ich hätte es dir nicht erzählt.“",
                "Sie ist schon an der Tür, bevor Layard antworten kann.",
              ]);
            },
          },
        ],
      },
      mrs6b: {
        id: "mrs6b",
        speaker: "SYSTEM",
        text: "[ Sie prüft die Leitung ein zweites Mal, dann steckt sie den Prüfstecker zurück in den Gürtel. ]",
        requires: ["miraTrustEarned"],
        next: "mrs7b",
      },
      mrs7b: {
        id: "mrs7b",
        speaker: "MIRA",
        text: "Mein Vater hat solche Klemmen gesetzt. Unten, in 56. Als er nicht mehr hochkam, stand im Bericht „menschliches Versagen“. Zwei Wörter für einen Mann.",
        subtext: "Sie sagt es beiläufig. Das ist das Schlimmste daran.",
        next: "mrs8b",
      },
      mrs8b: {
        id: "mrs8b",
        speaker: "MIRA",
        text: "Roald hat's damals unterschrieben, weil man das unterschreibt. — Egal. Dein Telefon geht. Ruf an, wen du anrufen musst. Eins musst du wissen: Ich habe Apparat und Datenport auf den Leitstellen-Knoten umgemeldet. Heißt, deine Post landet ab jetzt bei der Leitstelle — leitstelle.e67 — und nicht mehr in deinem Terminal. Mich stört so was nicht: Mein Kasten hängt am Wartungsstrang, 10.67.56er-Bereich, und genau den lässt die Leitstelle ohne Dienstpasswort rein.",
        requires: ["miraTrustEarned"],
        choices: [
          {
            text: "[ Danke sagen ]",
            action: (api) => {
              api.setFlag("miraRepairDone");
              api.setFlag("phoneRepaired");
              api.setFlag("port2611Locked");
            },
          },
        ],
      },
    },
  },
  // ── Beleg-Sammlung (ersetzt die frühere Verstärker-Quest) ──────────
  miraEvidenceAsk: {
    id: "miraEvidenceAsk",
    npcId: "mira",
    start: "me1",
    // Der Auftrag gilt, sobald Mira ihn ausspricht — auch wenn der Spieler
    // den Dialog vorzeitig verlässt oder in den Free-Talk wechselt.
    onEnd: (api) => api.setFlag("miraAskedEvidence"),
    lines: {
      me1: {
        id: "me1",
        speaker: "MIRA",
        text: "Gut, dass du nochmal kommst. Ich brauche jemanden, der durch drei Etagen laufen kann, ohne dass jemand fragt, warum.",
        next: "me2",
      },
      me2: {
        id: "me2",
        speaker: "MIRA",
        text: "Ich schreibe eine Eingabe an die Bewohnervertretung. Eine einzige Frage: Was heißt „Resonanz-Hygiene“, wörtlich? Damit das kein Meckerbrief wird, brauche ich drei Fundstellen, die sich widersprechen.",
        subtext: "Sie deutet auf den sortierten Stapel neben sich.",
        next: "me3",
      },
      me3: {
        id: "me3",
        speaker: "MIRA",
        text: "Drei Stück reichen: das Schwarze Brett in der Eingangshalle E67, das Plakat im Korridor 46 und der Aushang im Gemeinschaftsraum. Lies sie. Wirklich lesen, nicht angucken. Dann komm zurück und sag mir, was drin steht.",
        next: "me4",
      },
      me4: {
        id: "me4",
        speaker: "LAYARD",
        text: "Und dann? Antwortet dir dann jemand?",
        next: "me5",
      },
      me5: {
        id: "me5",
        speaker: "MIRA",
        text: "Wahrscheinlich nicht. Aber dann steht die Frage im Umlauf, mit Datum. Ich weiß, dass das wenig ist. Es ist trotzdem mehr als gar nichts.",
        choices: [
          {
            text: "Verstanden — ich schau mir die drei an.",
            action: (api) => api.setFlag("miraAskedEvidence"),
          },
          {
            text: "Klingt nach mehr Ärger, als ich heute brauche.",
            action: (api) => api.setFlag("miraAskedEvidence"),
          },
        ],
      },
    },
  },
  miraEvidenceWait: {
    id: "miraEvidenceWait",
    npcId: "mira",
    start: "mw1",
    lines: {
      mw1: {
        id: "mw1",
        speaker: "MIRA",
        text: "Drei Fundstellen, Worag: das Schwarze Brett in der Eingangshalle, das Plakat im Korridor 46, der Aushang im Gemeinschaftsraum. Lies sie und komm wieder. Ich kann die Eingabe nicht abschicken, solange sie auf nichts verweist.",
        end: true,
      },
    },
  },
  miraEvidenceWaitOne: {
    id: "miraEvidenceWaitOne",
    npcId: "mira",
    start: "mw11",
    lines: {
      mw11: {
        id: "mw11",
        speaker: "MIRA",
        text: "Eine hast du. Ich seh's — du zitierst schon die Formulierung, statt sie zu umschreiben. Zwei fehlen noch.",
        subtext: "Sie hält den Stift bereit, schreibt aber nichts auf.",
        end: true,
      },
    },
  },
  miraEvidenceWaitTwo: {
    id: "miraEvidenceWaitTwo",
    npcId: "mira",
    start: "mw21",
    lines: {
      mw21: {
        id: "mw21",
        speaker: "MIRA",
        text: "Zwei von drei. Und? Steht in beiden dasselbe?",
        next: "mw22",
      },
      mw22: {
        id: "mw22",
        speaker: "MIRA",
        text: "Eben. Genau deshalb brauche ich die dritte — mit zwei Fassungen heißt es „Missverständnis“, mit drei heißt es Praxis.",
        end: true,
      },
    },
  },
  miraEvidenceDeliver: {
    id: "miraEvidenceDeliver",
    npcId: "mira",
    start: "md1",
    lines: {
      md1: {
        id: "md1",
        speaker: "LAYARD",
        text: "Drei Aushänge. Drei Fassungen. Keine davon sagt, was das Wort bedeutet.",
        next: "md2",
      },
      md2: {
        id: "md2",
        speaker: "MIRA",
        text: "Sag die Reihenfolge. — Eingangshalle: „Pflichtinformation“. Korridor: „bei anhaltender Überlastung“. Gemeinschaftsraum: „Pausen sind Teil der Behandlung“. Drei Verwaltungen, drei Bedeutungen, ein Wort.",
        subtext: "Sie schreibt mit. Schnell, ohne aufzusehen.",
        next: "md3",
      },
      md3: {
        id: "md3",
        speaker: "MIRA",
        text: "Das reicht. Nicht für einen Skandal — dafür reicht es nie. Aber für eine Frage, die man aktenmäßig beantworten muss. Danke. Ehrlich.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => {
              api.setFlag("miraEvidenceDelivered");
              easeMiraDistance(api);
              api.setFlag("miraTerminalUnlocked");
            },
          },
        ],
      },
    },
  },
  miraAfterEvidence: {
    id: "miraAfterEvidence",
    npcId: "mira",
    start: "mf1",
    lines: {
      mf1: {
        id: "mf1",
        speaker: "MIRA",
        text: "Die Eingabe ist raus. Mit Datum, mit drei Fundstellen, mit meinem Namen drunter. Wenn sie nicht antworten, ist das auch eine Antwort.",
        next: "mf2",
      },
      mf2: {
        id: "mf2",
        speaker: "MIRA",
        text: "Das Terminal ist offen. Schau dich um, lies, was du willst. Ich passe nicht auf. Wenn du was kaputt machst, ist es eh nicht meins.",
        end: true,
      },
    },
  },
  // ── Heizungspfad: Mira steht im Korridor, weil 4601 unerträglich ist ──
  miraOutInHeat: {
    id: "miraOutInHeat",
    npcId: "mira",
    start: "moh1",
    lines: {
      moh1: {
        id: "moh1",
        speaker: "MIRA",
        text: "Frag nicht. Bei mir drin sind's gefühlt vierzig Grad. Der Strang macht das manchmal — seit Jahren macht er das nie, und heute macht er es.",
        subtext: "Sie steht mit dem Rücken an der kühlen Wand, Tür angelehnt.",
        next: "moh2",
      },
      moh2: {
        id: "moh2",
        speaker: "MIRA",
        text: "Ich warte, bis es abkühlt. Melden bringt nichts — für Betriebstechnik ist Kontakt mit Bewohnern nicht vorgesehen. Nicht abgelehnt. Nicht vorgesehen. Kennst du ja.",
        end: true,
      },
    },
  },
  // ── Nach unerlaubtem Zugriff: Mira spricht es an ─────────────────────
  miraTrespassConfront: {
    id: "miraTrespassConfront",
    npcId: "mira",
    start: "mtc1",
    lines: {
      mtc1: {
        id: "mtc1",
        speaker: "MIRA",
        text: "Meine Maschine schreibt mit. Nicht aus Misstrauen — aus Gewohnheit. Elf Minuten auf leitstelle.e67, während ich hier an der Wand stand.",
        subtext: "Sie sieht ihn nicht an. Das ist schlimmer, als wenn sie es täte.",
        choices: [
          { text: "Ich war das. Ich brauchte den Code.", next: "mtc2" },
          { text: "Das war ich nicht.", next: "mtc3" },
        ],
      },
      mtc2: {
        id: "mtc2",
        speaker: "MIRA",
        text: "Gut. Nicht in Ordnung, aber gut. — Wenn du gefragt hättest, hätte ich vielleicht ja gesagt. Jetzt weiß ich es eben so.",
        subtext: "Sie zuckt mit einer Schulter. Es ist keine Vergebung, aber auch kein Ende.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => {
              api.setFlag("miraConfrontedTrespass");
              api.setFlag("miraTrespassAdmitted");
            },
          },
        ],
      },
      mtc3: {
        id: "mtc3",
        speaker: "MIRA",
        text: "Der Strang geht seit vier Jahren nicht von allein hoch. Aber schön, dann war es niemand. Davon gibt es hier ja viele.",
        subtext: "Sie schiebt sich von der Wand ab und geht zurück in die Hitze.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("miraConfrontedTrespass"),
          },
        ],
      },
    },
  },
};
