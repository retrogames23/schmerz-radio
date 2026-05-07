import type { DialogTree } from "../types";

export const helkaDialogs: Record<string, DialogTree> = {
  helkaAtDoor: {
    id: "helkaAtDoor",
    start: "h1",
    lines: {
      h1: {
        id: "h1",
        speaker: "SYSTEM",
        text: "[ Layard klopft an 2610. Die Tür öffnet sich nur einen Spalt. Eine Frau Mitte fünfzig, grau-meliertes Haar, randlose Brille, mustert ihn von oben. ]",
        next: "h2",
      },
      h2: {
        id: "h2",
        speaker: "HELKA",
        text: "Sie sind der Schreiber aus 2611. Worag. ›Räume, die zu lange leer stehen, werden zu Räumen, die niemand mehr betritt.‹ — Ihre Zeile, 1991, Morgenblatt, Seite 11.",
        next: "h3",
      },
      h3: {
        id: "h3",
        speaker: "LAYARD",
        text: "… das habe ich geschrieben?",
        subtext: "Er erinnert sich nicht. Nicht an den Satz, nicht an die Seite, nicht an 1991.",
        next: "h4",
      },
      h4: {
        id: "h4",
        speaker: "HELKA",
        text: "Sie haben es geschrieben. Ich habe es archiviert. Das ist mein Beruf gewesen. Bibliothekarin. Bevor sie die Bibliothek geschlossen haben.",
        next: "h5",
      },
      h5: {
        id: "h5",
        speaker: "LAYARD",
        text: "Es tut mir leid, dass ich störe. Ich gehe jetzt durch den Korridor — Nachbarschaft, sagt man wohl.",
        next: "h6",
      },
      h6: {
        id: "h6",
        speaker: "HELKA",
        text: "Nachbarschaft. Schönes Wort. Steht nicht mehr im Verzeichnis der Leitstelle. Kommen Sie wieder. Aber nicht oft.",
        subtext: "Sie schließt die Tür einen Spalt weiter.",
        end: true,
      },
    },
  },
  helkaSmalltalk: {
    id: "helkaSmalltalk",
    start: "hs1",
    lines: {
      hs1: {
        id: "hs1",
        speaker: "SYSTEM",
        text: "[ Helka steht wieder im Türspalt. Diesmal mit einer Tasse — der Inhalt klar, geruchlos. ]",
        next: "hs2",
      },
      hs2: {
        id: "hs2",
        speaker: "HELKA",
        text: "Ich sortiere heute ungelesene Mails der Leitstelle. Schicht acht Stunden. Eintausendzweihundert Stück, durchschnittlich. Niemand wird sie lesen. Ich auch nicht.",
        next: "hs3",
      },
      hs3: {
        id: "hs3",
        speaker: "LAYARD",
        text: "Bibliothekarin — was haben Sie da gemacht? Ich meine, abgesehen vom Sortieren.",
        next: "hs4",
      },
      hs4: {
        id: "hs4",
        speaker: "HELKA",
        text: "Wörter aufbewahren. Manche kommen nicht mehr vor in offiziellen Mitteilungen. ›Zärtlich.‹ ›Beliebig.‹ ›Sehnsucht.‹ — Wer das letzte Mal eines davon gehört? Der Sprecher merkt nicht einmal, dass es fehlt.",
        subtext: "Sie sagt das beiläufig, aber sie wartet darauf, ob er zuhört.",
        next: "hs5",
      },
      hs5: {
        id: "hs5",
        speaker: "LAYARD",
        text: "Sie führen eine Liste? Solcher Wörter?",
        next: "hs6",
      },
      hs6: {
        id: "hs6",
        speaker: "HELKA",
        text: "Privat. Auf meinem Rechner. Sie hat einen Namen, aber den behalte ich für mich. Wer mir lange genug zuhört, kommt vielleicht selbst drauf.",
        choices: [
          {
            text: "[ Pfefferminz anbieten ]",
            requires: ["tookPeppermintFromAutomat"],
            hiddenWhen: ["showedHelkaPeppermint"],
            next: "helkaMint1",
            action: (api) => {
              api.setFlag("showedHelkaPeppermint");
            },
          },
          {
            text: "[ Kondom rüberreichen ]",
            requires: ["tookCondomFromAutomat"],
            hiddenWhen: ["showedHelkaCondom"],
            next: "helkaCondom1",
            action: (api) => {
              api.setFlag("showedHelkaCondom");
            },
          },
          { text: "[ Beenden ]" },
        ],
      },
      helkaMint1: {
        id: "helkaMint1",
        speaker: "LAYARD",
        text: "Möchten Sie? Aus dem Automaten im stillen Funk. Verstaubt, aber Pfefferminz hält ewig.",
        next: "helkaMint2",
      },
      helkaMint2: {
        id: "helkaMint2",
        speaker: "HELKA",
        text: "Pfefferminz. Auch so ein Wort, das selten geworden ist. Behalten Sie's, Herr Worag. Mein Tee verträgt sich nicht mit Drogen aus Volkseigenem Betrieb.",
        end: true,
      },
      helkaCondom1: {
        id: "helkaCondom1",
        speaker: "LAYARD",
        text: "Frau Vint — ein kleines Gastgeschenk. Bitte nicht einsortieren.",
        next: "helkaCondom2",
      },
      helkaCondom2: {
        id: "helkaCondom2",
        speaker: "HELKA",
        text: "Sie sind unverschämt, Herr Worag. Steckt's wieder ein. — Aber merken Sie sich: 1979, vor der Schließung, lief in der Bibliothek mal ein Aushang. ›Hygiene ist Bürgersinn.‹ Es hat niemand verstanden, was sie meinten.",
        end: true,
      },
    },
  },
  helkaSmalltalk2: {
    id: "helkaSmalltalk2",
    start: "hs21",
    lines: {
      hs21: {
        id: "hs21",
        speaker: "HELKA",
        text: "Sie sind hartnäckig, Herr Worag. Das ist neu in diesem Korridor.",
        next: "hs22",
      },
      hs22: {
        id: "hs22",
        speaker: "HELKA",
        text: "1989 habe ich einmal einen Bewohner gemeldet. Er hat die Frequenz manipuliert. Mit einem Lötkolben und einer Theorie. Es ist nichts passiert. Mit ihm nicht. Mit der Meldung nicht. Mit mir auch nicht — und das hat mir am meisten zu denken gegeben.",
        next: "hs23",
      },
      hs23: {
        id: "hs23",
        speaker: "LAYARD",
        text: "Was ist mit ihm geschehen?",
        next: "hs24",
      },
      hs24: {
        id: "hs24",
        speaker: "HELKA",
        text: "Er wohnt noch hier. Drei Türen weiter. Er weiß es nicht. Ich weiß es. Sie wissen es jetzt auch.",
        choices: [
          {
            text: "Welche Frequenz hat er manipuliert? Nicht 104,6 — eine andere?",
            next: "helkaHiddenFreq1",
          },
          { text: "[ Beenden ]" },
        ],
      },
      // Hinweis 2/3 für die Hidden Frequency 102,7 — Helka nennt die Stelle.
      helkaHiddenFreq1: {
        id: "helkaHiddenFreq1",
        speaker: "HELKA",
        text: "Eine andere, ja. Sein Trick war einfach: er ist von der ersten Stelle des Trauer-Bandes — 103,4 — sieben Stufen nach unten gegangen, je ein Zehntel. Da, sagte er, sitzen die Wartungsleute. Da hört einen niemand zufällig.",
        next: "helkaHiddenFreq2",
      },
      helkaHiddenFreq2: {
        id: "helkaHiddenFreq2",
        speaker: "HELKA",
        text: "Ich habe nie geprüft, ob es stimmt. Ich habe es nur aufgeschrieben. Wenn Sie es heute prüfen wollen — von mir aus. Sagen Sie nicht, dass Sie es von mir wissen.",
        choices: [
          {
            text: "[ Verstanden. ]",
            action: (api) => {
              api.setFlag("helkaHintHiddenFreqStep");
            },
          },
        ],
      },
    },
  },
  helkaFlyer: {
    id: "helkaFlyer",
    start: "hf1",
    onEnd: (api) => {
      api.setFlag("helkaWarned");
    },
    lines: {
      hf1: {
        id: "hf1",
        speaker: "LAYARD",
        text: "Darf ich Ihnen etwas zeigen?",
        next: "hf2",
      },
      hf2: {
        id: "hf2",
        speaker: "SYSTEM",
        text: "[ Layard reicht das gefaltete Flugblatt durch den Türspalt. Helka liest es. Einmal. Faltet es zusammen. Liest es noch einmal. ]",
        next: "hf3",
      },
      hf3: {
        id: "hf3",
        speaker: "HELKA",
        text: "Z.K.S. Das hat schon mal jemand versucht. 1989. Wortgleich, fast. Nehmen Sie es wieder mit, Herr Worag.",
        next: "hf4",
      },
      hf4: {
        id: "hf4",
        speaker: "HELKA",
        text: "Und werfen Sie es nicht in meinen Briefschlitz. Ich sortiere alles, was reinkommt. Auch das, was ich nicht sortieren möchte.",
        next: "hf5",
      },
      hf5: {
        id: "hf5",
        speaker: "LAYARD",
        text: "Sie haben Angst.",
        next: "hf6",
      },
      hf6: {
        id: "hf6",
        speaker: "HELKA",
        text: "Ich habe Ordnung. Das ist nicht dasselbe. Aber heute, zum ersten Mal seit Jahren: vielleicht ist es das doch.",
        end: true,
      },
    },
  },
};
