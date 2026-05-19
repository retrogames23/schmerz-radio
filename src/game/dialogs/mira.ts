import type { DialogTree } from "../types";

export const miraDialogs: Record<string, DialogTree> = {
  miraIntro: {
    id: "miraIntro",
    npcId: "mira",
    start: "mi1",
    lines: {
      mi1: {
        id: "mi1",
        speaker: "SYSTEM",
        text: "[ An der Wand lehnt eine junge Frau. Sechzehn, vielleicht siebzehn. Kein Schmerz-Radio in der Tasche, kein Bernstein-Knopf im Ohr. Sie sieht Layard direkt an. ]",
        next: "mi2",
      },
      mi2: {
        id: "mi2",
        speaker: "MIRA",
        text: "Hey. Du bist nicht von dieser Etage. Aber du suchst auch nichts Bestimmtes, oder? Du läufst nur. Das machen die meisten, bevor sie wissen, wovor.",
        subtext: "Sie sagt das ohne Vorwurf. Eher wie eine Diagnose.",
        hiddenWhen: ["sawEmptyOffice"],
        next: "mi2b",
      },
      mi2b: {
        id: "mi2b",
        speaker: "MIRA",
        text: "Hey. Du bist nicht von dieser Etage. Und du läufst, als hättest du ein Ziel. Wen suchst du?",
        subtext: "Sie sagt das ohne Vorwurf. Eher wie eine Diagnose.",
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
        text: "Andere Etagen ansehen. — Weißt du, wie selten das jemand macht? Die meisten bleiben in ihrem Quadranten, bis sie transferiert werden. Du nicht.",
        subtext: "Sie hat das schon oft gesagt. Sie wartet darauf, wie er reagiert.",
        hiddenWhen: ["sawEmptyOffice"],
        next: "mi4b",
        choices: [
          { text: "Was meinst du damit genau?", next: "miraOpen1" },
          {
            text: "Pass auf, was du sagst. Hier hört jemand zu.",
            next: "miraClosed1",
            action: (api) => api.setFlag("miraSystemic"),
          },
          { text: "Keine Zeit für sowas." },
        ],
      },
      mi4b: {
        id: "mi4b",
        speaker: "MIRA",
        text: "Den gibt es heute nicht. Den gibt es eigentlich nie. Das System tut nur so, als ob.",
        subtext: "Sie hat das schon oft gesagt. Sie wartet darauf, wie er reagiert.",
        requires: ["sawEmptyOffice"],
        choices: [
          { text: "Was meinst du damit genau?", next: "miraOpen1" },
          {
            text: "Pass auf, was du sagst. Hier hört jemand zu.",
            next: "miraClosed1",
            action: (api) => api.setFlag("miraSystemic"),
          },
          { text: "Keine Zeit für sowas." },
        ],
      },
      // OFFEN
      miraOpen1: {
        id: "miraOpen1",
        speaker: "MIRA",
        text: "Frag dich mal, warum 104,6 deinen Schmerz lindert und nicht den Grund dafür wegnimmt. Ein gutes Mittel würde das Problem lösen — nicht dich an das Problem gewöhnen. Ich glaube, das ist kein Zufall. Beweisen kann ich's nicht.",
        choices: [
          { text: "Sprich weiter.", next: "miraOpen2" },
          {
            text: "Das ist mir jetzt zu groß. Lass gut sein.",
            next: "miraDefer",
          },
        ],
      },
      miraOpen2: {
        id: "miraOpen2",
        speaker: "MIRA",
        text: "Meine These: Die Frequenz ist eine Leine. Lang genug, dass du dich frei fühlst. Kurz genug, dass du nicht aus dem Quadranten läufst. Vielleicht spinne ich. Aber zu viele Dinge passen zu gut zusammen — angefangen bei meinem Vater.",
        choices: [
          { text: "Und wer hält das andere Ende?", next: "miraOpen4" },
          { text: "Hübsches Bild. Mehr nicht.", next: "miraDeferDry" },
          { text: "Reicht. Ich muss weiter.", next: "miraDefer" },
        ],
      },
      miraOpen4: {
        id: "miraOpen4",
        speaker: "MIRA",
        text: "Genau die Frage. Ich hab eine Vermutung. Steht hier drauf.",
        next: "miraOpen5",
      },
      miraOpen5: {
        id: "miraOpen5",
        speaker: "SYSTEM",
        text: "[ Sie zieht ein gefaltetes Blatt aus der Innentasche und drückt es Layard in die Hand. Schnell. Geübt. ]",
        next: "miraOpen6",
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
        text: "Lies es allein. Nicht im Terminal. Niemals im Terminal. Z.K.S.",
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
        text: "Wirst du schon merken. Geh jetzt. Ich war nie hier.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => {
              api.setFlag("miraOpenness");
              api.setFlag("tookFlyer");
              api.addItem({
                id: "flyer",
                name: "Flugblatt",
                description:
                  "LAUSCHT IHR? Wir vermuten: die Frequenz, die euch trägt, wurde nicht gefunden, sondern gebaut. Wir können's nicht beweisen. Aber fragt euch selbst: wer dreht sie lauter, wenn ihr leiser werdet? Nicht eure Leitstelle. Vielleicht niemand. Vielleicht doch jemand. — Z.K.S.",
              });
              api.setKnowledge("frequencyControl");
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
      // Layard hört zu, lässt sich aber nicht hineinziehen.
      // Mira hält das Blatt zurück und bleibt offen für Wiederbegegnung.
      miraDefer: {
        id: "miraDefer",
        speaker: "MIRA",
        text: "Auch gut. — Ich bin oft hier oben, falls du irgendwann doch mal Lust hast, weiterzudenken.",
        subtext:
          "Sie steckt etwas zurück in die Innentasche, ohne es ihm zu zeigen.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("miraDeferred"),
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
            action: (api) => api.setFlag("miraDeferred"),
          },
        ],
      },
      // GESCHLOSSEN
      miraClosed1: {
        id: "miraClosed1",
        speaker: "MIRA",
        text: "Ach. Einer von denen. Schon gut. Vergiss, dass ich was gesagt habe.",
        subtext: "Sie ist nicht überrascht. Sie hat damit gerechnet.",
        next: "miraClosed2",
      },
      miraClosed2: {
        id: "miraClosed2",
        speaker: "MIRA",
        text: "Schönen Tag noch, Bürger.",
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
        // Nur, wenn Mira das Blatt schon einmal hervorgeholt hat — sonst
        // gäbe es nichts „zu überlegen“. Und nicht, wenn Layard im
        // Suchmodus ist (sawEmptyOffice → eigene Begrüßung mr1b).
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
      // Layard war noch nicht beim Thema „Frequenz“ — Mira fängt nochmal
      // von vorn an, ohne ihm direkt das Blatt anzubieten.
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
        text: "Sag mal — hörst du eigentlich noch zu, wenn das Radio leise ist? Oder nur, wenn es laut ist?",
        choices: [
          { text: "Was willst du damit sagen?", next: "mrOpen1" },
          { text: "Lass mich in Ruhe damit.", next: "mrSystemic" },
          { text: "Keine Zeit." },
        ],
      },
      mrTalk: {
        id: "mrTalk",
        speaker: "MIRA",
        text: "Reden. Gut. — Worüber denn?",
        choices: [
          { text: "Über das, was du vorhin meintest.", next: "mrOpen1" },
          { text: "Eigentlich über nichts." },
        ],
      },
      // Spieler weicht beim Wiedersehen aus → wird ab jetzt ebenfalls
      // als systemtreu behandelt.
      mrSystemic: {
        id: "mrSystemic",
        speaker: "MIRA",
        text: "Verstanden. — Schönen Tag noch, Bürger.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("miraSystemic"),
          },
        ],
      },
      // Wiederbegegnungs-Variante der Offenheits-Kette (lokal, da
      // DialogOverlay nur innerhalb desselben Trees nach IDs sucht).
      mrOpen1: {
        id: "mrOpen1",
        speaker: "MIRA",
        text: "Frag dich mal, warum 104,6 deinen Schmerz lindert und nicht den Grund dafür wegnimmt. Ein gutes Mittel würde das Problem lösen — nicht dich an das Problem gewöhnen. Ich glaube, das ist kein Zufall. Beweisen kann ich's nicht.",
        choices: [
          { text: "Sprich weiter.", next: "mrOpen2" },
          { text: "Das ist mir jetzt zu groß. Lass gut sein.", next: "mrOpenDefer" },
        ],
      },
      mrOpen2: {
        id: "mrOpen2",
        speaker: "MIRA",
        text: "Du drehst sie auf, weil du etwas spüren willst, was dir im eigenen Leben fehlt. Und während du hörst, sendest du selbst — leise, unbewusst. Ich denke: genau das wollen sie. Ich weiß, das klingt nach Theorie. Ist es auch.",
        choices: [
          { text: "Wer ist „sie“?", next: "mrOpen3" },
          { text: "Reicht. Ich muss weiter.", next: "mrOpenDefer" },
        ],
      },
      mrOpen3: {
        id: "mrOpen3",
        speaker: "MIRA",
        text: "Niemand mit Namen — vielleicht auch niemand überhaupt. Aber wenn da jemand ist, dann eine Verwaltung, die irgendwann gemerkt hat, dass ruhige Bürger billiger sind als zufriedene. Meine Vermutung steht hier drauf.",
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
        text: "Lies es allein. Niemals im Terminal. Z.K.S. — Geh jetzt. Ich war nie hier.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => {
              api.setFlag("miraOpenness");
              api.setFlag("tookFlyer");
              api.addItem({
                id: "flyer",
                name: "Flugblatt",
                description:
                  "LAUSCHT IHR? Wir vermuten: die Frequenz, die euch trägt, wurde nicht gefunden, sondern gebaut. Wir können's nicht beweisen. Aber fragt euch selbst: wer dreht sie lauter, wenn ihr leiser werdet? Nicht eure Leitstelle. Vielleicht niemand. Vielleicht doch jemand. — Z.K.S.",
              });
              api.setKnowledge("frequencyControl");
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
            action: (api) => api.setFlag("miraDeferred"),
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
                description:
                  "LAUSCHT IHR? Wir vermuten: die Frequenz, die euch trägt, wurde nicht gefunden, sondern gebaut. Wir können's nicht beweisen. Aber fragt euch selbst: wer dreht sie lauter, wenn ihr leiser werdet? Nicht eure Leitstelle. Vielleicht niemand. Vielleicht doch jemand. — Z.K.S.",
              });
              api.setKnowledge("frequencyControl");
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
      // Mira nennt jetzt konkret den Knoten 5610. Sie tut das nur einmal:
      // sobald saw5610Door gesetzt ist, übergeht sie diese Zeilen.
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
        text: "Hinter der Tür sitzt ein Knoten. Meine Vermutung: da läuft das, was hier oben auf 104,6 unterwegs ist, durch — bevor es zu jemand anderem geht. Wenn ich recht habe, hörst du dich da selbst. Gefiltert. Wenn ich falsch liege, ist es ein Trafo-Kasten.",
        hiddenWhen: ["saw5610Door"],
        next: "ma4",
      },
      ma4: {
        id: "ma4",
        speaker: "MIRA",
        text: "Geh hin. Schau dir's an. Sag mir, was du gesehen hast. Ich kann mich auch täuschen. Mehr sage ich nicht. Geh.",
        hiddenWhen: ["saw5610Door"],
        next: "maAck",
        end: true,
      },
      // Sobald die Tür schon entdeckt ist, bleibt die Begrüßung schlicht.
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
    start: "msg1",
    lines: {
      msg1: {
        id: "msg1",
        speaker: "MIRA",
        text: "Guten Tag, Bürger.",
        subtext: "Sie sieht ihn nicht einmal an.",
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
        text: "Du bist nochmal da. Mit dem Blatt. Und jetzt willst du was.",
        subtext: "Sie wirkt nicht überrascht. Eher: bereit.",
        next: "mtp2",
      },
      mtp2: {
        id: "mtp2",
        speaker: "MIRA",
        text: "Bevor ich dir mehr sage: drei Sachen. Erstens — auf Etage 56, am Drucker, hängt ein freier Port. Wenn du einen Rechner hast, der Telnet kann, kommst du auf eine Maschine. Da liegt ein Manifest. Lies es. Nicht jetzt. Allein.",
        next: "mtp3",
      },
      mtp3: {
        id: "mtp3",
        speaker: "MIRA",
        text: "Zweitens — schalt das Schmerz-Radio aus. Nicht leise. AUS. Eine Minute lang. Wenn du das nicht aushältst, sind wir hier fertig.",
        next: "mtp4",
      },
      mtp4: {
        id: "mtp4",
        speaker: "MIRA",
        text: "Und drittens — eine Frage. Wenn morgen niemand mehr 104,6 hört: Was tust du als erstes?",
        choices: [
          { text: "Ich gehe raus. Ohne Meldung.", next: "mtpAnswerGood" },
          { text: "Ich rufe die Leitstelle und frage, was los ist.", next: "mtpAnswerBad" },
          { text: "Ich drehe die Frequenz wieder auf.", next: "mtpAnswerBad" },
          { text: "Nichts. Ich sitze und höre, was übrig ist.", next: "mtpAnswerGood" },
        ],
      },
      mtpAnswerGood: {
        id: "mtpAnswerGood",
        speaker: "MIRA",
        text: "Gute Antwort. — Komm wieder, wenn du das Manifest gelesen UND die Stille ausgehalten hast. Dann reden wir weiter.",
        next: "mtpCheck",
      },
      mtpAnswerBad: {
        id: "mtpAnswerBad",
        speaker: "MIRA",
        text: "Schade. — Du bist noch nicht so weit. Das ist okay. Geh, hör dein Radio.",
        choices: [
          {
            text: "[ Beenden ]",
            action: (api) => api.setFlag("miraTrustWithheld"),
          },
        ],
      },
      // Beim Beenden prüfen wir die beiden Sachflags. Stimmen beide,
      // verrät Mira die Adresse und übergibt den Türzettel.
      mtpCheck: {
        id: "mtpCheck",
        speaker: "SYSTEM",
        text: "[ Mira mustert ihn kurz. ]",
        requires: ["readMiraManifest", "radioMutedAtLeast60s"],
        next: "mtpReveal",
      },
      mtpReveal: {
        id: "mtpReveal",
        speaker: "MIRA",
        text: "Beides erledigt. Ich seh's an dir. — Also gut. 4601. Vierte Etage, gleich hier um die Ecke. Klopf nicht. Tür ist offen, wenn ich da bin.",
        requires: ["readMiraManifest", "radioMutedAtLeast60s"],
        next: "mtpReveal2",
      },
      mtpReveal2: {
        id: "mtpReveal2",
        speaker: "SYSTEM",
        text: "[ Sie drückt Layard einen kleinen, gefalteten Zettel in die Hand. ]",
        requires: ["readMiraManifest", "radioMutedAtLeast60s"],
        choices: [
          {
            text: "[ Annehmen ]",
            action: (api) => {
              api.setFlag("miraTrustEarned");
              api.addItem({
                id: "miraDoorNote",
                name: "Zettel von Mira",
                description:
                  "Karierter Schnipsel, eckige Schrift: »4601. nicht klopfen. wenn ich da bin, ist offen. — m.« Auf der Rückseite ein winzig gemaltes durchgestrichenes Ohr.",
              });
            },
          },
        ],
      },
      // Fallback, wenn Voraussetzungen nicht erfüllt sind: Mira hat
      // mtpAnswerGood gehört, aber die zwei Aufgaben fehlen noch.
      mtpHold: {
        id: "mtpHold",
        speaker: "MIRA",
        text: "Komm wieder, wenn du beides hast. Du weißt, was zu tun ist.",
        hiddenWhen: ["miraTrustEarned"],
        end: true,
      },
    },
  },
  miraAtHomeIntro: {
    id: "miraAtHomeIntro",
    npcId: "mira",
    start: "mah1",
    lines: {
      mah1: {
        id: "mah1",
        speaker: "SYSTEM",
        text: "[ Die Tür war angelehnt. Mira sitzt im Schneidersitz auf dem Bett, Kopfhörer um den Hals, ein offenes Schulbuch im Schoß. ]",
        next: "mah2",
      },
      mah2: {
        id: "mah2",
        speaker: "MIRA",
        text: "Du hast tatsächlich nicht geklopft. Das ist die erste Bewährung.",
        subtext: "Sie lächelt halb. Es wirkt geübt — als hätte sie den Satz aufgespart.",
        next: "mah3",
      },
      mah3: {
        id: "mah3",
        speaker: "MIRA",
        text: "Setz dich, wenn du willst. Oder steh. Ist eh ein bisschen klein hier. — Frag, was du fragen wolltest.",
        choices: [
          {
            text: "[ Bleiben und reden ]",
            action: (api) => api.setFlag("miraAtHomeMet"),
          },
        ],
      },
    },
  },
  miraAmplifierAsk: {
    id: "miraAmplifierAsk",
    npcId: "mira",
    start: "ma1",
    lines: {
      ma1: {
        id: "ma1",
        speaker: "MIRA",
        text: "Gut, dass du nochmal kommst. Ich brauche jemanden mit Hausschlüssel und ohne Akte.",
        next: "ma2",
      },
      ma2: {
        id: "ma2",
        speaker: "MIRA",
        text: "Ich versuche seit drei Wochen, auf das Trauer-Band zu senden. Wut. Konkret. Kein Diffuses.",
        subtext: "Sie deutet zum Fenster — da hängt ein dünner Draht in den Innenhof.",
        next: "ma3",
      },
      ma3: {
        id: "ma3",
        speaker: "MIRA",
        text: "Aber auf dem Trauer-Band sendet seit 91 jeden Abend eine alte Frau aus 5612. Ihr eigener Bastler-Sender, ihre eigene Trauer. Mein Sender allein kommt nicht gegen sie an. Ich brauche eine Verstärker-Antenne, die mein Signal für ein paar Minuten über ihres legt — länger nicht, mehr nicht.",
        next: "ma4",
      },
      ma4: {
        id: "ma4",
        speaker: "LAYARD",
        text: "Und ich soll die bauen?",
        next: "ma5",
      },
      ma5: {
        id: "ma5",
        speaker: "MIRA",
        text: "Du hast bessere Verbindungen als ich. Du brauchst zwei Sachen: einen Bernstein-Resonator — du hast einen, ich seh’ ihn an deiner Tasche — und ein Stück Antennen-Draht. Den findest du nicht im Bewohner-Handel, aber im Wartungsbereich. Frag Bodo. Oder schau im Serverraum 5610, wenn du da reinkommst.",
        next: "ma6",
      },
      ma6: {
        id: "ma6",
        speaker: "MIRA",
        text: "Wenn du beides hast, kombinier es und bring es mir. Ich häng’s an meinen Sender. Dann öffnest du dein Schmerz-Radio bei mir, gehst auf 104,0 und hältst die Frequenz, bis das Band kippt. Den Rest mache ich.",
        choices: [
          {
            text: "Verstanden — ich besorg den Draht.",
            action: (api) => api.setFlag("miraAskedAmplifier"),
          },
          {
            text: "Klingt nach mehr Ärger, als ich heute brauche.",
            action: (api) => api.setFlag("miraAskedAmplifier"),
          },
        ],
      },
    },
  },
  miraAmplifierWait: {
    id: "miraAmplifierWait",
    npcId: "mira",
    start: "mw1",
    lines: {
      mw1: {
        id: "mw1",
        speaker: "MIRA",
        text: "Bernstein und Draht, Worag. Beides kombinieren, dann mir geben. Ich kann nicht ewig auf das Band schauen — irgendwann merkt jemand, dass ich es versuche.",
        end: true,
      },
    },
  },
  miraAfterAmplifier: {
    id: "miraAfterAmplifier",
    npcId: "mira",
    start: "mf1",
    lines: {
      mf1: {
        id: "mf1",
        speaker: "MIRA",
        text: "Du hast das Band gehalten. Eine ganze Minute lang. Ich hab gemerkt, wie unten im zweiten Stock jemand das Radio leiser gedreht hat — weil Wut anders weh tut als Trauer.",
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
};
