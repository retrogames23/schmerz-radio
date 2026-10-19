/**
 * Bürokratie-Duell — komplett in Dialog-Bäumen.
 *
 * Vier Runden pro Fall, davon drei Konter-Runden:
 *
 *   Runde 1 — Brust greift an, Layard kontert.
 *   Runde 2 — Brust greift an, Layard kontert.
 *   Runde 3 — Layard greift an (Layards Eröffnung, Bodo/Helka-Specials).
 *   Runde 4 — Brust greift an, Layard kontert.
 *
 * Konter-Optionen werden pro Runde dynamisch aus dem Phrasenbuch
 * (STARTER_COUNTERS ∪ gelernte Konter) gebaut — Monkey-Island-Prinzip:
 * kennt Layard den passenden Konter nicht, kann er ihn nicht wählen und
 * verliert die Runde zwangsläufig. Brust reicht ihm den korrekten Konter
 * anschließend zum Übernehmen ins Phrasenbuch nach.
 *
 * Auswertung pro Fall: ≥ 2 Treffer für Layard → gewonnen, Streak +1.
 * Sonst verloren, Streak zurück auf 0. Drei in Folge → `vossbeckSummoned`.
 *
 * Endduell-Auswertung: ≥ 2 Treffer → `duelEndgameWon`. Sonst zählt der
 * `vossbeckAttempt1Lost` / `vossbeckAttempt2Lost`-Mechanismus weiter.
 */

import type { DialogChoice, DialogLine, DialogTree, GameApi } from "../types";
import {
  ATTACK_COUNTER_LINES,
  ATTACK_PHRASES,
  COUNTERS,
  FICTIONAL_ATTACKS,
  PHRASES,
  STARTER_COUNTERS,
  opponentCounters,
} from "../bureaucracyDuel";

// ──────────────────────────────────────────────────────────────────
// Hilfen
// ──────────────────────────────────────────────────────────────────

/**
 * Auswertung am Ende eines Trainingsfalls.
 * `fallNum` ist 1 (A), 2 (B) oder 3 (C) — für das informative
 * `duelTrainingWonN`-Flag (rein dokumentarisch, Gate-Logik nutzt
 * `brustWinStreak`).
 */
function resolveTraining(api: GameApi, fallNum: 1 | 2 | 3): void {
  const hits = api.getDuelHits();
  api.resetDuelHits();
  if (hits >= 2) {
    api.setFlag("duelJustWon");
    if (fallNum === 1) api.setFlag("duelTrainingWon1");
    if (fallNum === 2) api.setFlag("duelTrainingWon2");
    if (fallNum === 3) api.setFlag("duelTrainingWon3");
    const streak = api.bumpBrustWinStreak();
    if (streak >= 3) {
      api.setFlag("vossbeckSummoned");
      // Brust händigt das Formblatt 17/V auf Vorsprache aus — der einzige
      // legitime Zugang zu Vossbecks Audienzraum 3603.
      if (!api.hasFlag("gotFormblatt17V")) {
        api.setFlag("gotFormblatt17V");
        if (!api.hasItem("formblatt17V") && !api.hasItem("formblatt17VForged")) {
          api.addItem({
            id: "formblatt17V",
            name: "Formblatt 17/V auf Vorsprache",
            description:
              "Ein dünnes, beige-graues Behördenformular. Aufdruck: »FORMBLATT 17/V · ANTRAG AUF VORSPRACHE BEI OBERVERWALTER«. Unten rechts mit Tinte: »Brust, Schicht B«, sauber gegengezeichnet. Damit darf Layard Tür 3603 betreten und Vossbeck ansprechen.",
          });
        }
      }
    }
  } else {
    api.clearFlag("duelJustWon");
    api.resetBrustWinStreak();
  }
}

