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
        end: true,
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
        text: "1989 habe ich einmal einen Bewohner gemeldet. Er hatte sich etwas zusammengelötet, ein Kabel lief bei ihm aus dem Fenster in den Lichtschacht. Ich habe bis heute nicht verstanden, wozu. Es ist nichts passiert. Mit ihm nicht. Mit der Meldung nicht. Mit mir auch nicht — und das hat mir am meisten zu denken gegeben.",
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
            text: "Kowalk sagt, Sie haben Brust mal im Phrasen-Duell stehen lassen. Womit?",
            requires: ["kowalkHintedBodoHelka"],
            hiddenWhen: ["learnedAttackTuerschild"],
            next: "helkaTeachAttack1",
          },
          { text: "[ Beenden ]" },
        ],
      },
      helkaTeachAttack1: {
        id: "helkaTeachAttack1",
        speaker: "HELKA",
        text: "Brust. Vor einem halben Jahr. Er wollte mir eine Sortier-Schicht verweigern: »Dafür bin ich nicht zuständig.«",
        next: "helkaTeachAttack2",
      },
      helkaTeachAttack2: {
        id: "helkaTeachAttack2",
        speaker: "HELKA",
        text: "Ich habe ihn nur angeschaut und gesagt: »Erstaunlich. Ihr eigenes Türschild sagt das genaue Gegenteil von dem, was Sie gerade behaupten.« — Er hat aufgehört zu atmen. Für eine Sekunde.",
        subtext: "Sie lächelt nicht. Aber etwas an ihrem Mund tut es für sie.",
        next: "helkaTeachAttack3",
      },
      helkaTeachAttack3: {
        id: "helkaTeachAttack3",
        speaker: "HELKA",
        text: "Sein Türschild liest er nie. Die meisten lesen ihr eigenes nicht. — Schreiben Sie sich den Satz auf, Herr Worag. Er funktioniert auch bei Vossbeck.",
        choices: [
          {
            text: "[ »Ihr Türschild sagt anderes« ins Phrasenbuch übernehmen ]",
            action: (api) => api.setFlag("learnedAttackTuerschild"),
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
        text: "Z.K.S. Das hat schon mal jemand versucht. 1989. Wortgleich, fast. Nehmen Sie es wieder mit, Herr Worag. Und werfen Sie es nicht in meinen Briefschlitz. Ich sortiere alles, was reinkommt. Auch das, was ich nicht sortieren möchte.",
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

  // ── Kaputtes Telefon: Bitte um Helkas Apparat ─────────────────────
  helkaPhoneRefusal: {
    id: "helkaPhoneRefusal",
    start: "hp1",
    lines: {
      hp1: {
        id: "hp1",
        speaker: "LAYARD",
        text: "Frau Vint — mein Telefon ist tot. Darf ich einmal Ihres benutzen?",
        next: "hp2",
      },
      hp2: {
        id: "hp2",
        speaker: "HELKA",
        text: "Nein.",
        subtext: "Kein Zögern. Die Tür bleibt auf dem gleichen Spalt.",
        next: "hp3",
      },
      hp3: {
        id: "hp3",
        speaker: "LAYARD",
        text: "Darf ich fragen, warum?",
        next: "hp4",
      },
      hp4: {
        id: "hp4",
        speaker: "HELKA",
        text: "Weil hier keins ist. Der Apparat hängt noch an der Wand, aber die Leitung ist seit — ich sage mal: seit es ruhiger geworden ist. Ich habe es nie gemeldet.",
        next: "hp5",
      },
      hp5: {
        id: "hp5",
        speaker: "LAYARD",
        text: "Sie haben ein totes Telefon und melden es nicht?",
        next: "hp6",
      },
      hp6: {
        id: "hp6",
        speaker: "HELKA",
        text: "Ein totes Telefon klingelt nicht. Ein Telefon, das nicht klingelt, bringt niemanden an meine Tür. Rechnen Sie selbst.",
        next: "hp7",
      },
      hp7: {
        id: "hp7",
        speaker: "HELKA",
        text: "Wenn Sie reden wollen, reden Sie hier. Wenn Sie wählen wollen, lassen Sie Ihres richten. Korridor 46 hat eine Wartung. Tür 4601, die Junge. Die kommt wenigstens noch, wenn man klopft.",
        choices: [
          {
            text: "[ Notiert: 4601, Korridor 46 ]",
          },
        ],
      },
    },
  },
  helkaPhoneRefusalShort: {
    id: "helkaPhoneRefusalShort",
    start: "hps1",
    lines: {
      hps1: {
        id: "hps1",
        speaker: "LAYARD",
        text: "Und wirklich kein Telefon?",
        next: "hps2",
      },
      hps2: {
        id: "hps2",
        speaker: "HELKA",
        text: "Wirklich keins. 4601, Worag. Gute Nacht.",
        end: true,
      },
    },
  },

  // ── Heidegger: das lange Türspalt-Gespräch ────────────────────────
  helkaHeidegger: {
    id: "helkaHeidegger",
    start: "hh1",
    lines: {
      hh1: {
        id: "hh1",
        speaker: "SYSTEM",
        text: "[ Der Türspalt öffnet sich wie immer: handbreit. Auf dem Flurtischchen hinter ihr liegt ein Buch, dunkler Leinenrücken, kein Schutzumschlag. Der Titel ist zur Wand gedreht. ]",
        hiddenWhen: ["helkaHeideggerStarted"],
        next: "hh2",
      },
      hh2: {
        id: "hh2",
        speaker: "LAYARD",
        text: "Was lesen Sie da, Frau Vint? Der Rücken ist zur Wand gedreht.",
        hiddenWhen: ["helkaHeideggerStarted"],
        next: "hh3",
      },
      hh3: {
        id: "hh3",
        speaker: "HELKA",
        text: "Das ist Gewohnheit, kein Geheimnis. Ein Buch, das ich nicht ausgesondert habe, als ich alles andere aussondere. Heidegger. »Sein und Zeit«.",
        hiddenWhen: ["helkaHeideggerStarted"],
        next: "hh4",
      },
      hh4: {
        id: "hh4",
        speaker: "LAYARD",
        text: "Und das darf man behalten?",
        hiddenWhen: ["helkaHeideggerStarted"],
        next: "hh5",
      },
      hh5: {
        id: "hh5",
        speaker: "HELKA",
        text: "Man darf vieles. Man tut es nur nicht. — Sie stehen im Zug, Herr Worag. Fragen Sie, oder gehen Sie.",
        subtext: "Sie sagt es scharf, aber sie schließt die Tür nicht.",
        hiddenWhen: ["helkaHeideggerStarted"],
        next: "hub",
      },
      hub: {
        id: "hub",
        speaker: "HELKA",
        text: "Also. Woran hängen Sie?",
        choices: [
          {
            text: "Warum sagt er nicht einfach »Mensch«? Was ist ein »Dasein«?",
            hiddenWhen: ["helkaToldDasein"],
            next: "da1",
            action: (api) => {
              api.setFlag("helkaHeideggerStarted");
              api.setFlag("helkaToldDasein");
            },
          },
          {
            text: "Sie haben vorhin »geworfen« gesagt. Wie meinen Sie das?",
            hiddenWhen: ["helkaToldGeworfenheit"],
            next: "gw1",
            action: (api) => {
              api.setFlag("helkaHeideggerStarted");
              api.setFlag("helkaToldGeworfenheit");
            },
          },
          {
            text: "Sie betonen dieses »man« immer so eigenartig.",
            hiddenWhen: ["helkaToldMan"],
            next: "ma1",
            action: (api) => {
              api.setFlag("helkaHeideggerStarted");
              api.setFlag("helkaToldMan");
            },
          },
          {
            text: "Und was reißt einen da wieder heraus?",
            requires: ["helkaToldDasein", "helkaToldGeworfenheit", "helkaToldMan"],
            hiddenWhen: ["helkaToldTod"],
            next: "td1",
            action: (api) => {
              api.setFlag("helkaToldTod");
            },
          },
          {
            text: "Tut mir leid, ich blicke immer noch nicht ganz durch. Können Sie Heidegger noch mal in einem Satz zusammenfassen?",
            next: "sum1",
            action: (api) => {
              api.setFlag("helkaHeideggerStarted");
            },
          },
          {
            text: "Ehrlich gesagt: Das ist Gerede über Gerede.",
            next: "sk1",
            action: (api) => {
              api.setFlag("helkaHeideggerStarted");
            },
          },
          {
            text: "[ Beenden ]",
          },
        ],
      },

      // — Zusammenfassung —
      sum1: {
        id: "sum1",
        speaker: "HELKA",
        text: "Heideggers berüchtigt unlesbares Hauptwerk »Sein und Zeit« lässt sich eigentlich in einem einzigen Satz zusammenfassen: Erst wer akzeptiert, dass er sterben wird, fängt an, wirklich zu leben.",
        next: "sum2",
      },
      sum2: {
        id: "sum2",
        speaker: "HELKA",
        text: "Alles andere, was er sagt, ist nur die Begründung dafür. Dasein, Geworfenheit, das Man — alles Helfer, damit wir nicht vorher weglaufen.",
        next: "hub",
      },

      // — Dasein —
      da1: {
        id: "da1",
        speaker: "HELKA",
        text: "Weil »Mensch« zu voll ist. Da hängt alles dran: Rasse, Beruf, Meldeklasse. Er will das Wort leer haben. Also nimmt er das nüchternste, das die Sprache hergibt: Dasein. Etwas, das da ist — und das weiß.",
        next: "da2",
      },
      da2: {
        id: "da2",
        speaker: "HELKA",
        text: "Ein Stein ist auch da. Ein Stuhl ist da. Aber der Stuhl muss sich nicht überlegen, ob er ein guter Stuhl ist. Er steht einfach. Das ist bequem.",
        next: "da3",
      },
      da3: {
        id: "da3",
        speaker: "LAYARD",
        text: "Und ich muss mich überlegen.",
        next: "da4",
      },
      da4: {
        id: "da4",
        speaker: "HELKA",
        text: "Sie müssen sich zu sich verhalten, während Sie laufen. Ohne Pause. Kein Stein hat diese Aufgabe je bekommen. Das ist keine Auszeichnung, Herr Worag, das ist Arbeit.",
        next: "da5",
      },
      da5: {
        id: "da5",
        speaker: "HELKA",
        text: "Sehen Sie in den Korridor. Zweiundzwanzig Türen. In den Listen der Leitstelle sind das zweiundzwanzig Nummern. Eine Nummer ist vorhanden wie ein Stuhl. Ein Dasein ist nicht vorhanden — es existiert. Das Formular kennt diesen Unterschied nicht.",
        subtext: "Sie tippt einmal gegen den Türrahmen. Wie ein Punkt am Satzende.",
        next: "hub",
      },

      // — Geworfenheit —
      gw1: {
        id: "gw1",
        speaker: "HELKA",
        text: "Geworfenheit. Sein Wort, nicht meins. Es heißt: Sie haben nichts davon ausgesucht. Nicht das Jahr, nicht die Stadt, nicht die Eltern, nicht die Sprache, in der Sie gerade denken.",
        next: "gw2",
      },
      gw2: {
        id: "gw2",
        speaker: "HELKA",
        text: "Sie kommen an, und die Welt ist fertig. Möbliert. Die Regeln stehen schon, die Wörter stehen schon, die Zuständigkeiten stehen schon. Gefragt hat Sie niemand, weil es Sie noch nicht gab.",
        next: "gw3",
      },
      gw3: {
        id: "gw3",
        speaker: "LAYARD",
        text: "Das klingt wie eine Entschuldigung. Für alles.",
        next: "gw4",
      },
      gw4: {
        id: "gw4",
        speaker: "HELKA",
        text: "Nein. Es ist der Ausgangspunkt, nicht das Urteil. Ich bin im Alten Stadtkern geworfen worden, in eine Buchhalterwohnung mit zwei Zimmern. Mit sechzehn hat mich jemand zur Verwaltungslehre angemeldet. Ich habe nicht widersprochen.",
        next: "gw5",
      },
      gw5: {
        id: "gw5",
        speaker: "HELKA",
        text: "Einundvierzig Jahre. Danach das Archiv. Ich habe das Aktensystem mit aufgebaut, das heute alle sortiert. Geworfen war ich nur am Anfang. Alles danach habe ich getan.",
        subtext: "Das ist das erste Mal, dass sie etwas zugibt.",
        next: "gw6",
      },
      gw6: {
        id: "gw6",
        speaker: "HELKA",
        text: "Deshalb halte ich nichts davon, sich hinter dem Anfang zu verstecken. Man wird geworfen, ja. Aber irgendwann landet man, und dann geht man selbst.",
        next: "hub",
      },

      // — Das Man —
      ma1: {
        id: "ma1",
        speaker: "HELKA",
        text: "Weil es kein gewöhnliches Wort ist, sondern eine Person. Heidegger schreibt es groß: das Man. Der Niemand, der alles entscheidet.",
        next: "ma2",
      },
      ma2: {
        id: "ma2",
        speaker: "HELKA",
        text: "Man nimmt die Stelle, die man nimmt. Man denkt, was man hier denkt. Man fragt nicht, was man nicht fragt. Fragen Sie einmal nach, wer dieses »man« ist. Es meldet sich keiner.",
        next: "ma3",
      },
      ma3: {
        id: "ma3",
        speaker: "HELKA",
        text: "Das ist der Handel: Das Man nimmt Ihnen die Entscheidung ab, und Sie zahlen mit Ihrem Leben. Sie leben es dann, aber Sie haben es nicht gewählt. Er nennt das uneigentlich. Ein häßliches Wort für etwas sehr Gemütliches.",
        choices: [
          {
            text: "Sie beschreiben unsere Dienstsprache.",
            next: "ma4",
          },
          {
            text: "Manchmal ist es einfach vernünftig, mitzulaufen.",
            next: "ma6",
          },
        ],
      },
      ma4: {
        id: "ma4",
        speaker: "HELKA",
        text: "Ich beschreibe eine Grammatik. Sehen Sie sich eine Mitteilung der Leitstelle an. »Es wird veranlasst.« »Wird geprüft.« »Ist nicht vorgesehen.« Kein Satz hat einen Täter.",
        next: "ma5",
      },
      ma5: {
        id: "ma5",
        speaker: "HELKA",
        text: "Vierzig Jahre habe ich solche Sätze geschrieben. Nicht einer davon war gelogen. Und keiner war von mir. Das Man schreibt sauber, Herr Worag — es unterschreibt nur nicht.",
        next: "hub",
      },
      ma6: {
        id: "ma6",
        speaker: "HELKA",
        text: "Natürlich. Ich stehe im Türspalt und rede über Eigentlichkeit — halten Sie mich für die falsche Frau, das ist Ihr gutes Recht.",
        next: "ma7",
      },
      ma7: {
        id: "ma7",
        speaker: "HELKA",
        text: "Er verbietet das Mitlaufen auch nicht. Er sagt nur: merken Sie es. Wer mitläuft und es weiß, geht anders als wer mitläuft und glaubt, er wähle.",
        next: "hub",
      },

      // — Sein zum Tode —
      td1: {
        id: "td1",
        speaker: "HELKA",
        text: "Ausgerechnet das Unangenehmste. Er nennt es Sein zum Tode. Nicht Sterben, nicht Trauer. Die nüchterne Kenntnisnahme, dass Sie aufhören.",
        next: "td2",
      },
      td2: {
        id: "td2",
        speaker: "HELKA",
        text: "Alles andere können Sie delegieren. Ihre Schicht, Ihre Meldung, Ihre Meinung. Dafür gibt es Zuständige. Für das hier gibt es keinen. Kein Mensch kann Ihnen Ihren Tod abnehmen.",
        next: "td3",
      },
      td3: {
        id: "td3",
        speaker: "HELKA",
        text: "Und in dem Moment, in dem Ihnen das ehrlich klar wird, geht das Man weg. Es hat dazu nichts zu sagen. Es ist zum ersten Mal still. Dann, sagt er, könnte ein eigenes Leben anfangen.",
        choices: [
          {
            text: "Sie sagen das, als hätten Sie es geprüft.",
            next: "td4",
          },
          {
            text: "Ein bisschen spät, wenn man erst dann anfängt.",
            next: "td4",
          },
        ],
      },
      td4: {
        id: "td4",
        speaker: "HELKA",
        text: "Karsten ist 1991 gestorben. Eine Lungensache. Sie steht in keiner Akte, weil die Ursache nicht vorgesehen war.",
        subtext: "Ihre Stimme wird nicht leiser. Nur langsamer.",
        next: "td5",
      },
      td5: {
        id: "td5",
        speaker: "HELKA",
        text: "Dreißig Jahre verlobt. Geheiratet haben wir nie, seine Familie war dagegen, und wir haben getan, was man tut. Wir haben gewartet. Auf einen besseren Zeitpunkt. Den gibt das Man nicht heraus.",
        next: "td6",
      },
      td6: {
        id: "td6",
        speaker: "LAYARD",
        text: "Es tut mir leid.",
        next: "td7",
      },
      td7: {
        id: "td7",
        speaker: "HELKA",
        text: "Danke. Es ist nicht nötig. — Seitdem öffne ich die Tür nicht mehr ganz. Das ist keine Angst, Herr Worag. Das ist die einzige Entscheidung, die ich selbst getroffen habe.",
        next: "td8",
      },
      td8: {
        id: "td8",
        speaker: "HELKA",
        text: "Sie schreiben doch. Oder Sie haben geschrieben. Überlegen Sie einmal, welcher Ihrer Sätze von Ihnen war — und welcher von dem, was man schreibt.",
        choices: [
          {
            text: "[ Das sitzt. ]",
            next: "end1",
            action: (api) => {
              api.setFlag("helkaHeideggerDone");
            },
          },
        ],
      },
      end1: {
        id: "end1",
        speaker: "HELKA",
        text: "Genug für heute. Ich habe seit 1991 nicht so viel geredet, und damals ging es um Sie. — Kommen Sie wieder. Aber nicht oft.",
        subtext: "Der Spalt wird schmaler. Das Buch bleibt liegen, Rücken zur Wand.",
        end: true,
      },

      // — Skepsis —
      sk1: {
        id: "sk1",
        speaker: "HELKA",
        text: "Selbstverständlich ist es das. Philosophie ist Gerede über Gerede, so wie Verwaltung Papier über Papier ist. Der Unterschied: Ihr Papier weist Wohnungen zu.",
        next: "sk2",
      },
      sk2: {
        id: "sk2",
        speaker: "HELKA",
        text: "Ich verlange nicht, dass Sie es glauben. Ich habe es zweiundvierzig Jahre lang nicht geglaubt und trotzdem behalten. Fragen Sie weiter oder gehen Sie schlafen, beides ist in Ordnung.",
        next: "hub",
      },
    },
  },

  helkaHeideggerShort: {
    id: "helkaHeideggerShort",
    start: "hhs1",
    lines: {
      hhs1: {
        id: "hhs1",
        speaker: "LAYARD",
        text: "Frau Vint — hätten Sie noch einen Moment?",
        next: "hhs2",
      },
      hhs2: {
        id: "hhs2",
        speaker: "HELKA",
        text: "Wir haben das besprochen, Herr Worag. Dasein, geworfen, das Man, das Ende. Mehr steht auch bei ihm nicht, es steht nur länger da.",
        next: "hhs3",
      },
      hhs3: {
        id: "hhs3",
        speaker: "HELKA",
        text: "Denken Sie es zu Ende, wenn Sie allein sind. Dafür braucht man keine Nachbarin im Türspalt.",
        end: true,
      },
    },
  },
};
