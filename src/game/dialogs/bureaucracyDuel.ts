/**
 * Bürokratie-Duell — komplett in Dialog-Bäumen.
 *
 * Drei Trainingsfälle (A/B/C) gegen Brust + ein Endduell gegen Vossbeck.
 * Jeder Fall geht über drei Runden:
 *
 *   Runde 1 — Brust greift an, Layard kontert (Treffer oder Fehler →
 *             Brust zeigt korrekten Konter, Spieler kann ins
 *             Phrasenbuch übernehmen).
 *   Runde 2 — Layard greift an. Brust kontert souverän (fictional pool)
 *             oder stottert sichtbar (Bodo/Helka-Specials).
 *   Runde 3 — Brust greift an, wie Runde 1.
 *
 * Auswertung pro Fall: ≥ 2 Treffer für Layard → gewonnen, Streak +1.
 * Sonst verloren, Streak zurück auf 0. Drei in Folge → `vossbeckSummoned`.
 *
 * Endduell-Auswertung: ≥ 2 Treffer → `duelEndgameWon`. Sonst zählt der
 * `vossbeckAttempt1Lost` / `vossbeckAttempt2Lost`-Mechanismus weiter
 * (Brusts und Kowalks bestehende Wege).
 */

import type { DialogChoice, DialogLine, DialogTree, GameApi } from "../types";
import {
  ATTACK_COUNTER_LINES,
  ATTACK_PHRASES,
  COUNTERS,
  FICTIONAL_ATTACKS,
  PHRASES,
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
    api.resetBrustWinStreak();
  }
}

function resolveEndgame(api: GameApi): void {
  const hits = api.getDuelHits();
  api.resetDuelHits();
  if (hits >= 2) {
    api.setFlag("duelEndgameWon");
    // Vossbeck legt den Sektor-Code direkt ins Terminal — kein zweiter Insa-
    // Anruf nötig. `calledForCode` ist die Wahrheitsquelle für Terminal/Keypad.
    if (!api.hasFlag("vossbeckGaveCode")) {
      api.setFlag("vossbeckGaveCode");
      api.setFlag("calledForCode");
    }
  } else {
    // Drei Versuche bei Vossbeck zugelassen — siehe vossbeckAttempt*Lost.
    if (api.hasFlag("vossbeckAttempt2Lost")) {
      api.setFlag("duelEndgameLost");
    } else if (api.hasFlag("vossbeckAttempt1Lost")) {
      api.setFlag("vossbeckAttempt2Lost");
    } else {
      api.setFlag("vossbeckAttempt1Lost");
    }
  }
}

/**
 * Baut die Angriffs-Optionen für Runde 2 (Layard greift an).
 * `opp` bestimmt, welche Konter-Texte der Gegner verwendet.
 * `stutterLineId` / `counterLineId` sind die Folge-Lines.
 */
function attackChoices(opp: "brust" | "vossbeck"): {
  choices: DialogChoice[];
  lines: Record<string, DialogLine>;
} {
  const lines: Record<string, DialogLine> = {};
  const choices: DialogChoice[] = [];

  // Linkische Eigen-Angriffe (Layard kennt sie immer; Gegner kontert sicher).
  for (const id of ["fa-hausflur", "fa-anlage3", "fa-sechs-wochen", "fa-protokoll"]) {
    const atk = FICTIONAL_ATTACKS[id];
    if (!atk) continue;
    const respId = `${opp}Resp_${id}`;
    choices.push({
      text: atk.text,
      next: respId,
    });
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
      next: "r3Brust",
    };
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
      next: "r3Brust",
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
      next: "r3Brust",
    };
  }

  return { choices, lines };
}

// Hinweis: `next: "r3Brust"` ist innerhalb desselben Tree-Scopes der ID
// nach `r3Brust` zu suchen. Da jeder Trainingsfall seine eigene `r3Brust`-
// Line definiert, klappt das. Der Vossbeck-Tree hat ebenfalls `r3Brust`.

// ──────────────────────────────────────────────────────────────────
// Trainingsfall-Generator
// ──────────────────────────────────────────────────────────────────