function resolveEndgame(api: GameApi): void {
  const hits = api.getDuelHits();
  api.resetDuelHits();
  if (hits >= 2) {
    api.setFlag("duelEndgameWon");
    api.clearFlag("duelEndgameLost");
    // Vossbeck legt den Schleusen-Code direkt ins Terminal — kein zweiter Insa-
    // Anruf nötig. `calledForCode` ist die Wahrheitsquelle für Terminal/Keypad.
    if (!api.hasFlag("vossbeckGaveCode")) {
      api.setFlag("vossbeckGaveCode");
      api.setFlag("calledForCode");
      // `port2611Locked` wird NICHT hier gesetzt: Die Umschaltung auf den
      // Leitstellen-Knoten passiert allein bei Miras Reparatur (mira.ts),
      // also immer schon vor diesem Punkt.
    }
  } else {
    // Drei Versuche bei Vossbeck zugelassen — siehe vossbeckAttempt*Lost.
    if (api.hasFlag("vossbeckAttempt2Lost")) {
      // Kein Dead End: Nach drei Fehlversuchen ist der Vorgang für heute
      // beschieden — die Versuchszähler werden aber zurückgesetzt, damit
      // Layard nach weiterem Training erneut vorsprechen kann.
      api.setFlag("duelEndgameLost");
      api.clearFlag("vossbeckAttempt1Lost");
      api.clearFlag("vossbeckAttempt2Lost");
    } else if (api.hasFlag("vossbeckAttempt1Lost")) {
      // Versuch 2 von 3 — Layard hat noch einen Versuch offen.
      api.clearFlag("duelEndgameLost");
      api.setFlag("vossbeckAttempt2Lost");
    } else {
      // Versuch 1 von 3 — eine frühere „Drei Versuche verbraucht“-Meldung
      // darf hier nicht mehr nachhallen.
      api.clearFlag("duelEndgameLost");
      api.setFlag("vossbeckAttempt1Lost");
    }
  }
}

/**
 * Baut die Angriffs-Optionen für Runde 2 (Layard greift an).
 * `opp` bestimmt, welche Konter-Texte der Gegner verwendet.
 * `stutterLineId` / `counterLineId` sind die Folge-Lines.
 */
/** Ziehe `n` zufällige Elemente aus einem Array — nicht-mutierend. */
function sample<T>(arr: readonly T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  const take = Math.min(n, pool.length);
  for (let i = 0; i < take; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]!);
  }
  return out;
}

const FICTIONAL_POOL = [
  "fa-hausflur",
  "fa-anlage3",
  "fa-sechs-wochen",
  "fa-protokoll",
  "fa-vorlauf",
  "fa-akte",
  "fa-rundschreiben",
  "fa-tarif",
  "fa-fussnote",
] as const;

