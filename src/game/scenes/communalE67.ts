import commonRoomBg from "@/assets/scene-common-room.jpg";
import cafeteriaBg from "@/assets/scene-cafeteria-e67.jpg";
import aptMira4601Bg from "@/assets/scene-apt-mira-4601.jpg";
import type { Scene } from "../types";

export const communalE67Scenes: Record<string, Scene> = {
  commonRoomE67: {
    id: "commonRoomE67",
    background: commonRoomBg,
    title: "Gemeinschaftsraum — Erdgeschoss, E67",
    intro:
      "Warmes Lampenlicht über einem viel zu großen Tisch. Würfel, ein aufgeschlagenes Regelwerk, ein Plan auf Karopapier. Drei Jugendliche schauen auf, als die Tür aufgeht.",
    // NPCs sind direkt ins Hintergrundbild gemalt (keine Sprites).
    hotspots: [
      {
        id: "tableSeat",
        // Der freie Stuhl links im Vordergrund (mit Lehne).
        // Stage 1024×640 zeigt 16:9-Bild via object-cover: sichtbar
        // sind ~5.4 %..94.6 % der Original-Bildbreite. Alle Werte sind
        // bereits in Stage-% angegeben.
        x:  0,
        y: 62,
        w: 13,
        h: 38,
        label: (() => "Freier Stuhl am Tisch")(),
        kind: "use",
        onUse: (api) => {
          api.setFlag("enteredCommonRoom");
          api.setFlag("metRpgGroup");
          if (!api.getDsaCharacter()) {
            api.openDsaCreator();
          } else if (api.hasFlag("dsaCampaignFinished")) {
            api.showText([
              "Tjark klappt das Buch zu. „Das war's für heute. Gute Runde.“",
              "Brem reckt sich, Yelva sammelt die Würfel ein.",
              "Ein anderes Mal vielleicht weiter.",
            ]);
          } else {
            api.openDsaAdventure();
          }
        },
      },
      {
        id: "tjarkSpot",
        // Tjark (schwarze Haare, Brille) hinten Mitte-Rechts hinter dem GM-Schirm.
        x: 66,
        y: 4,
        w: 20,
        h: 54,
        label: "Tjark (Meister)",
        kind: "talk",
        onUse: (api) => api.startDialog("tjarkSmalltalk"),
      },
      {
        id: "yelvaSpot",
        // Yelva (grünes Kleid, Brille) sitzt rechts am Tisch.
        x: 84,
        y: 38,
        w: 16,
        h: 58,
        label: "Yelva (Elfe)",
        kind: "talk",
        onUse: (api) =>
          api.showText([
            "Yelva mustert dich kurz, dann das Regelwerk.",
            "„Wenn du dich setzt, würfelst du erstmal sieben Eigenschaften. 1W6 plus 7.“",
          ]),
      },
      {
        id: "bremSpot",
        // Brem (rote Haare, rot-schwarz gestreift) steht links am Tisch.
        x: 13,
        y: 12,
        w: 22,
        h: 78,
        label: "Brem (Streuner)",
        kind: "talk",
        onUse: (api) =>
          api.showText([
            "Brem grinst schief.",
            "„Bloß keinen Magier. Magier sind langweilig.“",
          ]),
      },
      {
        id: "rulebook",
        // Aufgeschlagenes DSA-Regelwerk auf dem Tisch (links unten).
        x: 24,
        y: 64,
        w: 22,
        h: 16,
        label: "DSA-Regelwerk",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "„Das Schwarze Auge“, zweite Edition. Eselsohren, Kaffeeflecken,",
            "mit Bleistift annotiert: „Praxisregel — KEINE Charaktertode in der Anreise.“",
          ]),
      },
      {
        id: "exitCommon",
        // Schmaler Streifen am linken Bildrand (Tür außerhalb des Bildes).
        x:  0,
        y: 0,
        w: 4,
        h: 100,
        label: "Zurück in die Lobby",
        kind: "exit",
        onUse: (api) => api.goTo("floor1Lobby"),
      },
    ],
  },
  cafeteriaE67: {
    id: "cafeteriaE67",
    background: cafeteriaBg,
    title: "Kantine 3602 — Nährstoffausgabe E67",
    intro:
      "Hinter der Theke zwei Kittel. Auf dem Boden ein Streifen, der einmal weiß war, jetzt eine Spur Anstellen markiert. Im Rohr über dem Tresen blinkt rot ein Licht, das niemand quittiert.",
    hotspots: [
      {
        id: "kowalkSpot",
        x: 13,
        y: 45,
        w: 14,
        h: 50,
        label: "Frau Kowalk",
        kind: "talk",
        onUse: (api) => {
          if (!api.hasFlag("metKowalk")) {
            api.setFlag("metKowalk");
          }
          api.startDialog("cafeteriaKowalk");
        },
      },
      {
        id: "brustSpot",
        x: 77,
        y: 42,
        w: 14,
        h: 50,
        label: "Herr Brust",
        kind: "talk",
        onUse: (api) => {
          if (!api.hasFlag("metBrust")) {
            api.setFlag("metBrust");
          }
          api.startDialog("cafeteriaBrust");
        },
      },
      {
        // Oberinspektor Vossbeck — sichtbar, sobald Layard drei
        // Trainingssiege gegen Brust geschafft hat. Steht hinten beim
        // Hochregal mit Aktendeckel auf den Knien.
        id: "vossbeckSpot",
        x: 47,
        y: 28,
        w: 8,
        h: 28,
        label: "Oberinspektor Vossbeck",
        kind: "talk",
        requires: ["vossbeckSummoned"],
        hiddenWhen: ["duelEndgameWon"],
        onUse: (api) => {
          api.startDialog("cafeteriaVossbeck");
        },
      },
      {
        id: "cafeteriaCounter",
        x: 36,
        y: 56,
        w: 22,
        h: 16,
        label: "Ausgabetheke",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein gestempeltes Schild auf dem Tresen:",
            "„AUSGABE NUR MIT BEWOHNER-AUSWEIS ODER GEGENGEZEICHNETER VOLLMACHT.“",
            "Daneben ein zweites Schild, gelber:",
            "„AUSNAHMEN AUF KULANZ — Schicht B / Frau Kowalk.“",
          ]),
      },
      // Quittungsblock — Layard kann sich einen Blanko-Bogen nehmen,
      // sobald er gemerkt hat, dass 4317 ein Transfer-Code ist.
      // Brust und Kowalk sehen geflissentlich weg: Quittungsblöcke
      // gelten als Verbrauchsmaterial.
      {
        id: "cafeteriaQuittungsblock",
        // Auf dem Tresen, rechts neben dem Schild.
        x: 56,
        y: 56,
        w: 16,
        h: 14,
        label: "Quittungsblock Schicht B",
        kind: "use",
        requires: ["noticedTransferCode"],
        hiddenWhen: ["tookQuittungBlanko"],
        onUse: (api) => {
          api.setFlag("tookQuittungBlanko");
          api.addItem({
            id: "quittungBlankoB",
            name: "Quittungsbogen Schicht B (blanko)",
            description:
              "Ein dünner, hellblauer Carbon-Quittungsbogen, oben perforiert. Trägt vorgedruckt: »QUITTUNG / SCHICHT __ / KOPIE FÜR E70«. Zwei Felder warten leer: Code und Schicht-Gegenzeichnung.",
          });
          api.showText([
            "Layard zieht einen Bogen vom Quittungsblock ab — der oberste,",
            "dünn und hellblau, perforiert. Brust steht zwei Meter weiter und",
            "sieht weg. Kowalk auch. Quittungsbögen kosten nichts.",
            "[ Quittungsbogen Schicht B (blanko) eingesteckt. ]",
          ]);
        },
      },
      {
        id: "cafeteriaPneumaticTube",
        x: 38,
        y: 14,
        w: 14,
        h: 18,
        label: "Pneumatik-Rohrpost",
        kind: (() => "use" as const)(),
        onUse: (api) => {
          // Sobald Layard die gefälschte Quittung schon abgeschickt hat,
          // bringt das Rohr die eingehende Antwort: Tillas Transferbogen.
          if (
            api.hasFlag("sentForgedQuittung") &&
            !api.hasFlag("receivedTillaTransfer")
          ) {
            api.setFlag("receivedTillaTransfer");
            api.addItem({
              id: "tillaTransfer",
              name: "Transferbogen E70-K → 70-2244",
              description:
                "Eingehende Rohrpost-Hülse, beantwortet eine Quittung 4317-K. Inhalt: ein Transferbogen — Patientin Tilla Kowalk, von E70-K verlegt an Heim Lothenau, neue Bewohnernummer 70-2244. Stempel »ÜBERFÜHRUNG STILL«. Datum 06.11.1997.",
            });
            api.showText([
              "Im Rohr klackt es. Eine Hülse landet im Auffangkorb.",
              "Aufkleber: »EINGANG · QUITTUNG 4317-K · BEANTWORTET«.",
              "Drinnen: ein Transferbogen. Eine Bewohnernummer. Ein Heim.",
              "Tilla.",
              "[ Transferbogen 70-2244 eingesteckt. ]",
            ]);
            return;
          }
          // Vor der Fälschung: das Overlay öffnet sich nur, wenn Layard
          // wirklich versuchen kann, etwas zu verschicken (Trigger gesetzt).
          // Sonst nur der alte Beobachtungs-Text.
          if (
            !api.hasFlag("noticedTransferCode") ||
            !api.hasFlag("forgedQuittung4317")
          ) {
            api.showText(
            api.hasFlag("radioTunedTo1046")
              ? [
                  "Messing, blank gewienert. Das Licht oben blinkt rot.",
                  "(SCHMERZ-RADIO: Hinter der Klappe atmet etwas, wie ein Mensch, der vergessen hat, wie das geht.)",
                ]
              : [
                  "Messing, blank gewienert. Das Licht oben blinkt rot.",
                  "Niemand schaut hin. Vielleicht blinkt es schon eine Weile.",
                ],
            );
            return;
          }
          api.openPneumaticTube();
        },
      },
      {
        id: "cafeteriaPosters",
        x: 60,
        y: 28,
        w: 18,
        h: 24,
        label: "Hygiene-Aushänge",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Zwei Aushänge, übereinander getackert.",
            "Oben, neu, von 1996: »Handschuhe bei jeder Ausgabe — ausnahmslos.«",
            "Darunter, von 1991, vergilbt: »Handschuhe nur bei flüssigen Rationen — sonst Geschmacksstörung.«",
            "Beide tragen das gleiche Siegel der Leitstelle.",
          ]),
      },
      {
        id: "back36FromCafeteria",
        x: 86,
        y: 70,
        w: 12,
        h: 28,
        label: "Zurück in den Korridor",
        kind: "exit",
        onUse: (api) => api.goTo("corridor36"),
      },
    ],
  },
  aptMira4601: {
    id: "aptMira4601",
    background: aptMira4601Bg,
    title: "Wohnung 4601 — Mira",
    intro:
      "Eng. Ein Bett, ein Schreibtisch, an der Wand mehr Plakate als Tapete. Auf dem Tisch summt ein offenes Terminal in giftigem Phosphorgrün. Ein Kabel verschwindet hinter der Wand Richtung Etagendrucker.",
    hotspots: [
      {
        id: "miraInRoom",
        x: 20,
        y: 48,
        w: 22,
        h: 45,
        label: "Mira",
        kind: "talk",
        onUse: (api) => {
          if (!api.hasFlag("miraAtHomeMet")) {
            api.startDialog("miraAtHomeIntro");
            return;
          }
          if (api.hasFlag("miraSentAnger")) {
            api.startDialog("miraAfterAmplifier");
            return;
          }
          if (api.hasFlag("miraAskedAmplifier")) {
            // Wiederholtes Nachfragen, solange Layard noch keine Antenne
            // gebaut/übergeben hat.
            api.startDialog("miraAmplifierWait");
            return;
          }
          api.startDialog("miraAmplifierAsk");
        },
      },
      {
        id: "miraTerminal",
        x: 70,
        y: 50,
        w: 22,
        h: 30,
        label: "Miras Terminal (FuckTheSystemOS)",
        kind: "use",
        onUse: (api) => {
          if (!api.hasFlag("miraTerminalUnlocked")) {
            api.showText([
              "Das Terminal summt. Der Login-Prompt blinkt.",
              "Mira hat noch nicht gesagt, dass Layard hier reinschauen darf.",
              "Solange das Trauer-Band steht, lässt sie ihn nicht ran.",
            ]);
            return;
          }
          api.openTerminal({ mira: true });
        },
      },
      {
        id: "miraPosterLeine",
        x: 28,
        y: 22,
        w: 30,
        h: 24,
        label: "Plakat „104,6 — DEINE LEINE“",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Stenciled, schwarz, schief geklebt. Darunter, klein:",
            "»eine leine ist erst dann eine, wenn man sie spürt.«",
            "Und ganz unten: Z.K.S.",
          ]),
      },
      {
        id: "miraPosterStille",
        x: 56,
        y: 36,
        w: 14,
        h: 14,
        label: "Zettel „TAG DER STILLE — bald.“",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Mit roter Kreide übermalt: »bald.« Darunter, kleiner:",
            "»eine etage. eine stunde. wir merken, dass wir nicht sterben.«",
          ]),
      },
      {
        id: "miraPortraits",
        x:  0,
        y: 24,
        w: 22,
        h: 38,
        label: "Korkbrett mit Porträts",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Vier kopierte Bewohnerporträts, mit rotem Faden verbunden.",
            "Mira hat daneben mit Bleistift kleine Notizen geschrieben:",
            "»hört zu / schreibt mit / hat einen anker / weiß alles, sagt nichts«.",
          ]),
      },
      {
        id: "miraBed",
        x: 14,
        y: 64,
        w: 32,
        h: 30,
        label: "Bett",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Zerwühlte Decke. Halb aufgeschlagen ein Schulbuch:",
            "»Sektor-Geographie · Klasse 10«. Am Rand mit Kuli:",
            "»E54, E72, E81 — Brieffreunde. nicht namen. nie namen.«",
          ]),
      },
      {
        id: "miraVent",
        x: 84,
        y: 6,
        w: 14,
        h: 16,
        label: "Verklebter Lüftungsschlitz",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Mit Paketband zugeklebt. Wer hier wohnt, will nicht,",
            "dass sein Zimmer mithört.",
          ]),
      },
      {
        id: "aptMiraBack",
        x:  0,
        y: 80,
        w: 14,
        h: 18,
        label: "Zurück in den Korridor",
        kind: "exit",
        onUse: (api) => api.goTo("corridor46"),
      },
    ],
  },
};
