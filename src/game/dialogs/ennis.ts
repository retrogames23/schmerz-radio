import type { DialogTree } from "../types";

export const ennisDialogs: Record<string, DialogTree> = {
  ennisAtDoor: {
    id: "ennisAtDoor",
    start: "e1",
    lines: {
      e1: {
        id: "e1",
        speaker: "SYSTEM",
        text: "[ Die Tür 2614 fliegt komplett auf. Ein Mann Anfang dreißig, Schichtarbeiter-Jacke, blockiert den Rahmen mit dem Körper. ]",
        next: "e2",
      },
      e2: {
        id: "e2",
        speaker: "ENNIS",
        text: "Was wollen Sie? Was machen Sie um diese Zeit im Korridor und nicht auf Schicht?",
        next: "e3",
      },
      e3: {
        id: "e3",
        speaker: "LAYARD",
        text: "Ich habe heute Urlaub. Layard Worag, 2611.",
        next: "e4",
      },
      e4: {
        id: "e4",
        speaker: "ENNIS",
        text: "Urlaub. Schön. — Ich hab Nachtschicht in der Logistik. Sektor-Frachten. Ohne mich kommt Ihre B2 nicht in den Schacht. Behalten Sie das im Kopf.",
        next: "e5",
      },
      e5: {
        id: "e5",
        speaker: "LAYARD",
        text: "Verstanden. Insa hat mich heute schon dreimal —",
        next: "e6",
      },
      e6: {
        id: "e6",
        speaker: "SYSTEM",
        text: "[ Ennis erstarrt für eine Sekunde, als hätte jemand einen Schalter gedrückt. ]",
        next: "e7",
      },
      e7: {
        id: "e7",
        speaker: "ENNIS",
        text: "Den Namen sagen Sie hier nicht. Nicht in meiner Tür. Schönen Urlaub, Worag.",
        next: "e8",
      },
      e8: {
        id: "e8",
        speaker: "SYSTEM",
        text: "[ Die Tür schlägt zu. Drinnen: das Geräusch eines Stuhls, der sehr vorsichtig zurückgeschoben wird. ]",
        end: true,
      },
    },
  },
  ennisSmalltalk: {
    id: "ennisSmalltalk",
    start: "es1",
    lines: {
      es1: {
        id: "es1",
        speaker: "SYSTEM",
        text: "[ Diesmal öffnet Ennis nur einen Spalt. Die Schichtarbeiterjacke sitzt nicht mehr — er war wohl gerade aufgewacht. ]",
        next: "es2",
      },
      es2: {
        id: "es2",
        speaker: "ENNIS",
        text: "Sie sind wieder da. Was wollen Sie diesmal von mir, Worag.",
        next: "es3",
      },
      es3: {
        id: "es3",
        speaker: "LAYARD",
        text: "Nichts. Nachsehen, ob Sie noch wütend sind.",
        next: "es4",
      },
      es4: {
        id: "es4",
        speaker: "ENNIS",
        text: "Wütend ist Bürgersache. Ich bin auf Linie. — Wenn Sie Smalltalk wollen, gehen Sie zu Marschke, die Katze hört zu. Hier hört nur die Lüftung zu, und die zählt nicht.",
        subtext: "Er meint den Satz nicht so, wie er ihn sagt. Beides gleichzeitig.",
        choices: [
          {
            text: "[ Pfefferminz hinhalten ]",
            requires: ["tookPeppermintFromAutomat"],
            hiddenWhen: ["showedEnnisPeppermint"],
            next: "ennisMint",
            action: (api) => api.setFlag("showedEnnisPeppermint"),
          },
          {
            text: "[ Kondom hinhalten ]",
            requires: ["tookCondomFromAutomat"],
            hiddenWhen: ["showedEnnisCondom"],
            next: "ennisCondom",
            action: (api) => api.setFlag("showedEnnisCondom"),
          },
          { text: "[ Beenden ]" },
        ],
      },
      ennisMint: {
        id: "ennisMint",
        speaker: "ENNIS",
        text: "Pfefferminz. — Aus dem Automaten? Stecken Sie weg, Worag. Wer in der Logistik nach Pfefferminz riecht, hat was zu verbergen. Bier ist Linie. Pfefferminz ist Verdacht.",
        end: true,
      },
      ennisCondom: {
        id: "ennisCondom",
        speaker: "ENNIS",
        text: "Sehr witzig, Worag. Ich hab eine Frau und drei Schichten. Wann soll ich? — Stecken Sie das Ding ein, bevor jemand im Korridor das Falsche denkt.",
        end: true,
      },
    },
  },
  ennisFlyer: {
    id: "ennisFlyer",
    start: "ef1",
    onEnd: (api) => {
      api.setFlag("ennisCracked");
    },
    lines: {
      ef1: {
        id: "ef1",
        speaker: "LAYARD",
        text: "Darf ich Ihnen etwas zeigen?",
        next: "ef2",
      },
      ef2: {
        id: "ef2",
        speaker: "SYSTEM",
        text: "[ Ennis sieht das Flugblatt. Sein Gesicht zieht sich zu — Wut, Angst, beides verschachtelt. Er reißt es Layard nicht aus der Hand, aber er beugt sich vor, als wollte er es. ]",
        next: "ef3",
      },
      ef3: {
        id: "ef3",
        speaker: "ENNIS",
        text: "Das ist Hochverrat, Worag. Wissen Sie, was passiert mit Leuten, die so was im Korridor tragen? Wissen Sie, was passiert mit ihren Familien?",
        next: "ef4",
      },
      ef4: {
        id: "ef4",
        speaker: "LAYARD",
        text: "… ich glaube, Sie wissen es besser als ich.",
        next: "ef5",
      },
      ef5: {
        id: "ef5",
        speaker: "SYSTEM",
        text: "[ Ennis sackt einen halben Schritt zurück. Die Tür schwingt einen Spalt weiter auf, ohne dass er es merkt. ]",
        next: "ef6",
      },
      ef6: {
        id: "ef6",
        speaker: "ENNIS",
        text: "Mein Vater hatte so ein Blatt. Vor sechs Jahren. Sie haben ihn nach E81 versetzt. Aus E81 kommt niemand zurück. — Ich weiß nicht, warum ich Ihnen das gerade sage.",
        next: "ef7",
      },
      ef7: {
        id: "ef7",
        speaker: "LAYARD",
        text: "Ihr Vater. Wie hat er geheißen?",
        next: "ef8",
      },
      ef8: {
        id: "ef8",
        speaker: "ENNIS",
        text: "Vater. Das hat er geheißen. Ich brauche keinen anderen Namen. — Gehen Sie. Bitte. Wenn jemand fragt: Sie waren nie hier.",
        next: "ef9",
      },
      ef9: {
        id: "ef9",
        speaker: "SYSTEM",
        text: "[ Im Hinterkopf hört Layard das Wort noch nach. Ein Wort, drei Buchstaben mehr — laut, nüchtern, ohne Schmuck. Er wird es nicht vergessen. ]",
        end: true,
      },
    },
  },
  ennisAfterFlyer: {
    id: "ennisAfterFlyer",
    start: "ea1",
    lines: {
      ea1: {
        id: "ea1",
        speaker: "SYSTEM",
        text: "[ Ennis öffnet diesmal sofort, schaut links und rechts in den Korridor, zieht Layard fast hinein. ]",
        next: "ea2",
      },
      ea2: {
        id: "ea2",
        speaker: "ENNIS",
        text: "Wenn Sie noch mal an meinem Rechner sind — Passwort steht in einem Wort, das ich heute zum ersten Mal seit Jahren laut gesagt habe. Sie waren dabei. Mehr sage ich nicht.",
        next: "ea3",
      },
      ea3: {
        id: "ea3",
        speaker: "ENNIS",
        text: "Und wenn Sie irgendwann nach E81 kommen — und das wünsche ich Ihnen nicht — fragen Sie nach Korr. Vorname egal. Es gibt nur einen.",
        end: true,
      },
    },
  },

  // ── Kaputtes Telefon: Bitte um Ennis' Anschluss ───────────────────
  ennisPhoneRefusal: {
    id: "ennisPhoneRefusal",
    start: "ep1",
    lines: {
      ep1: {
        id: "ep1",
        speaker: "LAYARD",
        text: "Kalb — mein Telefon ist ausgefallen. Ein einziger Anruf über Ihren Anschluss, dann bin ich weg.",
        next: "ep2",
      },
      ep2: {
        id: "ep2",
        speaker: "SYSTEM",
        text: "[ Die Tür 2614 öffnet sich genau so weit, dass ein Auge und eine Schulter hineinpassen. ]",
        next: "ep3",
      },
      ep3: {
        id: "ep3",
        speaker: "ENNIS",
        text: "Über meinen Anschluss. Sie hören sich selbst zu, oder? — Ein Anschluss ist einem Bürger zugeordnet. Der Bürger bin ich. Wenn Sie darüber wählen, wähle auf dem Papier ich.",
        next: "ep4",
      },
      ep4: {
        id: "ep4",
        speaker: "LAYARD",
        text: "Und wenn ich sage, dass ich es war?",
        next: "ep5",
      },
      ep5: {
        id: "ep5",
        speaker: "ENNIS",
        text: "Dann sagen Sie das. Der Streifen sagt was anderes. Und der Streifen hat noch nie Urlaub gehabt.",
        subtext: "Er tippt zweimal gegen den Türrahmen. Wie ein Mensch, der eine Regel klopft, an die er sich klammert.",
        next: "ep6",
      },
      ep6: {
        id: "ep6",
        speaker: "ENNIS",
        text: "Außerdem: Schichtruhe. Ich habe Nacht. Wer bei mir telefoniert, weckt mich, und wer mich weckt, kostet die Logistik eine Stunde. Nein, Worag.",
        next: "ep7",
      },
      ep7: {
        id: "ep7",
        speaker: "ENNIS",
        text: "Melden Sie es dort, wo es hingehört. Es gibt für alles eine Zuständigkeit. Das ist kein Ärgernis, das ist der einzige Grund, warum hier nichts zusammenbricht.",
        choices: [
          {
            text: "[ Verstanden ]",
          },
        ],
      },
    },
  },
  ennisPhoneRefusalShort: {
    id: "ennisPhoneRefusalShort",
    start: "eps1",
    lines: {
      eps1: {
        id: "eps1",
        speaker: "LAYARD",
        text: "Nur ein Anruf, Kalb.",
        next: "eps2",
      },
      eps2: {
        id: "eps2",
        speaker: "ENNIS",
        text: "Nur ein Nein, Worag. Zuständigkeit ist keine Laune.",
        end: true,
      },
    },
  },
};