function attackChoices(opp: "brust" | "vossbeck"): {
  choices: DialogChoice[];
  lines: Record<string, DialogLine>;
} {
  const lines: Record<string, DialogLine> = {};
  const choices: DialogChoice[] = [];

  // Linkische Eigen-Angriffe (Layard kennt sie immer; Gegner kontert sicher).
  // Vier von neun je Duell — sorgt für spürbare Varianz zwischen Versuchen.
  for (const id of sample(FICTIONAL_POOL, 4)) {
    const atk = FICTIONAL_ATTACKS[id];
    if (!atk) continue;
    const respId = `${opp}Resp_${id}`;
    const knows = opponentCounters(opp, id);
    choices.push({
      text: atk.text,
      action: knows ? undefined : (a) => a.bumpDuelHit(),
      next: respId,
    });
    if (knows) {
    lines[respId] = {
      id: respId,
      speaker: opp === "brust" ? "BRUST" : "VOSSBECK",
      text:
        ATTACK_COUNTER_LINES[id]![opp] +
        (opp === "brust" ? " — Punkt Brust." : " — Punkt Verwaltung."),
      subtext:
        opp === "brust"
          ? "Brust kontert, ohne den Kopf zu heben. Punkt für ihn."
          : "Vossbecks Bleistift bleibt senkrecht. Punkt für ihn.",
      next: "r4Brust",
    };
    } else {
      lines[respId] = {
        id: respId,
        speaker: opp === "brust" ? "BRUST" : "VOSSBECK",
        text:
          opp === "brust"
            ? "Also — das … einen Moment. (Brust blättert, findet nichts.) Das müsste ich … nachschlagen. — Punkt Worag."
            : "(Vossbeck hält den Bleistift an.) Das ist … so nicht vorgesehen. Weiter. — Punkt Worag.",
        subtext:
          opp === "brust"
            ? "Brust hat die Phrase nie gehört. Sichtbarer Aussetzer — Treffer für Layard."
            : "Vossbeck kennt die Phrase nicht. Kurzer Riss in der Fassade — Treffer.",
        next: "r4Brust",
      };
    }
  }

  // Bodo-Special — gelernt bei Bodo.
  {
    const id = "a-vorgesetzten-bodo";
    const atk = ATTACK_PHRASES[id]!;
    const respId = `${opp}Resp_${id}`;
    choices.push({
      text: atk.text,
      requires: ["learnedAttackVorgesetzten"],
      action: (a) => a.bumpDuelHit(),
      next: respId,
    });
    lines[respId] = {
      id: respId,
      speaker: opp === "brust" ? "BRUST" : "VOSSBECK",
      text:
        opp === "brust"
          ? "Ich — ich, also … (Brust schaut auf den Aushang. Findet den Satz nicht. Versucht es zweimal.) Den Vorgesetzten, ja, den könnte ich … einen Moment. — Punkt Worag."
          : "(Vossbeck setzt den Bleistift ab. Zum ersten Mal.) Den Vorgesetzten. Ich. — Notiert. — Punkt Worag.",
      subtext:
        opp === "brust"
          ? "Bodo hatte recht. Brust stottert sichtbar. Treffer für Layard."
          : "Vossbeck stottert. Sehr kurz, sehr trocken — aber er stottert. Treffer.",
      next: "r4Brust",
    };
  }

  // Helka-Special — gelernt bei Helka.
  {
    const id = "a-tuerschild-helka";
    const atk = ATTACK_PHRASES[id]!;
    const respId = `${opp}Resp_${id}`;
    choices.push({
      text: atk.text,
      requires: ["learnedAttackTuerschild"],
      action: (a) => a.bumpDuelHit(),
      next: respId,
    });
    lines[respId] = {
      id: respId,
      speaker: opp === "brust" ? "BRUST" : "VOSSBECK",
      text:
        opp === "brust"
          ? "Mein Türschild — also, das Türschild — das ist der … das ist eine andere Frage. (Pause.) Weiter. — Punkt Worag."
          : "(Vossbeck schaut hoch.) Mein Türschild ist sektorintern. Nicht — also, das ist nicht hier zu klären. Weiter. — Punkt Worag.",
      subtext:
        opp === "brust"
          ? "Helkas Klassiker zieht. Brust verliert kurz die Spur. Treffer."
          : "Vossbecks Antwort verliert die Schärfe. Treffer.",
      next: "r4Brust",
    };
  }

  return { choices, lines };
}

// Hinweis: `next: "r4Brust"` verweist auf die vierte Runde des jeweiligen
// Trees. Sowohl Trainings-Fälle als auch das Vossbeck-Endduell definieren
// diese Line lokal.

/**
 * Baut die vier Konter-Optionen einer Brust/Vossbeck-Runde dynamisch
 * aus dem Phrasenbuch (Starter-Konter + gelernte). Kennt Layard den
 * korrekten Konter nicht, sind alle vier Auswahlen falsch — Runde
 * verloren, Konter wird auf der Miss-Line nachgereicht.
 */
function makeCounterChoicesFn(
  correctId: string,
  hitNext: string,
  missNext: string,
): (api: GameApi) => DialogChoice[] {
  return (api: GameApi) => {
    const correct = COUNTERS[correctId];
    if (!correct) return [];
    const known = new Set<string>(STARTER_COUNTERS);
    for (const id of Object.keys(COUNTERS)) {
      if (api.hasParagraph(id)) known.add(id);
    }
    const wrongPool = Array.from(known).filter((id) => id !== correctId);
    const wrong = sample(wrongPool, 3);
    const choices: DialogChoice[] = [];
    if (known.has(correctId)) {
      choices.push({
        text: correct.text,
        action: (a) => a.bumpDuelHit(),
        next: hitNext,
      });
    }
    for (const id of wrong) {
      const c = COUNTERS[id];
      if (!c) continue;
      choices.push({ text: c.text, next: missNext });
    }
    while (choices.length < 3) {
      choices.push({
        text: "[ Layard stammelt eine leere Höflichkeit. ]",
        next: missNext,
      });
    }
    return sample(choices, choices.length);
  };
}