function buildTrainingFall(
  treeId: string,
  fallNum: 1 | 2 | 3,
  r1PhraseId: string,
  r1CorrectId: string,
  r1WrongIds: string[],
  r3PhraseId: string,
  r3CorrectId: string,
  r3WrongIds: string[],
  introText: string,
): DialogTree {
  const r1Phrase = PHRASES[r1PhraseId]!;
  const r1Correct = COUNTERS[r1CorrectId]!;
  const r3Phrase = PHRASES[r3PhraseId]!;
  const r3Correct = COUNTERS[r3CorrectId]!;
  const atk = attackChoices("brust");

  // Konter-Optionen für eine Brust-Runde bauen. Vier Optionen, eine richtig.
  const r1Choices: DialogChoice[] = [
    {
      text: r1Correct.text,
      action: (a) => a.bumpDuelHit(),
      next: "r1Hit",
    },
    ...r1WrongIds.map((id) => ({
      text: COUNTERS[id]!.text,
      next: "r1Miss",
    })),
  ];
  const r3Choices: DialogChoice[] = [
    {
      text: r3Correct.text,
      action: (a) => {
        a.bumpDuelHit();
      },
      next: "r3HitResolve",
    },
    ...r3WrongIds.map((id) => ({
      text: COUNTERS[id]!.text,
      next: "r3MissResolve",
    })),
  ];

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
      choices: r1Choices,
    },
    r1Hit: {
      id: "r1Hit",
      speaker: "KOWALK",
      text: "Sitzt. — Punkt Worag.",
      subtext:
        "Kaum hörbar, von der Theke her. Brust kneift kurz die Augen zusammen, schweigt aber.",
      next: "r2Intro",
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
          action: (a) => a.learnParagraph(r1Correct.id),
          next: "r2Intro",
        },
        {
          text: "[ Übergehen ]",
          next: "r2Intro",
        },
      ],
    },
    // ── Runde 2 — Layard greift an ───────────────────────────────
    r2Intro: {
      id: "r2Intro",
      speaker: "BRUST",
      text: "Ihre Eröffnung, Bewohner Worag.",
      choices: atk.choices,
    },
    ...atk.lines,
    // ── Runde 3 — Brust greift an ────────────────────────────────
    r3Brust: {
      id: "r3Brust",
      speaker: "BRUST",
      text: r3Phrase.text,
      choices: r3Choices,
    },
    r3HitResolve: {
      id: "r3HitResolve",
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
    r3MissResolve: {
      id: "r3MissResolve",
      speaker: "BRUST",
      text: `Falsche Antwort, Bewohner Worag. Korrekt wäre gewesen: »${r3Correct.text}«. — Punkt Brust.`,
      choices: [
        {
          text: `[ »${r3Correct.shortLabel}« ins Phrasenbuch übernehmen und Fall abschließen ]`,
          action: (a) => {
            a.learnParagraph(r3Correct.id);
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
    onStart: (api) => api.resetDuelHits(),
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
  ["c-stapel", "c-termin", "c-formsache"],
  "p-nicht-zustaendig",
  "c-nicht-zustaendig",
  ["c-vorgesetzte", "c-immer-so", "c-formsache"],
  "Trainingsfall Eins. Konstellation: Bewohner verlangt eine B3 ohne Termin. Bewohner argumentiert mit Hausordnung. Ich eröffne — Sie kontern.",
);

const cafeteriaTrainingB = buildTrainingFall(
  "cafeteriaTrainingB",
  2,
  "p-stapel",
  "c-stapel",
  ["c-immer-so", "c-nicht-zustaendig", "c-termin"],
  "p-termin",
  "c-termin",
  ["c-formsache", "c-vorgesetzte", "c-stapel"],
  "Trainingsfall Zwei. Konstellation: Bewohner fordert Akteneinsicht. Beamter weicht aus. Ich eröffne.",
);

const cafeteriaTrainingC = buildTrainingFall(
  "cafeteriaTrainingC",
  3,
  "p-formsache",
  "c-formsache",
  ["c-immer-so", "c-stapel", "c-nicht-zustaendig"],
  "p-vorgesetzte",
  "c-vorgesetzte",
  ["c-termin", "c-formsache", "c-immer-so"],
  "Trainingsfall Drei. Konstellation: Bewohner verlangt einen Stempel, den die Schicht nicht hat. Letzter Trainingsfall. Wenn Sie den sauber durchziehen, sind Sie für Vossbeck satisfaktionsfähig. Ich eröffne.",
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
      next: "checkWon2",
    },
    checkWon2: {
      id: "checkWon2",
      speaker: "BRUST",
      text: "Notiert. Weiter.",
      requires: ["duelTrainingWon2"],
      hiddenWhen: ["vossbeckSummoned"],
      next: "checkWon1",
    },
    checkWon1: {
      id: "checkWon1",
      speaker: "BRUST",
      text: "Erste saubere Runde. Weiter.",
      requires: ["duelTrainingWon1"],
      hiddenWhen: ["vossbeckSummoned", "duelTrainingWon2"],
      next: "lost",
    },
    lost: {
      id: "lost",
      speaker: "BRUST",
      text: "Trainingsfall verfehlt, Bewohner Worag. Zählung zurück auf null. Wenn Sie wollen, von vorn — beim nächsten Mal.",
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
  const r1Correct = COUNTERS["c-immer-so"]!;
  const r3Phrase = PHRASES["pE-stapel-hoheit"]!;
  const r3Correct = COUNTERS["c-stapel"]!;
  const atk = attackChoices("vossbeck");

  const r1Choices: DialogChoice[] = [
    {
      text: r1Correct.text,
      action: (a) => a.bumpDuelHit(),
      next: "r1Hit",
    },
    { text: COUNTERS["c-stapel"]!.text, next: "r1Miss" },
    { text: COUNTERS["c-termin"]!.text, next: "r1Miss" },
    { text: COUNTERS["c-vorgesetzte"]!.text, next: "r1Miss" },
  ];
  const r3Choices: DialogChoice[] = [
    {
      text: r3Correct.text,
      action: (a) => a.bumpDuelHit(),
      next: "r3HitResolve",
    },
    { text: COUNTERS["c-formsache"]!.text, next: "r3MissResolve" },
    { text: COUNTERS["c-nicht-zustaendig"]!.text, next: "r3MissResolve" },
    { text: COUNTERS["c-immer-so"]!.text, next: "r3MissResolve" },
  ];

  return {
    id: "vossbeckDuel",
    start: "intro",
    onStart: (api) => api.resetDuelHits(),
    lines: {
      intro: {
        id: "intro",
        speaker: "VOSSBECK",
        text: "Drei Runden, Bewohner Worag. Ich verwende ausschließlich Phrasen aus dem Verfahren — gegen die Brust Sie geübt haben sollte. Beginn.",
        subtext: "Vossbeck setzt den Bleistift senkrecht. Schaut zum ersten Mal nicht in die Akte.",
        next: "r1Brust",
      },
      r1Brust: {
        id: "r1Brust",
        speaker: "VOSSBECK",
        text: r1Phrase.text,
        choices: r1Choices,
      },
      r1Hit: {
        id: "r1Hit",
        speaker: "VOSSBECK",
        text: "Notiert. — Punkt Worag.",
        subtext: "Sehr trocken. Aber er senkt den Bleistift einen Millimeter.",
        next: "r2Intro",
      },
      r1Miss: {
        id: "r1Miss",
        speaker: "VOSSBECK",
        text: "Schwach, Bewohner Worag. Ich hatte mit mehr gerechnet. — Punkt Verwaltung.",
        subtext: "Kein Konter wird nachgereicht. Vossbeck lehrt nicht. Brust hätte das tun sollen.",
        next: "r2Intro",
      },
      r2Intro: {
        id: "r2Intro",
        speaker: "VOSSBECK",
        text: "Ihre Eröffnung.",
        choices: atk.choices,
      },
      ...atk.lines,
      r3Brust: {
        id: "r3Brust",
        speaker: "VOSSBECK",
        text: r3Phrase.text,
        choices: r3Choices,
      },
      r3HitResolve: {
        id: "r3HitResolve",
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
      r3MissResolve: {
        id: "r3MissResolve",
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
      text: "Bewohner Worag. Sie sind im Behörden-Ton zu Hause. — Antrag auf Tagescode für Sektor-Tür E67/E71: bewilligt. Ich lege den Code in Ihr Terminal-Postfach. Datum, ohne Punkte. Acht Ziffern.",
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
      text: "Abschlägig beschieden. Antrag auf Tagescode bleibt — bis auf weiteres — unbearbeitet. Drei Versuche sind aufgebraucht.",
      subtext: "Drei Versuche sind aufgebraucht. Was jetzt noch geht, geht nicht über Vossbeck.",
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
  duelTrainingResult: duelTrainingResultBranching,
  vossbeckDuel,
  duelEndgameResult,
};
