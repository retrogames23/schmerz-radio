import apartmentBg from "@/assets/scene-apartment.jpg";
import hallwayBg from "@/assets/scene-hallway.jpg";
import hallway2615SealedBg from "@/assets/scene-hallway-2615-sealed.jpg";
import hallwayElevatorSealedBg from "@/assets/scene-hallway-elevator-sealed.jpg";
import hallwayElevatorAnd2615SealedBg from "@/assets/scene-hallway-elevator-and-2615-sealed.jpg";
import apt2613Bg from "@/assets/scene-apt-2613.jpg";
import apt2612BgEmpty from "@/assets/scene-apt-2612.jpg";
import apt2612BgBodo from "@/assets/scene-apt-2612-bodo.jpg";
import type { Scene } from "../types";

export const apartmentAct1Scenes: Record<string, Scene> = {
  apartment: {
    id: "apartment",
    background: apartmentBg,
    title: "Wohnung 2611 — Quadrant E67",
    intro:
      "Layard. Ein-Zimmer-Wohnung, Quadrant E67. Auf dem Tisch: das Schmerz-Radio. Heute hat er Urlaub. Heute will er weiter — tiefer. Stell die Frequenz auf 104,6 und dreh die Lautstärke voll auf.",
    hotspots: [
      {
        id: "radio",
        x: 17,
        y: 52,
        w: 9,
        h: 19,
        label: "Schmerz-Radio",
        kind: "use",
        onUse: (api) => api.openRadio(),
      },
      {
        id: "terminal",
        x: 23,
        y: 38,
        w: 18,
        h: 28,
        label: "CentralOS Terminal",
        kind: "use",
        onUse: (api) => api.openTerminal(),
      },
      {
        id: "phoneApt",
        x: 81,
        y: 30,
        w: 9,
        h: 25,
        label: "Telefon",
        kind: "use",
        // Only available after Layard saw the empty office on floor 3.
        requires: ["sawEmptyOffice"],
        hiddenWhen: ["calledInsaAfterE71"],
        onUse: (api) => {
          // Höchste Priorität: Layard ist aus E71 zurück und hat das
          // abgelehnte Protokoll noch in der Tasche → Insa anrufen.
          if (
            api.hasFlag("mikaelRejectedProtocol") &&
            !api.hasFlag("calledInsaAfterE71")
          ) {
            api.setFlag("calledInsaAfterE71");
            api.setFlag("insaInvitedToDispatch");
            api.startDialog("insaAct2Return");
          } else if (!api.hasFlag("calledInsa2")) {
            api.setFlag("calledInsa2");
            api.startDialog("insa2a");
          } else if (
            api.hasFlag("tappedNode5610") &&
            !api.hasFlag("calledForCode")
          ) {
            // Layard war im Serverraum 5610 und hat »tap« ausgeführt.
            // Jetzt ruft er Insa zurück → sie hält ihr Versprechen und
            // legt ihm die Code-Mail (Datum 06.11.1997) ins Postfach.
            // Pflicht: Layard muss die Tilla-Frage geklärt haben (Transferbogen
            // aus der Rohrpost). Sonst bricht Insa ab.
            if (!api.hasFlag("receivedTillaTransfer")) {
              api.startDialog("insaWaitingForTransfer");
              return;
            }
            api.setFlag("calledForCode");
            api.startDialog("insa2");
          } else if (
            api.hasFlag("calledStegmann") &&
            api.hasFlag("centralOsUpdated") &&
            api.hasFlag("troubleReported") &&
            api.hasFlag("reportedExit") &&
            !api.hasFlag("calledForCode")
          ) {
            // Standardweg: Layard hat brav gemeldet → direkt zum Code.
            if (!api.hasFlag("receivedTillaTransfer")) {
              api.startDialog("insaWaitingForTransfer");
              return;
            }
            api.setFlag("calledForCode");
            api.startDialog("insa2");
          } else if (
            api.hasFlag("insaSentTo5610") &&
            !api.hasFlag("tappedNode5610")
          ) {
            // Insa hat den Auftrag schon erteilt, aber Layard war noch
            // nicht am Knoten. Kurzer Reminder statt voller Vermittlung.
            api.startDialog("insaReminder5610");
          } else {
            // Alle anderen Fälle laufen über die Vermittlung Insa,
            // die je nach Anliegen weiterverbindet bzw. den Ausgang
            // anmahnt, bevor sie den Code freigibt.
            api.startDialog("insaDispatch");
          }
        },
      },
      {
        id: "bed",
        x: 38,
        y: 50,
        w: 27,
        h: 28,
        label: "Bett",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ungemacht. Wie immer.",
            "Schlaf ist B2-konform: ausreichend, geschmacklos.",
          ]),
      },
      {
        // Wandregal über dem Bett. Enthält das einzige Buch, das Layard
        // wirklich gelesen hat: den „Quadranten-Almanach 1997".
        id: "bookshelf",
        x: 38,
        y: 30,
        w: 20,
        h: 12,
        label: "Wandregal",
        kind: "use",
        onUse: (api) => {
          if (!api.hasFlag("openedAlmanach")) {
            api.setFlag("openedAlmanach");
            api.showText([
              "Auf dem Wandregal: ein paar Aktenordner, ein leerer Vinyl-Schuber,",
              "und — ganz links — der „Quadranten-Almanach 1997“.",
              "Bewohner-Ausgabe, zerlesen. Layard schlägt ihn auf.",
            ]);
            // Nach dem Text-Overlay öffnen — kleine Verzögerung, damit
            // showText sauber durchläuft.
            setTimeout(() => api.openAlmanach(), 60);
          } else {
            api.openAlmanach();
          }
        },
      },
      {
        id: "b2",
        x: 23,
        y: 73,
        w: 21,
        h: 22,
        label: "B2-Ration",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Synthetische Nährpaste B2.",
            "„Vollständige Versorgung. Keine Reizüberflutung.“",
            "Sie schmeckt nach nichts. Das ist Absicht.",
            "Philippe, hat Layard gehört, schwöre auf B3. Wegen des Geschmacks.",
            "Geschmack. Layard kann sich nicht erinnern, wann er das letzte Mal etwas geschmeckt hat.",
          ]),
      },
      {
        id: "window",
        // Fenster mit grünem Schein, Bildmitte etwas nach rechts.
        x: 51,
        y: 18,
        w: 17,
        h: 37,
        label: "Fenster",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Hinter dem Fenster: derselbe Innenhof wie gestern.",
            "Auf dem Sims: die Solaranlage. Sie reicht für 48 Stunden Notstrom.",
            "Lange genug. So lange, hat noch nie etwas gedauert.",
          ]),
      },
      {
        id: "door",
        x: 92,
        y: 4,
        w: 8,
        h: 92,
        label: "Wohnungstür",
        kind: "exit",
        onUse: (api) => {
          // Resonanz-Überlastung wurde ausgelöst (Radio @104,6),
          // Philippe steht beim ersten Heimkommen vor der Tür.
          if (api.hasFlag("doorbellRang") && !api.hasFlag("metPhilippe")) {
            // First open: meet Philippe at the door, then go with him to 2613
            api.setFlag("metPhilippe");
            api.startDialog("philippeAtDoor");
          } else {
            // Sonst einfach in den Korridor.
            api.goTo("hallway");
          }
        },
      },
    ],
  },
  apt2613: {
    id: "apt2613",
    background: apt2613Bg,
    title: "Wohnung 2613 — Philippe",
    intro:
      "Philippes Wohnung. Derselbe Grundriss wie bei Layard, etwas wärmer. Es riecht nach echtem Kaffee. An der Wand zur Nachbarwohnung 2615 ist das regelmäßige Klopfen zu hören.",
    hotspots: [
      {
        id: "philippeNpc",
        // Philippe steht rechts mit verschränkten Armen.
        x: 64,
        y: 18,
        w: 26,
        h: 78,
        label: "Philippe",
        kind: "talk",
        requires: ["knockingHeard"],
        // Nach dem ersten "Warten"-Klick verschwindet der Dialog-Hotspot.
        // Er kommt erst wieder, wenn Layard die Wohnung verlässt und neu
        // betritt (dann werden die Warte-Flags zurückgesetzt).
        hiddenWhen: ["paramedicsArrived", "wait2613Step1"],
        onUse: (api) => {
          if (!api.hasFlag("calledLeitstelle")) {
            api.setFlag("talkedPhilippe2613");
            api.startDialog("philippeIn2613");
          } else {
            api.startDialog("philippeSmalltalk");
          }
        },
      },
      // Nach den Sanitätern: Philippe bleibt in seiner Wohnung 2613.
      // Verschiedene Dialoge je nach Stand der Geschichte.
      {
        id: "philippeAfterNpc",
        x: 64,
        y: 18,
        w: 26,
        h: 78,
        label: "Philippe",
        kind: "talk",
        requires: ["paramedicsArrived"],
        onUse: (api) => {
          // Höchste Priorität: Layard hat die B3-Ration für Philippe und
          // hat sie noch nicht übergeben.
          if (
            api.hasItem("b3Ration") &&
            !api.hasFlag("gaveB3ToPhilippe")
          ) {
            api.setFlag("gaveB3ToPhilippe");
            api.startDialog("philippeReceivesB3");
            return;
          }
          if (api.hasFlag("ending")) {
            api.startDialog("philippeSmalltalk");
          } else if (!api.hasFlag("talkedPhilippeAfter")) {
            api.setFlag("talkedPhilippeAfter");
            if (!api.hasFlag("protocolReceived")) {
              api.startDialog("philippeAfterBeforeProtocol");
            } else if (api.hasFlag("sawEmptyOffice")) {
              api.startDialog("philippeAfter");
            } else {
              api.startDialog("philippeAfterEarly");
            }
          } else if (
            // Vollmacht-Bitte: nach erstem Zurückkommen, sobald Layard
            // weiß, dass auf Etage 3 etwas zu holen ist (sawEmptyOffice
            // → er war oben). Einmalig.
            api.hasFlag("sawEmptyOffice") &&
            !api.hasFlag("philippeAskedFavor") &&
            !api.hasFlag("ending")
          ) {
            api.setFlag("philippeAskedFavor");
            api.startDialog("philippeAsksFavor");
          } else if (api.hasFlag("protocolReceived")) {
            // Tür ist versiegelt → Philippe beginnt Layard auszufragen.
            // Fünf Sondierungs-Dialoge in fester Reihenfolge.
            if (!api.hasFlag("philippeProbe1")) {
              api.setFlag("philippeProbe1");
              api.startDialog("philippeProbe1");
            } else if (!api.hasFlag("philippeProbe2")) {
              api.setFlag("philippeProbe2");
              api.startDialog("philippeProbe2");
            } else if (!api.hasFlag("philippeProbe3")) {
              api.setFlag("philippeProbe3");
              api.startDialog("philippeProbe3");
            } else if (!api.hasFlag("philippeProbe4")) {
              api.setFlag("philippeProbe4");
              api.startDialog("philippeProbe4");
            } else if (!api.hasFlag("philippeProbe5")) {
              api.setFlag("philippeProbe5");
              api.startDialog("philippeProbe5");
            } else {
              api.startDialog("philippeSmalltalk");
            }
          } else {
            api.startDialog("philippeSmalltalk");
          }
        },
      },
      {
        id: "lampPhilippe",
        // Tischlampe rechts neben Philippe auf dem Nachttisch.
        x: 60,
        y: 38,
        w: 14,
        h: 24,
        label: "Lampe",
        kind: "look",
        requires: ["paramedicsArrived"],
        onUse: (api) =>
          api.showText([
            "Die einzige warme Lichtquelle in diesem Korridor.",
            "Philippe muss sie heimlich repariert haben.",
          ]),
      },
      {
        id: "wall",
        // Mittlere Betonwand zwischen Telefon und Philippe.
        x: 22,
        y: 8,
        w: 38,
        h: 50,
        label: "Wand mit Klopfen (zur 2615)",
        kind: "look",
        hiddenWhen: ["doorBrokenOpen"],
        onUse: (api) => {
          api.setFlag("knockingHeard");
          api.showText([
            "Klopf. Klopf. Klopf.",
            "Regelmäßig. Aber nicht mechanisch.",
            "Layard legt die Hand an den Beton. Er fühlt es im Handballen,",
            "bevor er es im Ohr hört.",
            "„Hallo?! Jemand da?“ — Das Klopfen geht im selben Rhythmus weiter.",
          ]);
        },
      },
      // Nach Akt 1: ruhige Wand zur (jetzt versiegelten) 2615.
      {
        id: "wallAfter",
        x: 22,
        y: 8,
        w: 38,
        h: 50,
        label: "Wand zur 2615 (still)",
        kind: "look",
        requires: ["doorBrokenOpen"],
        onUse: (api) =>
          api.showText([
            "Die Wand ist still. Zum ersten Mal seit Wochen, sagt Philippe.",
            "Trotzdem hält Layard kurz die Hand an den Beton.",
            "Nichts. Nur sein eigener Puls.",
          ]),
      },
      {
        id: "phone2613",
        // Beiger Bakelit-Wandapparat ganz links.
        x:  0,
        y: 18,
        w: 22,
        h: 55,
        label: "Telefon (Wandapparat)",
        kind: "use",
        requires: ["talkedPhilippe2613"],
        hiddenWhen: ["calledLeitstelle"],
        onUse: (api) => {
          api.setFlag("calledLeitstelle");
          api.startDialog("insa1");
        },
      },
      {
        id: "waitParamedics",
        x: 40,
        y: 75,
        w: 24,
        h: 18,
        label: "Warten",
        kind: "use",
        requires: ["calledLeitstelle"],
        hiddenWhen: ["paramedicsArrived"],
        onUse: (api) => {
          // Pro Besuch zwei Warte-Beats. Erst der zweite ruft die Sanitäter.
          if (!api.hasFlag("wait2613Step1")) {
            api.setFlag("wait2613Step1");
            api.showText([
              "Layard und Philippe warten. Das Klopfen aus 2615 hat sich",
              "kein einziges Mal verändert. Kein Tempo-Wechsel, keine Pause.",
              "Philippe schaut auf seine Uhr. Sagt nichts.",
            ]);
          } else if (!api.hasFlag("wait2613Step2")) {
            api.setFlag("wait2613Step2");
            api.showText([
              "Noch ein paar Minuten. Philippe stellt zwei Tassen auf den Tisch,",
              "trinkt aber nicht. Layard auch nicht.",
              "Im Korridor: Schritte. Gleichmäßig. Schwer.",
            ]);
          } else {
            // Sanitäter sind eingetroffen — die eigentliche Bergung
            // wird beim Verlassen der Wohnung als Cutscene gespielt.
            api.setFlag("paramedicsArrived");
            api.showText([
              "Es klopft an Philippes Tür. Schwere, kontrollierte Schläge.",
              "Eine Stimme: „Sanitätsdienst Block 26. Wir sind wegen 2615 da.“",
              "Philippe nickt Layard zu. „Gehen Sie raus. Sie haben sie gerufen.“",
            ]);
          }
        },
      },
      {
        id: "exit2613",
        // Türrahmen ganz rechts (hinter Philippe).
        x: 94,
        y: 18,
        w: 6,
        h: 80,
        label: "In den Korridor",
        kind: "exit",
        // Sobald die Sanitäter da sind, kann Layard hinaus. Beim ersten
        // Verlassen läuft die Bergungs-Cutscene; danach normales Navigieren.
        requires: ["paramedicsArrived"],
        onUse: (api) => {
          if (!api.hasFlag("paramedicsCutsceneSeen")) {
            api.startCutscene("paramedics");
          } else {
            api.goTo("hallway");
          }
        },
      },
    ],
  },
  apt2612: {
    id: "apt2612",
    // Solange Bodo da ist: Bild mit Bodo. Sobald er für B3 unterwegs ist:
    // identisches Bild ohne Bodo.
    background: (api) =>
      (api.hasFlag("bodoLeftForB3") && !api.hasFlag("bodoBackAfterB3")) ||
      (api.hasFlag("bodoLeftForB3Twice") &&
        !api.hasFlag("bodoBackAfterB3Twice"))
        ? apt2612BgEmpty
        : apt2612BgBodo,
    title: "Wohnung 2612 — Bodo Marschke",
    intro:
      "Warmes Lampenlicht. Es riecht nach altem Kraut, das jemand „Tee“ nennt. Bodo sitzt tief im Sessel, die Katze hat den vorderen Platz auf der Decke längst für sich beansprucht.",
    hotspots: [
      {
        id: "bodoNpc",
        // Hotspot deckt das Bodo-Sprite auf dem Sessel.
        x: 14,
        y: 36,
        w: 30,
        h: 60,
        label: "Bodo Marschke",
        kind: "talk",
        // Wenn Bodo gerade unterwegs zum B3 holen ist, ist er nicht da.
        visible: (api) => {
          const away1 =
            api.hasFlag("bodoLeftForB3") && !api.hasFlag("bodoBackAfterB3");
          const away2 =
            api.hasFlag("bodoLeftForB3Twice") &&
            !api.hasFlag("bodoBackAfterB3Twice");
          return !away1 && !away2;
        },
        onUse: (api) => {
          if (!api.hasFlag("metBodo")) {
            api.setFlag("metBodo");
            api.startDialog("bodoIntro");
          } else if (
            api.hasFlag("tookFlyer") &&
            !api.hasFlag("bodoSawFlyer")
          ) {
            api.setFlag("bodoSawFlyer");
            api.startDialog("bodoFlyer");
          } else if (
            // Akt-I-Pflichträtsel: Layard hat den Blanko-Quittungsbogen UND
            // den Trockensiegel-Abdruck — er kann Bodo überreden, das Ding
            // als „Wartungs-Schicht-B-Quittung" gegenzuzeichnen.
            api.hasItem("quittungBlankoB") &&
            api.hasItem("siegelAbdruck") &&
            !api.hasFlag("bodoSignedForTilla")
          ) {
            api.startDialog("bodoSignsTilla");
          } else if (
            api.hasFlag("knowsLotti") &&
            api.hasFlag("elevatorMaintSeen") &&
            !api.hasFlag("bodoBackAfterB3")
          ) {
            // Layard kann Bodo überzeugen, los zu gehen — aber erst, wenn
            // er einen konkreten Grund hat, ungestört an Bodos Terminal zu
            // wollen. Voraussetzung: Aufzug-Sperre (Wartung 4711) selbst
            // gesehen haben. Vorher kennt Layard zwar Lotti, hat aber kein
            // Motiv, Bodo loszuschicken.
            api.startDialog("bodoConvinceLeave");
          } else if (
            // Zweiter Anlauf: Bodo ist zurück, aber die Aufzugssperre
            // (oder ein anderes Terminal-Anliegen) ist noch offen.
            api.hasFlag("bodoBackAfterB3") &&
            !api.hasFlag("bodoBackAfterB3Twice") &&
            api.hasFlag("elevatorMaintBlocked") &&
            !api.hasFlag("elevatorMaintCleared")
          ) {
            api.startDialog("bodoConvinceLeave2");
          } else if (!api.hasFlag("talkedBodo2")) {
            api.setFlag("talkedBodo2");
            api.startDialog("bodoSmalltalk");
          } else {
            api.startDialog("bodoSmalltalk");
          }
        },
      },
      // Während Bodo weg ist: Hinweis statt Person.
      {
        id: "bodoEmptyChair",
        x: 2,
        y: 42,
        w: 30,
        h: 50,
        label: "Bodos leerer Sessel",
        kind: "look",
        requires: ["bodoLeftForB3"],
        hiddenWhen: ["bodoBackAfterB3Twice"],
        visible: (api) =>
          // Sichtbar während Anlauf 1 ODER während Anlauf 2.
          (api.hasFlag("bodoLeftForB3") && !api.hasFlag("bodoBackAfterB3")) ||
          (api.hasFlag("bodoLeftForB3Twice") &&
            !api.hasFlag("bodoBackAfterB3Twice")),
        onUse: (api) =>
          api.showText([
            "Bodos Sessel ist leer. Die Tasse Tee dampft noch.",
            "Lotti schläft tief. Sie weiß, dass er wiederkommt.",
            "Layard nicht so ganz. Aber er hat eine Viertelstunde.",
          ]),
      },
      {
        id: "lottiSpot",
        // Katze liegt auf der Ottomane vor dem Sessel.
        x: 28,
        y: 64,
        w: 22,
        h: 22,
        label: "Lotti (Katze)",
        kind: "talk",
        onUse: (api) => {
          if (
            api.hasFlag("noticedTransferCode") &&
            !api.hasFlag("tookPencilStub")
          ) {
            api.showText([
              "Lotti hat etwas zwischen den Vorderpfoten — etwas Kurzes,",
              "Spitzes, Holziges. Ein Bleistiftstummel, drei Zentimeter.",
              "Sie schiebt ihn unauffällig in Layards Richtung. Sie weiß,",
              "dass er etwas zu schreiben — oder zu reiben — hat.",
              "[ Nachsehen kannst du auf dem Tisch links neben Bodos Terminal. ]",
            ]);
          } else if (api.hasFlag("knowsLotti")) {
            api.showText([
              "Lotti rollt sich enger ein und blinzelt Layard zu.",
              "Sie hat 14 Jahre Mensch gesehen. Sie hat eine Meinung.",
              "Sie behält sie für sich.",
            ]);
          } else if (api.hasFlag("metBodo")) {
            api.startDialog("bodoLotti");
          } else {
            api.showText([
              "Auf dem Sessel: eine grau-getigerte Katze, eingerollt auf einer Strickdecke.",
              "Sie schaut Layard nicht an. Sie weiß genau, dass er da ist.",
            ]);
          }
        },
      },
      {
        id: "bodoPhone",
        // Beiges Wandtelefon rechts oberhalb des Terminal-Tisches.
        x: 70,
        y: 24,
        w: 12,
        h: 22,
        label: "Wandtelefon",
        kind: "look",
        onUse: (api) =>
          api.showText([
            "Ein schwarzer Bakelit-Apparat. Hörer staubig.",
            "Bodo, von hinten: „Den hab ich seit zwölf Jahren nicht abgenommen.“",
            "„Wer was von mir will, klopft. Oder ist die Katze.“",
          ]),
      },
      // Bleistiftstummel auf dem Terminaltisch — Pickup für das
      // Akt-I-Pflichträtsel „Quittung 4317". Sichtbar erst, wenn
      // Layard den Transfer-Code im Bericht entdeckt hat (sonst ist
      // das nur Deko, die niemand braucht).
      {
        id: "bodoPencil",
        // Tisch links neben dem Terminal.
        x: 36,
        y: 56,
        w: 12,
        h: 10,
        label: "Bleistiftstummel",
        kind: "use",
        requires: ["noticedTransferCode"],
        hiddenWhen: ["tookPencilStub"],
        onUse: (api) => {
          api.setFlag("tookPencilStub");
          api.addItem({
            id: "pencilStub",
            name: "Bleistiftstummel",
            description:
              "Drei Zentimeter Bleistift, Mine 2B, abgelutschtes Ende. Lag auf Bodos Tisch zwischen einem Kaffeering und Lottis Schnurrhaar. Reicht noch für eine ordentliche Reibung.",
          });
          api.showText([
            "Ein Bleistiftstummel, drei Zentimeter, Mine 2B.",
            "Bodo merkt es nicht. Lotti merkt es. Sie behält es für sich.",
            "[ Bleistiftstummel eingesteckt. ]",
          ]);
        },
      },
      {
        id: "bodoTerminal",
        // CRT-Monitor mit Tisch in der Bildmitte rechts.
        x: 46,
        y: 38,
        w: 26,
        h: 32,
        label: "Bodos Terminal",
        kind: "use",
        onUse: (api) => {
          const bodoAway =
            (api.hasFlag("bodoLeftForB3") &&
              !api.hasFlag("bodoBackAfterB3")) ||
            (api.hasFlag("bodoLeftForB3Twice") &&
              !api.hasFlag("bodoBackAfterB3Twice"));
          if (bodoAway) {
            // Bodo ist weg → freier Zugang, eingeloggt als bodo.
            api.openTerminal(true);
          } else if (api.hasFlag("metBodo") && !api.hasFlag("knowsLotti")) {
            api.showText([
              "Bodo schüttelt langsam den Kopf.",
              "„Das ist meiner. Da kommen Sie nur dran, wenn ich Sie ranlasse.“",
              "„Und ich lass’ Sie nicht ran, solange Sie nicht wissen, mit wem Sie hier eigentlich reden.“",
            ]);
          } else if (api.hasFlag("knowsLotti")) {
            api.showText([
              "Bodo schüttelt den Kopf, ohne aufzuschauen.",
              "„Solange ich hier sitze, sitzen Sie nicht hier. Ende.“",
              "„Wenn ich mal weg bin, dann vielleicht. Aber dafür müssten Sie mich",
              " erst mal weg kriegen.“",
            ]);
          } else {
            api.showText([
              "Ein altes CRT-Terminal. Bodo hat einen Blick darauf, der",
              "deutlich macht: nicht jetzt, Layard.",
            ]);
          }
        },
      },
      {
        id: "exit2612",
        // Wohnungstür ganz rechts.
        x: 80,
        y: 14,
        w: 20,
        h: 80,
        label: "Zurück in den Korridor",
        kind: "exit",
        onUse: (api) => {
          // Wenn Bodo gerade unterwegs ist: er kommt zurück, bevor Layard
          // den Raum verlassen kann. Beide treffen sich an der Tür.
          const firstTrip =
            api.hasFlag("bodoLeftForB3") && !api.hasFlag("bodoBackAfterB3");
          const secondTrip =
            api.hasFlag("bodoLeftForB3Twice") &&
            !api.hasFlag("bodoBackAfterB3Twice");
          if (firstTrip) {
            // Bodo merkt es, wenn Layard etwas Sichtbares getan hat —
            // entweder das System aktualisiert oder die Wartungssperre
            // 4711 storniert (beides hinterlässt Spuren im Log).
            if (api.hasFlag("centralOsUpdatedBodo")) {
              // v2.3.1-Schock — der eigentliche „Caught"-Dialog dreht
              // sich um die OS-Aktualisierung.
              api.startDialog("bodoReturnsCaught");
            } else if (api.hasFlag("elevatorMaintCleared")) {
              // Layard hat NICHT aktualisiert, aber das Wartungs-Ticket
              // 4711 storniert. Eigener Pfad ohne v2.3.1-Dialog.
              api.startDialog("bodoReturnsCaughtMaint");
            } else {
              api.startDialog("bodoReturnsClean");
            }
            return;
          }
          if (secondTrip) {
            // Beim zweiten Anlauf zählt nur, ob die Aufzugssperre weg ist.
            // Hat Layard wieder nichts getan → Bodo storniert sie selbst
            // (Lösung C: garantiert keine Sackgasse).
            if (api.hasFlag("elevatorMaintCleared")) {
              api.startDialog("bodoReturnsCaught2");
            } else {
              api.startDialog("bodoReturnsSelfFix");
            }
            return;
          }
          api.goTo("hallway");
        },
      },
    ],
  },
  hallway: {
    id: "hallway",
    // Hintergrund-Varianten:
    //  - rotes Klebeband am Aufzug, sobald Wartungssperre 4711 aktiv ist
    //    (elevatorMaintBlocked && !elevatorMaintCleared)
    //  - gelbes Siegelband an Tür 2615, sobald die Sanitäter-Cutscene
    //    gesehen wurde (paramedicsCutsceneSeen)
    //  - kombiniertes Bild, wenn beides zutrifft
    background: (api) => {
      const elevatorSealed =
        api.hasFlag("elevatorMaintBlocked") &&
        !api.hasFlag("elevatorMaintCleared");
      const apt2615Sealed = api.hasFlag("paramedicsCutsceneSeen");
      if (elevatorSealed && apt2615Sealed) return hallwayElevatorAnd2615SealedBg;
      if (elevatorSealed) return hallwayElevatorSealedBg;
      if (apt2615Sealed) return hallway2615SealedBg;
      return hallwayBg;
    },
    title: "Korridor 26 — Quadrant E67",
    intro:
      "Der Korridor. Wie jeden Morgen. Nur dass Layard ihn jeden Morgen nicht betritt.",
    hotspots: [
      {
        id: "back2611",
        x: 79,
        y: 21,
        w: 19,
        h: 77,
        label: "Tür 2611 (zurück in die Wohnung)",
        kind: "exit",
        onUse: (api) => api.goTo("apartment"),
      },
      // Tür 2613 — Philippes Wohnung. Bleibt jederzeit begehbar.
      {
        id: "door2613Philippe",
        x: 69,
        y: 31,
        w: 8,
        h: 54,
        label: "Tür 2613 (Philippe)",
        kind: "exit",
        onUse: (api) => {
          // Vor dem Klingeln (= vor der Resonanz-Überlastung) ist Philippe
          // unterwegs im Komplex. Er öffnet nicht.
          if (!api.hasFlag("metPhilippe")) {
            api.showText([
              "Layard klopft an 2613.",
              "Philippe ist nicht zu Hause.",
            ]);
            return;
          }
          // Pro Besuch werden die Warte-Beats und der Philippe-Hotspot
          // zurückgesetzt, damit Layard wieder mit ihm reden kann.
          api.clearFlag("wait2613Step1");
          api.clearFlag("wait2613Step2");
          api.goTo("apt2613");
        },
      },
      // Tür 2615 — wird in der Sanitäter-Cutscene aufgebrochen und
      // direkt im Anschluss mit gelbem Siegelband versiegelt. Der
      // Innenraum existiert als Szene nicht mehr — die Cutscene zeigt
      // alles, was es zu sehen gibt.
      {
        id: "door2615Sealed",
        x: 62,
        y: 36,
        w: 6,
        h: 34,
        label: "Tür 2615 (versiegelt)",
        kind: "look",
        requires: ["paramedicsCutsceneSeen"],
        onUse: (api) =>
          api.showText([
            "Ein gelbes Siegelband klebt schräg über dem Türrahmen.",
            "Darauf, in Maschinenschrift:",
            "„Quarantäne — Resonanz-Überlastung — bis auf Widerruf“.",
            "Niemand wird hier in absehbarer Zeit einziehen.",
          ]),
      },
      // Tür 2610 — Helka Vint. Nur Türgespräch, keine Szene.
      {
        id: "door2610Helka",
        x: 5,
        y: 20,
        w: 19,
        h: 78,
        label: "Tür 2610 (Helka Vint)",
        kind: "talk",
        onUse: (api) => {
          if (!api.hasFlag("metHelka")) {
            api.setFlag("metHelka");
            api.startDialog("helkaAtDoor");
          } else if (
            api.hasFlag("tookFlyer") &&
            !api.hasFlag("helkaSawFlyer")
          ) {
            api.setFlag("helkaSawFlyer");
            api.startDialog("helkaFlyer");
          } else if (!api.hasFlag("talkedHelka2")) {
            api.setFlag("talkedHelka2");
            api.startDialog("helkaSmalltalk");
          } else if (!api.hasFlag("talkedHelka3")) {
            api.setFlag("talkedHelka3");
            api.startDialog("helkaSmalltalk2");
          } else {
            api.showText([
              "Layard klopft. Aus der Wohnung 2610: kein Geräusch.",
              "Helka hat heute genug geredet. Mehr als in den letzten zwei Jahren.",
            ]);
          }
        },
      },
      // Tür 2612 — Bodo Marschke. Begehbare Wohnung.
      {
        id: "door2612Bodo",
        x: 25,
        y: 22,
        w: 11,
        h: 76,
        label: "Tür 2612 (Bodo Marschke)",
        kind: "exit",
        onUse: (api) => api.goTo("apt2612"),
      },
      // Tür 2614 — Ennis Korr. Nur Türgespräch.
      {
        id: "door2614Ennis",
        x: 37,
        y: 31,
        w: 6,
        h: 45,
        label: "Tür 2614 (Ennis Korr)",
        kind: "talk",
        onUse: (api) => {
          if (!api.hasFlag("metEnnis")) {
            api.setFlag("metEnnis");
            api.startDialog("ennisAtDoor");
          } else if (
            api.hasFlag("tookFlyer") &&
            !api.hasFlag("ennisSawFlyer")
          ) {
            api.setFlag("ennisSawFlyer");
            api.startDialog("ennisFlyer");
          } else if (api.hasFlag("ennisCracked")) {
            api.startDialog("ennisAfterFlyer");
          } else if (!api.hasFlag("talkedEnnis2")) {
            api.setFlag("talkedEnnis2");
            api.startDialog("ennisSmalltalk");
          } else {
            api.showText([
              "Layard klopft an 2614. Drinnen: ein Stuhl, der zurückgeschoben wird.",
              "Dann nichts. Ennis hat heute Nachtschicht. Oder er tut so.",
            ]);
          }
        },
      },
      {
        id: "toSector",
        x: 43,
        y: 34,
        w: 17,
        h: 36,
        label: "Aufzug",
        kind: "exit",
        // Sichtbar, solange keine aktive Wartungssperre auf dem Aufzug liegt.
        // Sobald die Sperre per `maint cancel 4711` storniert wurde
        // (elevatorMaintCleared), wird sie ignoriert und der Aufzug ist
        // wieder benutzbar.
        visible: (api) =>
          !api.hasFlag("elevatorMaintBlocked") ||
          api.hasFlag("elevatorMaintCleared"),
        onUse: (api) => api.goTo("elevator"),
      },
      // Solange Wartungssperre 4711 auf dem Aufzug liegt: er fährt nicht.
      // Layard kann an Bodos Terminal `maint cancel 4711` ausführen, sobald
      // Bodo unterwegs ist (bodoLeftForB3 && !bodoBackAfterB3).
      {
        id: "toSectorBlocked",
        x: 43,
        y: 34,
        w: 17,
        h: 36,
        label: "Aufzug (gesperrt — Wartung 4711)",
        kind: "look",
        requires: ["elevatorMaintBlocked"],
        hiddenWhen: ["elevatorMaintCleared"],
        onUse: (api) => {
          api.setFlag("elevatorMaintSeen");
          api.showText([
            "Rotes Klebeband versperrt den Aufzug.",
            "Display: „WARTUNGSANFRAGE 4711 — AUFZUG GESPERRT“.",
          ]);
        },
      },
    ],
  },
};