// ──────────────────────────────────────────────────────────────────
// Trainingsfall-Generator
// ──────────────────────────────────────────────────────────────────

function buildTrainingFall(
  treeId: string,
  fallNum: 1 | 2 | 3,
  r1PhraseId: string,
  r1CorrectId: string,
  r2PhraseId: string,
  r2CorrectId: string,
  r4PhraseId: string,
  r4CorrectId: string,
  introText: string,
): DialogTree {
  const r1Phrase = PHRASES[r1PhraseId]!;
  const r1Correct = COUNTERS[r1CorrectId]!;
  const r2Phrase = PHRASES[r2PhraseId]!;
  const r2Correct = COUNTERS[r2CorrectId]!;
  const r4Phrase = PHRASES[r4PhraseId]!;
  const r4Correct = COUNTERS[r4CorrectId]!;
  const atk = attackChoices("brust");

  const lines: Record<string, DialogLine> = {
    intro: {
      id: "intro",
      speaker: "BRUST",
      text: introText,
      subtext:
        "Kowalk wischt hinter dem Tresen über eine Stelle, die längst sauber ist. Sie hört zu.",
      next: "r1Brust",
    },
    // ── Runde 1 — Brust greift an ────────────────────────────────
    r1Brust: {
      id: "r1Brust",
      speaker: "BRUST",
      text: r1Phrase.text,
      choicesFn: makeCounterChoicesFn(r1CorrectId, "r1Hit", "r1Miss"),
    },
    r1Hit: {
      id: "r1Hit",
      speaker: "KOWALK",
      text: "Sitzt. — Punkt Worag.",
      subtext:
        "Kaum hörbar, von der Theke her. Brust kneift kurz die Augen zusammen, schweigt aber.",
      next: "r2Brust",
    },
    r1Miss: {
      id: "r1Miss",
      speaker: "BRUST",
      text: `Falsche Antwort, Bewohner Worag. Korrekt wäre gewesen: »${r1Correct.text}« — notieren Sie sich das. — Punkt Brust.`,
      subtext:
        "Kowalk schaut nicht hoch. Aber sie hat zugehört. Brust gibt den Konter sauber preis.",
      choices: [
        {
          text: `[ »${r1Correct.shortLabel}« ins Phrasenbuch übernehmen ]`,
          hiddenWhen: [],
          action: (a) => a.learnParagraph(r1Correct.id),
          next: "r2Brust",
        },
        {
          text: "[ Übergehen ]",
          next: "r2Brust",
        },
      ],
    },
    // ── Runde 2 — Brust greift an ────────────────────────────────
    r2Brust: {
      id: "r2Brust",
      speaker: "BRUST",
      text: r2Phrase.text,
      choicesFn: makeCounterChoicesFn(r2CorrectId, "r2Hit", "r2Miss"),
    },
    r2Hit: {
      id: "r2Hit",
      speaker: "KOWALK",
      text: "Sitzt. — Punkt Worag.",
      subtext: "Kowalk faltet den Lappen. Sehr sorgfältig.",
      next: "r3Intro",
    },
    r2Miss: {
      id: "r2Miss",
      speaker: "BRUST",
      text: `Falsche Antwort, Bewohner Worag. Korrekt wäre gewesen: »${r2Correct.text}«. — Punkt Brust.`,
      subtext: "Brust legt den Bleistift kurz quer. Kowalk hebt den Blick.",
      choices: [
        {
          text: `[ »${r2Correct.shortLabel}« ins Phrasenbuch übernehmen ]`,
          action: (a) => a.learnParagraph(r2Correct.id),
          next: "r3Intro",
        },
        {
          text: "[ Übergehen ]",
          next: "r3Intro",
        },
      ],
    },
    // ── Runde 3 — Layard greift an ───────────────────────────────
    r3Intro: {
      id: "r3Intro",
      speaker: "BRUST",
      text: "Ihre Eröffnung, Bewohner Worag.",
      choices: atk.choices,
    },
    ...atk.lines,
    // ── Runde 4 — Brust greift an ────────────────────────────────
    r4Brust: {
      id: "r4Brust",
      speaker: "BRUST",
      text: r4Phrase.text,
      choicesFn: makeCounterChoicesFn(r4CorrectId, "r4HitResolve", "r4MissResolve"),
    },
    r4HitResolve: {
      id: "r4HitResolve",
      speaker: "KOWALK",
      text: "Sitzt. — Punkt Worag.",
      subtext: "Kowalk dreht den Lappen einmal um. Brust legt den Bleistift ab.",
      choices: [
        {
          text: "[ Trainingsfall abschließen ]",
          action: (a) => resolveTraining(a, fallNum),
          nextDialog: "duelTrainingResult",
        },
      ],
    },
    r4MissResolve: {
      id: "r4MissResolve",
      speaker: "BRUST",
      text: `Falsche Antwort, Bewohner Worag. Korrekt wäre gewesen: »${r4Correct.text}«. — Punkt Brust.`,
      choices: [
        {
          text: `[ »${r4Correct.shortLabel}« ins Phrasenbuch übernehmen und Fall abschließen ]`,
          action: (a) => {
            a.learnParagraph(r4Correct.id);
            resolveTraining(a, fallNum);
          },
          nextDialog: "duelTrainingResult",
        },
        {
          text: "[ Übergehen und Fall abschließen ]",
          action: (a) => resolveTraining(a, fallNum),
          nextDialog: "duelTrainingResult",
        },
      ],
    },
  };

  return {
    id: treeId,
    start: "intro",
    onStart: (api) => {
      api.resetDuelHits();
      api.clearFlag("duelJustWon");
    },
    lines,
  };
}

