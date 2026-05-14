import type { DialogTree } from "../types";

/**
 * Gemeinschaftsraum E71 (Tür 1530) — drei Home-Computer-Nerds.
 *
 * Stilprinzip: jedes Gespräch klingt wie ein Schnipsel aus einer
 * fortlaufenden Runde — die drei reden so, wie 90er-Computernerds
 * eben reden (Marken, Specs, Preisvergleiche, kleine Eitelkeiten).
 * Die fünf Quiz-Fakten sind in den Smalltalk eingestreut, nicht
 * formell „abgefragt".
 *
 * Quiz: 5 Fragen, 3 richtige reichen.
 *  1) Chipsatz (OCS) ............... Detlef
 *  2) Diskettenkapazität (880 KB) .. Sigi
 *  3) Modem-Baudrate (2400) ........ Ruven
 *  4) Paula-Tonkanäle (4) .......... Ruven
 *  5) Demo-Szene-Land (Norwegen) ... Sigi
 */
export const e71NerdsDialogs: Record<string, DialogTree> = {
  // ─────────────────────────────────────────────────────────────
  //  DETLEF — der Wortführer am Amiga
  // ─────────────────────────────────────────────────────────────
  e71NerdDetlef: {
    id: "e71NerdDetlef",
    start: "d0",
    onStart: (api) => api.setFlag("metE71Nerd1"),
    lines: {
      d0: {
        id: "d0",
        speaker: "DETLEF",
        text: "(zu Sigi, ohne aufzusehen) … natürlich Original-Chipsatz, was denn sonst. Du willst doch nicht ernsthaft auf ECS warten, bis die uns hier was schicken.",
        subtext:
          "Er bemerkt Layard erst, als der schon zwei Sekunden danebensteht.",
        next: "d1",
      },
      d1: {
        id: "d1",
        speaker: "DETLEF",
        text: "Oh — hi. Bist du neu hier, oder nur verlaufen? Du hast so ein E67-Gesicht.",
        choices: [
          { text: "Bin aus E67, ja. — Was steht da auf dem Bildschirm?", next: "dAmiga1" },
          { text: "Woher habt ihr den Computer?", next: "dImport1" },
          { text: "Was war das mit „Original-Chipsatz“?", next: "dChip1" },
          { text: "Ich hör euch eine Weile zu.", next: "dByeListen" },
        ],
      },
      // — Was zeigt der Schirm
      dAmiga1: {
        id: "dAmiga1",
        speaker: "DETLEF",
        text: "Workbench. Version 1.3. Sieht aus wie ein Schreibtisch mit Schubladen drauf, weil — naja, weil es das ist. Du klickst auf eine Schublade, sie geht auf. Revolutionär, oder?",
        next: "dAmiga2",
      },
      dAmiga2: {
        id: "dAmiga2",
        speaker: "DETLEF",
        text: "Drüben in den Staaten haben das viele zuhause. Hier im Mandatsgebiet — Glück, wenn du überhaupt einen Schwarzweiß-Terminal in der Wohnung hast. Tja, unser E71 ist etwas fortschrittlicher, wohlhabender und offener als E67.",
        subtext: "Er sagt das nicht hämisch. Er sagt das, als wäre es Wetter.",
        next: "d0",
      },
      // — Import
      dImport1: {
        id: "dImport1",
        speaker: "DETLEF",
        text: "Cousin von Sigi. Hamburg-West. Der hat das Ding über drei Ecken besorgt. Drüben kostet so ein A500 ungefähr 699 Dollar — hier zahlst du dafür einen Kleinwagen, wenn du überhaupt jemanden findest, der dir einen verkauft.",
        next: "dImport2",
      },
      dImport2: {
        id: "dImport2",
        speaker: "DETLEF",
        text: "Der Trick ist: keine Anmeldung beim Sektor. Steht offiziell als „Bauteil-Konvolut für Lehrzwecke“ in den Papieren. Niemand fragt nach, solange wir hier drin bleiben.",
        next: "d0",
      },
      // — Chipsatz
      dChip1: {
        id: "dChip1",
        speaker: "DETLEF",
        text: "Der Amiga hat drei Custom-Chips: Agnus, Denise, Paula. Zusammen heißen die OCS — Original Chip Set. Das ist das, was ihn überhaupt zum Amiga macht. PCs haben sowas nicht, die schieben alles über die CPU.",
        next: "dChip2",
      },
      dChip2: {
        id: "dChip2",
        speaker: "DETLEF",
        text: "Dieser hier hat 512 Kilobyte Chip-RAM, mit der Erweiterung im Trapdoor-Slot ein Megabyte. Reicht für eigentlich alles, was wir hier laufen lassen.",
        next: "d0",
      },
      dByeListen: {
        id: "dByeListen",
        speaker: "DETLEF",
        text: "Klar. Setz dich. Wir reden eh die ganze Zeit.",
        end: true,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────
  //  SIGI — auf dem Sofa, Disketten-Sammler, Demo-Szene-Fan
  // ─────────────────────────────────────────────────────────────
  e71NerdSigi: {
    id: "e71NerdSigi",
    start: "s0",
    onStart: (api) => api.setFlag("metE71Nerd2"),
    lines: {
      s0: {
        id: "s0",
        speaker: "SIGI",
        text: "(blättert in einem Diktat-Heft mit Schrägstrichen) Moment, das pack ich gerade um. Der Ordner ist voll.",
        choices: [
          { text: "Was ist da drin?", next: "sDisk1" },
          { text: "Was ist „Demo-Szene“?", next: "sDemo1" },
          { text: "Erzähl mir von eurer Festplatte.", next: "sHdd1" },
          { text: "Später.", next: "sBye" },
        ],
      },
      sDisk1: {
        id: "sDisk1",
        speaker: "SIGI",
        text: "Disketten. 3,5 Zoll, doppelte Dichte. Eine PC-formatierte fasst 720 Kilobyte. Eine Amiga-formatierte fasst 880. Weil der Amiga seinen eigenen Disk-Controller hat und nicht so viel Platz für den Index verbrennt.",
        next: "sDisk2",
      },
      sDisk2: {
        id: "sDisk2",
        speaker: "SIGI",
        text: "Klingt nach wenig, sind aber 22 Prozent mehr Spiel pro Diskette. Bei einer Spielesammlung wie meiner ist das ein zusätzlicher Ordner, den ich mir nicht kaufen muss.",
        next: "s0",
      },
      sDemo1: {
        id: "sDemo1",
        speaker: "SIGI",
        text: "Demos sind kleine Programme, in denen Leute zeigen, was sie aus der Hardware rausquetschen können. Vektorgrafik, Musik, Effekte — alles in 64 Kilobyte oder weniger. Wettbewerbe gibt's in halb Europa.",
        next: "sDemo2",
      },
      sDemo2: {
        id: "sDemo2",
        speaker: "SIGI",
        text: "Die wirklich wahnsinnigen Sachen kommen aus Norwegen. Skandinavien insgesamt eigentlich, aber Norwegen ist nochmal ein Stück weiter vorne. Spaceballs, „State of the Art“ — wenn du das einmal gesehen hast, willst du keinen Trickfilm im Teleempfänger mehr sehen.",
        next: "s0",
      },
      sHdd1: {
        id: "sHdd1",
        speaker: "SIGI",
        text: "Wir haben keine. Ein Freund von Ruven schon, in seinem A2000. 20 Megabyte. Hat ihn drei Monatslöhne gekostet, schwarz, durch Hamburg.",
        next: "sHdd2",
      },
      sHdd2: {
        id: "sHdd2",
        speaker: "SIGI",
        text: "20 Megabyte — das sind 23 Disketten in einem Kasten, der nicht klappert. Stell dir das mal vor.",
        next: "s0",
      },
      sBye: {
        id: "sBye",
        speaker: "SIGI",
        text: "Klar.",
        end: true,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────
  //  RUVEN — am Regal, Modem-Fan, Sound-Nerd
  // ─────────────────────────────────────────────────────────────
  e71NerdRuven: {
    id: "e71NerdRuven",
    start: "r0",
    onStart: (api) => api.setFlag("metE71Nerd3"),
    lines: {
      r0: {
        id: "r0",
        speaker: "RUVEN",
        text: "(klopft auf eine kleine graue Kiste am Regal) Hörst du das? Das ist nicht der Computer, das ist das Modem. Wenn das nicht surrt, geht hier gar nichts raus.",
        choices: [
          { text: "Was für ein Modem ist das?", next: "rModem1" },
          { text: "Wozu braucht man das?", next: "rWeb1" },
          { text: "Was kann der Sound vom Amiga?", next: "rSound1" },
          { text: "Bin gleich wieder da.", next: "rBye" },
        ],
      },
      rModem1: {
        id: "rModem1",
        speaker: "RUVEN",
        text: "2400 Baud. Klein, langsam, ehrlich. Das schnellste, was wir hier ohne Anmeldung kriegen. Drüben gibt's schon 9600er-Modems, aber die fallen am Zoll auf wie ein roter Hut.",
        next: "rModem2",
      },
      rModem2: {
        id: "rModem2",
        speaker: "RUVEN",
        text: "Funktioniert nur, wenn keiner telefoniert. Sigis Mutter hat uns schon zweimal mitten in einem Download rausgeworfen, weil sie ihre Schwester anrufen wollte.",
        next: "r0",
      },
      rWeb1: {
        id: "rWeb1",
        speaker: "RUVEN",
        text: "FastWeb. Eine Handvoll Seiten, die wir aus Übersee anwählen können. Im Mandatsgebiet selbst gibt's das offiziell gar nicht — die wollen alles schön durch ihre eigenen Terminals jagen, mit Logbuch.",
        next: "rWeb2",
      },
      rWeb2: {
        id: "rWeb2",
        speaker: "RUVEN",
        text: "Wir haben fünf Bookmarks, die regelmäßig gehen. Ein Portal, ein Nachrichtenseite, ein Gästebuch, eine Amiga-Fanseite, eine Weltzeit-Seite. Mehr brauchen wir auch nicht.",
        next: "r0",
      },
      rSound1: {
        id: "rSound1",
        speaker: "RUVEN",
        text: "Paula-Chip. Vier Stimmen, je 8-Bit, hardware-gemischt. Klingt nach nichts, ist aber Wahnsinn — du kannst damit ganze Module abspielen, ohne dass die CPU etwas tun muss. Trackerszene lebt davon.",
        next: "rSound2",
      },
      rSound2: {
        id: "rSound2",
        speaker: "RUVEN",
        text: "MOD-Format. Vier Spuren, Samples eingebettet, Pattern oben drauf. Dateigröße so klein, dass du ein ganzes Lied auf eine Diskette kriegst, neben dem eigentlichen Spiel.",
        next: "r0",
      },
      rBye: {
        id: "rBye",
        speaker: "RUVEN",
        text: "Geh nur. Wir laufen ja nicht weg.",
        end: true,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────
  //  QUIZ — Detlef stellt fünf Fragen. 3 von 5 reichen.
  //  Layard sammelt seine Antworten in einem transienten Refscore
  //  via Inventar-Pseudo-Flags? Einfacher: pro Antwort entweder
  //  „dq_correctN" oder gar nichts. Wir zählen am Ende.
  // ─────────────────────────────────────────────────────────────
  e71Quiz: {
    id: "e71Quiz",
    start: "q_intro",
    onStart: (api) => {
      api.setFlag("e71QuizStarted");
      // Transient: vorherige Quiz-Antworten zurücksetzen, damit ein
      // neuer Versuch sauber startet.
      api.clearFlag("e71QuizQ1Right");
      api.clearFlag("e71QuizQ2Right");
      api.clearFlag("e71QuizQ3Right");
      api.clearFlag("e71QuizQ4Right");
      api.clearFlag("e71QuizQ5Right");
    },
    lines: {
      q_intro: {
        id: "q_intro",
        speaker: "DETLEF",
        text: "Okay, du willst dran. Faires Spiel: fünf Fragen aus dem, was wir hier reden. Drei richtig, du sitzt. Sonst nochmal zuhören.",
        choices: [{ text: "Leg los.", next: "q1" }],
      },
      // Q1 — Chipsatz
      q1: {
        id: "q1",
        speaker: "DETLEF",
        text: "Erste: Wie heißt der Original-Chipsatz im Amiga 500?",
        choices: [
          { text: "OCS — Original Chip Set.", action: (api) => api.setFlag("e71QuizQ1Right"), next: "q2" },
          { text: "EGA — Enhanced Graphics Adapter.", next: "q2" },
          { text: "VGA — Video Graphics Array.", next: "q2" },
        ],
      },
      // Q2 — Diskette
      q2: {
        id: "q2",
        speaker: "DETLEF",
        text: "Zweite: Wieviel speichert eine 3,5-Zoll-DD-Diskette, wenn der Amiga sie formatiert?",
        choices: [
          { text: "720 Kilobyte.", next: "q3" },
          { text: "880 Kilobyte.", action: (api) => api.setFlag("e71QuizQ2Right"), next: "q3" },
          { text: "1,44 Megabyte.", next: "q3" },
        ],
      },
      // Q3 — Modem
      q3: {
        id: "q3",
        speaker: "DETLEF",
        text: "Dritte: Mit welcher Baudrate läuft Ruvens Modem?",
        choices: [
          { text: "1200 Baud.", next: "q4" },
          { text: "2400 Baud.", action: (api) => api.setFlag("e71QuizQ3Right"), next: "q4" },
          { text: "9600 Baud.", next: "q4" },
        ],
      },
      // Q4 — Paula
      q4: {
        id: "q4",
        speaker: "DETLEF",
        text: "Vierte: Wieviele Tonkanäle hat der Paula-Chip?",
        choices: [
          { text: "Zwei.", next: "q5" },
          { text: "Vier.", action: (api) => api.setFlag("e71QuizQ4Right"), next: "q5" },
          { text: "Acht.", next: "q5" },
        ],
      },
      // Q5 — Demo-Szene
      q5: {
        id: "q5",
        speaker: "DETLEF",
        text: "Fünfte, leichte: Aus welchem Land kommt laut Sigi die stärkste Demo-Szene?",
        choices: [
          { text: "USA.", next: "q_eval" },
          { text: "Norwegen.", action: (api) => api.setFlag("e71QuizQ5Right"), next: "q_eval" },
          { text: "Japan.", next: "q_eval" },
        ],
      },
      q_eval: {
        id: "q_eval",
        speaker: "DETLEF",
        text: "Mal sehen.",
        choices: [
          {
            text: "(Antwort hören)",
            // Auswertung läuft über die Wahl-Aktion: zählt richtige Flags
            // und setzt e71QuizPassed bei ≥3. Die Folgenline verzweigt
            // dann über requires/hiddenWhen.
            action: (api) => {
              const score =
                (api.hasFlag("e71QuizQ1Right") ? 1 : 0) +
                (api.hasFlag("e71QuizQ2Right") ? 1 : 0) +
                (api.hasFlag("e71QuizQ3Right") ? 1 : 0) +
                (api.hasFlag("e71QuizQ4Right") ? 1 : 0) +
                (api.hasFlag("e71QuizQ5Right") ? 1 : 0);
              if (score >= 3) api.setFlag("e71QuizPassed");
            },
            next: "q_pass",
          },
        ],
      },
      q_pass: {
        id: "q_pass",
        speaker: "DETLEF",
        text: "Reicht. Setz dich. Linke Maustaste klickt, rechte Maustaste öffnet Menüs am oberen Bildschirmrand. Und Finger weg vom Diskettenfach.",
        requires: ["e71QuizPassed"],
        next: "q_fail",
        end: true,
      },
      q_fail: {
        id: "q_fail",
        speaker: "DETLEF",
        text: "Nicht ganz. Hör nochmal eine Runde zu, dann probier's wieder. Ist kein Drama.",
        end: true,
      },
    },
  },
};