// ──────────────────────────────────────────────────────────────────
// Drei Trainingsfälle
// ──────────────────────────────────────────────────────────────────

const cafeteriaTrainingA = buildTrainingFall(
  "cafeteriaTrainingA",
  1,
  "p-immer-so",
  "c-immer-so",
  "p-stapel",
  "c-stapel",
  "p-nicht-zustaendig",
  "c-nicht-zustaendig",
  "Trainingsfall Eins. Konstellation: Bewohner verlangt eine B3 ohne Termin. Bewohner argumentiert mit Hausordnung. Ich eröffne — Sie kontern.",
);

const cafeteriaTrainingB = buildTrainingFall(
  "cafeteriaTrainingB",
  2,
  "p-stapel",
  "c-stapel",
  "p-formsache",
  "c-formsache",
  "p-termin",
  "c-termin",
  "Trainingsfall Zwei. Konstellation: Bewohner fordert Akteneinsicht. Beamter weicht aus. Ich eröffne.",
);

const cafeteriaTrainingC = buildTrainingFall(
  "cafeteriaTrainingC",
  3,
  "p-formsache",
  "c-formsache",
  "p-immer-so",
  "c-immer-so",
  "p-vorgesetzte",
  "c-vorgesetzte",
  "Trainingsfall Drei. Konstellation: Bewohner verlangt einen Stempel, den die Schicht nicht hat. Letzter Trainingsfall. Wenn Sie den sauber durchziehen, sind Sie für Vossbeck satisfaktionsfähig. Ich eröffne.",
);

// Weitere Varianten — werden von cafeteria.ts zufällig gezogen, sodass
// aufeinanderfolgende Trainingsfälle sich deutlich unterscheiden.
const cafeteriaTrainingD = buildTrainingFall(
  "cafeteriaTrainingD",
  1,
  "p-aktenzeichen",
  "c-aktenzeichen",
  "p-vordruck",
  "c-vordruck",
  "p-dienstweg",
  "c-dienstweg",
  "Konstellation: Bewohner reicht Formular ein, dessen Nummer noch nicht vergeben wurde. Der Beamte verweist. Ich eröffne.",
);

const cafeteriaTrainingE = buildTrainingFall(
  "cafeteriaTrainingE",
  2,
  "p-vordruck",
  "c-vordruck",
  "p-sprechzeit",
  "c-sprechzeit",
  "p-unterschrift",
  "c-unterschrift",
  "Konstellation: Bewohner erscheint zwei Minuten vor Feierabend. Beamter erwägt die Uhr. Ich eröffne.",
);

const cafeteriaTrainingF = buildTrainingFall(
  "cafeteriaTrainingF",
  3,
  "p-datenschutz",
  "c-datenschutz",
  "p-termin",
  "c-termin",
  "p-quartalsende",
  "c-quartalsende",
  "Konstellation: Bewohner fragt nach eigenem Vorgang. Beamter beruft sich auf Vertraulichkeit, Quartalsende und Terminzwang. Ich eröffne.",
);

const cafeteriaTrainingG = buildTrainingFall(
  "cafeteriaTrainingG",
  1,
  "p-sprechzeit",
  "c-sprechzeit",
  "p-unterschrift",
  "c-unterschrift",
  "p-vorgesetzte",
  "c-vorgesetzte",
  "Konstellation: Bewohner steht drei Zentimeter zu weit vorn am Tresen. Beamter zieht Grenze, verweist auf Vorgesetzten und fehlende Unterschrift. Ich eröffne.",
);

const cafeteriaTrainingH = buildTrainingFall(
  "cafeteriaTrainingH",
  2,
  "p-immer-so",
  "c-immer-so",
  "p-dienstweg",
  "c-dienstweg",
  "p-stapel",
  "c-stapel",
  "Konstellation: Bewohner fragt nach dem Verbleib eines Antrags. Beamter blättert nicht. Ich eröffne.",
);

// ──────────────────────────────────────────────────────────────────
// Ergebnis-Tree (Training)
// ──────────────────────────────────────────────────────────────────

const duelTrainingResult: DialogTree = {
  id: "duelTrainingResult",
  start: "intro",
  lines: {
    intro: {
      id: "intro",
      speaker: "SYSTEM",
      text: "[ Brust blättert in seinem Block, ohne aufzuschauen. ]",
      next: "branch",
    },
    branch: {
      id: "branch",
      speaker: "SYSTEM",
      // Skippt direkt zu won3, won2, won1 oder lost — je nach Flagstand.
      text: "",
      requires: ["vossbeckSummoned"],
      hiddenWhen: [],
      next: "won3Pre",
    },
    won3Pre: {
      id: "won3Pre",
      speaker: "BRUST",
      text: "Drei in Folge. Korrekt notiert. — Ich beurkunde das.",
      subtext:
        "»Beurkunden« mit dem leichten Zittern eines Mannes, der das Wort lange im Spiegel geübt hat.",
      next: "won3End",
    },
    won3End: {
      id: "won3End",
      speaker: "BRUST",
      text: "Tür 3603, nebenan. Oberinspektor Vossbeck. Sie kennen den Weg. Klopfen Sie nicht.",
      end: true,
    },
  },
};

// Da DialogLine.requires/hiddenWhen nur EINE Bedingung filtert (skip wenn
// Bedingung nicht erfüllt → springe zu `next`), bauen wir die Verzweigung
// als Kette: erst "won3" prüfen, sonst weiter zu "won2", "won1", "lost".

const duelTrainingResultBranching: DialogTree = {
  id: "duelTrainingResult",
  start: "checkWon3",
  lines: {
    checkWon3: {
      id: "checkWon3",
      speaker: "BRUST",
      text: "Drei in Folge. Korrekt notiert. — Ich beurkunde das. Hier, Bewohner Worag: Formblatt Siebzehn-V auf Vorsprache, gegengezeichnet Brust. Damit dürfen Sie bei Oberverwalter Vossbeck vorsprechen, Tür 3603 nebenan. Ohne Formblatt lässt er Sie nicht einmal auf den Stuhl.",
      subtext:
        "»Beurkunden« mit dem leisen Zittern eines Mannes, der das Wort lange im Spiegel geübt hat.",
      requires: ["vossbeckSummoned"],
      next: "checkWon",
      end: true,
    },
    checkWon: {
      id: "checkWon",
      speaker: "BRUST",
      text: "Trainingsfall bestanden, Bewohner Worag. Nicht sauber genug für Formblatt Siebzehn-V — dafür brauche ich drei saubere Konter in Folge. Aber notiert. Kommen Sie wieder, wenn Sie's ganz wollen.",
      subtext: "Brust legt den Stempel zurück in die Halterung. Kein Formblatt heute.",
      requires: ["duelJustWon"],
      hiddenWhen: ["vossbeckSummoned"],
      next: "lost",
      end: true,
    },
    lost: {
      id: "lost",
      speaker: "BRUST",
      text: "Trainingsfall verfehlt, Bewohner Worag. Zählung der drei sauberen Konter zurück auf null. Wenn Sie wollen, von vorn — beim nächsten Mal.",
      subtext: "Kowalk legt den Lappen ab. Schaut Layard kurz an. Sagt nichts.",
      end: true,
    },
  },
};

// Die obige `duelTrainingResult`-Variante ohne Branching war ein Entwurf —
// wir exportieren die saubere Branching-Version.
void duelTrainingResult;

// ──────────────────────────────────────────────────────────────────
// Vossbeck-Endduell
// ──────────────────────────────────────────────────────────────────

const vossbeckDuel: DialogTree = (() => {
  const r1Phrase = PHRASES["pE-tradition"]!;
  const r2Phrase = PHRASES["pE-vorgesetzten-bluff"]!;
  const r4Phrase = PHRASES["pE-stapel-hoheit"]!;
  const atk = attackChoices("vossbeck");

  return {
    id: "vossbeckDuel",
    start: "intro",
    onStart: (api) => api.resetDuelHits(),
    lines: {
      intro: {
        id: "intro",
        speaker: "VOSSBECK",
        text: "Vier Runden, Bewohner Worag. Drei aus dem Verfahren, eine aus Ihrer Feder. Beginn.",
        subtext: "Vossbeck setzt den Bleistift senkrecht. Schaut zum ersten Mal nicht in die Akte.",
        next: "r1Brust",
      },
      r1Brust: {
        id: "r1Brust",
        speaker: "VOSSBECK",
        text: r1Phrase.text,
        choicesFn: makeCounterChoicesFn("c-immer-so", "r1Hit", "r1Miss"),
      },
      r1Hit: {
        id: "r1Hit",
        speaker: "VOSSBECK",
        text: "Notiert. — Punkt Worag.",
        subtext: "Sehr trocken. Aber er senkt den Bleistift einen Millimeter.",
        next: "r2Brust",
      },
      r1Miss: {
        id: "r1Miss",
        speaker: "VOSSBECK",
        text: "Schwach, Bewohner Worag. Ich hatte mit mehr gerechnet. — Punkt Verwaltung.",
        subtext: "Kein Konter wird nachgereicht. Vossbeck lehrt nicht. Brust hätte das tun sollen.",
        next: "r2Brust",
      },
      r2Brust: {
        id: "r2Brust",
        speaker: "VOSSBECK",
        text: r2Phrase.text,
        choicesFn: makeCounterChoicesFn("c-vorgesetzte", "r2Hit", "r2Miss"),
      },
      r2Hit: {
        id: "r2Hit",
        speaker: "VOSSBECK",
        text: "Notiert. — Punkt Worag.",
        subtext: "Der Bleistift bewegt sich zum zweiten Mal.",
        next: "r3Intro",
      },
      r2Miss: {
        id: "r2Miss",
        speaker: "VOSSBECK",
        text: "Zu schwach, Bewohner Worag. — Punkt Verwaltung.",
        next: "r3Intro",
      },
      r3Intro: {
        id: "r3Intro",
        speaker: "VOSSBECK",
        text: "Ihre Eröffnung.",
        choices: atk.choices,
      },
      ...atk.lines,
      r4Brust: {
        id: "r4Brust",
        speaker: "VOSSBECK",
        text: r4Phrase.text,
        choicesFn: makeCounterChoicesFn("c-sprechzeit", "r4HitResolve", "r4MissResolve"),
      },
      r4HitResolve: {
        id: "r4HitResolve",
        speaker: "VOSSBECK",
        text: "Notiert. — Punkt Worag.",
        choices: [
          {
            text: "[ Endduell abschließen ]",
            action: (a) => resolveEndgame(a),
            nextDialog: "duelEndgameResult",
          },
        ],
      },
      r4MissResolve: {
        id: "r4MissResolve",
        speaker: "VOSSBECK",
        text: "Schwach, Bewohner Worag. — Punkt Verwaltung.",
        choices: [
          {
            text: "[ Endduell abschließen ]",
            action: (a) => resolveEndgame(a),
            nextDialog: "duelEndgameResult",
          },
        ],
      },
    },
  };
})();

// ──────────────────────────────────────────────────────────────────
// Endduell-Ergebnis
// ──────────────────────────────────────────────────────────────────

const duelEndgameResult: DialogTree = {
  id: "duelEndgameResult",
  start: "checkWon",
  lines: {
    checkWon: {
      id: "checkWon",
      speaker: "VOSSBECK",
      text: "Bewohner Worag. Sie sind im Behörden-Ton zu Hause. — Es ergeht: Antrag auf Tagescode für Quadrantenschleuse E67/E71 bewilligt, vorbehaltlich. Ich lege den Code in Ihr Terminal-Postfach. Datum, ohne Punkte. Acht Ziffern.",
      subtext:
        "Er sagt es ohne Hohn. Der Bleistift bleibt senkrecht, aber er liegt jetzt waagerecht auf der Akte.",
      requires: ["duelEndgameWon"],
      next: "codeDelivered",
      end: true,
    },
    codeDelivered: {
      id: "codeDelivered",
      speaker: "SYSTEM",
      text: "[ Im Terminal liegt jetzt eine Nachricht der Leitstelle. Datum: 06.11.1997. Code-Format: ohne Punkte. Acht Ziffern. ]",
      requires: ["duelEndgameWon"],
      next: "checkLost",
      end: true,
    },
    checkLost: {
      id: "checkLost",
      speaker: "VOSSBECK",
      text: "Abschlägig beschieden. Antrag auf Tagescode bleibt — für heute — unbearbeitet. Drei Versuche verbraucht.",
      subtext: "„Der Vorgang ist damit nicht erledigt, Bewohner Worag. Üben Sie bei Herrn Brust. Danach nehme ich Ihre Vorsprache erneut entgegen.“",
      requires: ["duelEndgameLost"],
      next: "tryAgain",
      end: true,
    },
    tryAgain: {
      id: "tryAgain",
      speaker: "VOSSBECK",
      text: "Knapp daneben, Bewohner Worag. Sie haben noch Versuche. Aber heute nicht mehr — gehen Sie. Üben Sie. Kommen Sie wieder.",
      end: true,
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Export
// ──────────────────────────────────────────────────────────────────

export const bureaucracyDuelDialogs: Record<string, DialogTree> = {
  cafeteriaTrainingA,
  cafeteriaTrainingB,
  cafeteriaTrainingC,
  cafeteriaTrainingD,
  cafeteriaTrainingE,
  cafeteriaTrainingF,
  cafeteriaTrainingG,
  cafeteriaTrainingH,
  duelTrainingResult: duelTrainingResultBranching,
  vossbeckDuel,
  duelEndgameResult,
};

/**
 * Zufällige Auswahl eines Trainingsfalls beim Klick auf »Beginnen«.
 * Zwei aufeinanderfolgende Fälle werden nach Möglichkeit nicht dieselben —
 * die letzte ID landet in `sessionStorage`, damit Rerolls fair sind.
 */
const TRAINING_IDS = [
  "cafeteriaTrainingA",
  "cafeteriaTrainingB",
  "cafeteriaTrainingC",
  "cafeteriaTrainingD",
  "cafeteriaTrainingE",
  "cafeteriaTrainingF",
  "cafeteriaTrainingG",
  "cafeteriaTrainingH",
] as const;

export function pickTrainingFallId(): string {
  const key = "e67.lastTrainingId";
  let last: string | null = null;
  try {
    last = typeof window !== "undefined" ? window.sessionStorage.getItem(key) : null;
  } catch {
    /* ignore */
  }
  const pool = TRAINING_IDS.filter((id) => id !== last);
  const pick = pool[Math.floor(Math.random() * pool.length)]!;
  try {
    if (typeof window !== "undefined") window.sessionStorage.setItem(key, pick);
  } catch {
    /* ignore */
  }
  return pick;
}
