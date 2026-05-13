import apartmentBg from "@/assets/scene-apartment.jpg";
import apartmentNoRadioBg from "@/assets/scene-apartment-no-radio.jpg";
import hallwayBg from "@/assets/scene-hallway.jpg";
import hallway2615SealedBg from "@/assets/scene-hallway-2615-sealed.jpg";
import apt2613Bg from "@/assets/scene-apt-2613.jpg";
import apt2612BgEmpty from "@/assets/scene-apt-2612.jpg";
import apt2612BgBodo from "@/assets/scene-apt-2612-bodo.jpg";
import pencilStubSprite from "@/assets/sprite-pencil-stub.png";
import type { Scene } from "../types";

export const apartmentAct1Scenes: Record<string, Scene> = {
  apartment: {
    id: "apartment",
    background: (api) =>
      api.hasFlag("tookPainRadio") ? apartmentNoRadioBg : apartmentBg,
    title: "Wohnung 2611 — Quadrant E67",
    intro: (api) => {
      // Akt II — nach der Bridge-Cutscene wacht Layard hier wieder auf.
      // Die Akt-I-Eröffnung passt nicht mehr: das Radio ist auf Pause,
      // und Insa hat ihn eingeladen.
      if (api.hasFlag("act2Started") && !api.hasFlag("insaAct2BriefingDone")) {
        const friendly = api.hasFlag("miraEndFriendly");
        const skeptical = api.hasFlag("miraEndSkeptical");
        const mira = friendly
          ? "Auf dem Boden vor seiner Tür: ein zusammengefalteter Zettel von Mira — er hat ihn gestern Abend nicht aufgehoben."
          : skeptical
            ? "Auf dem Boden vor seiner Tür: ein behördlicher Aushang. Räumung 4601. Layard liest ihn nicht noch einmal."
            : "Im Korridor draußen: Schritte, die nicht stehen bleiben.";
        return [
          "Layard wacht ohne Wecker auf. Das Schmerz-Radio steht still.",
          "Sieben Tage Pause — Dr. Okwu hat darum gebeten, nicht es verordnet.",
          "Auf dem Tisch: ein Zettel in Insas Handschrift. „Vorbeikommen, wenn Sie wach sind. Tür 4602.“",
          mira,
        ].join(" ");
      }
      return "Layard. Ein-Zimmer-Wohnung, Quadrant E67. Auf dem Tisch: das Schmerz-Radio. Heute hat er Urlaub. Heute will er weiter — tiefer. Stell die Frequenz auf 104,6 und dreh die Lautstärke voll auf.";
    },
    hotspots: [
      {
        id: "radio",
        x: 10,
        y: 47.6,
        w: 8.1,
        h: 13.7,
        label: "Schmerz-Radio",
        kind: "use",
        hiddenWhen: ["tookPainRadio"],
        onUse: (api) => {
          if (!api.hasFlag("tookPainRadio")) {
            api.setFlag("tookPainRadio");
            api.addItem({
              id: "painRadio",
              name: "Schmerz-Radio",
              description:
                "Ein kleines tragbares Resonanz-Radio mit Bernstein-Skala und kurzer Teleskop-Antenne. Layards einziger verlässlicher Empfänger. Steckt jetzt in der Innentasche seines Mantels.",
            });
            api.showText([
              "Layard hebt das Schmerz-Radio vom Tisch und steckt es ein.",
              "Früher hatte Layard wenige Gefühle gehabt. Wahrscheinlich waren es meistens Gedanken gewesen – und dann überwiegend negative. Das Gefühl, das er noch am besten kannte, am klarsten trennen konnte von dem Klumpen seines Inneren, war Angst.",
              "Als er vor fünf Jahren das alte, längst aus der Mode gekommene Schmerz-Radio auf dem Dachboden seiner Mutter gefunden hatte, änderte sich das. Schmerz war anders. Schmerz war tief, traurige Schönheit – das Gefühl den Schmerz der anderen zu spüren war für ihn berauschender als das Excelsior, das er einmal ausprobiert hatte. Es machte Spaß, das Schmerz-Radio machte traurig, ehrfürchtig – die intensiven Gefühle der anderen war das Tor zu einem inneren Universum.",
            ]);
            return;
          }
          api.openRadio();
        },
      },
      {
        id: "terminal",
        x: 24.1,
        y: 34.4,
        w: 13.5,
        h: 28,
        label: "CentralOS Terminal",
        kind: "use",
        onUse: (api) => api.openTerminal(),
      },
      {
        id: "phoneApt",
        x: 76.2,
        y: 33,
        w: 6.7,
        h: 22,
        label: "Telefon",
        kind: "use",
        // Only available after Layard saw the empty office on floor 3
        // AND has the Einsatzprotokoll in der Tasche — sonst gibt es
        // gar keinen Anlass, die Leitstelle anzurufen.
        requires: ["sawEmptyOffice", "protocolReceived"],
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
            api.hasFlag("receivedTillaTransfer") &&
            !api.hasFlag("calledForCode")
          ) {
            // Layards Vorgang 4317 ist sauber abgeschlossen — Transferbogen
            // ist im Inventar. Insa hält Wort und legt den Code ins Postfach.
            api.setFlag("calledForCode");
            api.startDialog("insa2");
          } else if (
            api.hasFlag("calledStegmann") &&
            api.hasFlag("centralOsUpdated") &&
            api.hasFlag("troubleReported") &&
            api.hasFlag("reportedExit") &&
            !api.hasFlag("calledForCode")
          ) {
            // Standardweg: Stegmann ist abgearbeitet, aber der Vorgangs-
            // Block hängt noch. Insa erinnert an die offene 4317.
            if (api.hasFlag("sentForgedQuittung") && !api.hasFlag("receivedTillaTransfer")) {
              // Fallback: Quittung ist raus, aber die Antwort wurde nie
              // aktiv aus dem Rohr geholt. Bogen direkt nachreichen.
              api.setFlag("receivedTillaTransfer");
              api.addItem({
                id: "tillaTransfer",
                name: "Transferbogen E70-K → 70-2244",
                description:
                  "Eingehende Rohrpost-Hülse, beantwortet eine Quittung 4317-K. Inhalt: ein Transferbogen — Patientin Tilla Kowalk, von E70-K verlegt an Heim Lothenau, neue Bewohnernummer 70-2244. Stempel »ÜBERFÜHRUNG STILL«. Datum 06.11.1997.",
              });
              api.setFlag("calledForCode");
              api.startDialog("insa2");
            } else {
              api.startDialog("insaWaitingForTransfer");
            }
          } else if (
            api.hasFlag("insaGaveTransferTask") &&
            !api.hasFlag("receivedTillaTransfer")
          ) {
            // Insa hat den Vorgangs-Hinweis schon gegeben, aber Layard
            // war noch nicht (erfolgreich) bei Kowalk. Kurzer Reminder.
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
        x: 48.6,
        y: 56.7,
        w: 32.6,
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
        x: 60.1,
        y: 21.7,
        w: 16,
        h: 12,
        label: "Wandregal",
        kind: "use",
        onUse: (api) => {
          if (!api.hasFlag("openedAlmanach")) {
            api.setFlag("openedAlmanach");
            api.showText(
              [
                "Auf dem Wandregal: ein paar Aktenordner, ein leerer Vinyl-Schuber,",
                "und — ganz links — der „Quadranten-Almanach 1997“.",
                "Bewohner-Ausgabe, zerlesen. Layard schlägt ihn auf.",
              ],
              // Almanach erst öffnen, wenn der Spieler den Text durchgeklickt hat.
              () => api.openAlmanach(),
            );
          } else {
            api.openAlmanach();
          }
        },
      },
      {
        id: "b2",
        x: 25.2,
        y: 72.3,
        w: 12.8,
        h: 17.8,
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
        x: 42.5,
        y: 11.6,
        w: 12.8,
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
        x: 86.7,
        y: 4.2,
        w: 13.1,
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
        x: 60.5,
        y: 18,
        w: 19.5,
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
        x: 64.5,
        y: 22.5,
        w: 19.5,
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
        x: 64.5,
        y: 42.8,
        w: 8.1,
        h: 20.2,
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
        x: 29,
        y: 8,
        w: 28.5,
        h: 50,
        label: "Wand mit Klopfen (zur 2615)",
        kind: "look",
        hiddenWhen: ["doorBrokenOpen"],
        onUse: (api) => {
          api.setFlag("knockingHeard");
          api.showText([
            "Klopf. Klopf. Klopf.",
            "Regelmäßig. Aber nicht mechanisch.",
            "Layard legt die Hand an den Beton. Er fühlt es im Handballen, bevor er es im Ohr hört.",
            "„Hallo?! Jemand da?“ — Das Klopfen geht im selben Rhythmus weiter.",
          ]);
        },
      },
      // Nach Akt 1: ruhige Wand zur (jetzt versiegelten) 2615.
      {
        id: "wallAfter",
        x: 29,
        y: 8,
        w: 28.5,
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
        x: 19.2,
        y: 18,
        w: 9.8,
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
        x: 42.4,
        y: 80.4,
        w: 18,
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
        x: 83.8,
        y: 18.3,
        w: 12.3,
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
    npcs: [
      {
        id: "pencilStubSprite2612",
        src: pencilStubSprite,
        x: 49.6,
        y: 48.1,
        w: 7,
        h: 6,
        alt: "Bleistiftstummel auf Bodos Tisch",
        requires: ["noticedTransferCode"],
        hiddenWhen: ["tookPencilStub"],
      },
    ],
    hotspots: [
      {
        id: "bodoNpc",
        // Hotspot deckt das Bodo-Sprite auf dem Sessel.
        x: 15.4,
        y: 25.5,
        w: 22.5,
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
        x: 9.1,
        y: 35.9,
        w: 22.5,
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
        x: 42.8,
        y: 58.9,
        w: 16.5,
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
        x: 72.9,
        y: 13.9,
        w: 9,
        h: 17.2,
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
        x: 49.6,
        y: 48.1,
        w: 7,
        h: 6,
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
        x: 53.9,
        y: 22.2,
        w: 19.5,
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
        // Wohnungstür rechts neben dem Telefon-/Schreibtischbereich.
        x: 83.7,
        y: 4.1,
        w: 12,
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
    // Zwei Hintergrund-Varianten: vor der Sanitäter-Cutscene das saubere
    // Original, danach die Variante mit gelbem Quarantäne-Klebeband vor
    // Tür 2615. Die Aufzugs-Sperre wird ausschließlich über das Display
    // („WARTUNGSANFRAGE 4711") kommuniziert — kein Tape-Overlay mehr.
    background: (api) =>
      api.hasFlag("paramedicsCutsceneSeen") ? hallway2615SealedBg : hallwayBg,
    title: "Korridor 26 — Quadrant E67",
    intro:
      "Der Korridor. Wie jeden Morgen. Nur dass Layard ihn jeden Morgen nicht betritt.",
    hotspots: [
      {
        id: "back2611",
        x: 72.9,
        y: 18.5,
        w: 11,
        h: 75.5,
        label: "Tür 2611 (zurück in die Wohnung)",
        kind: "exit",
        onUse: (api) => api.goTo("apartment"),
      },
      // Tür 2613 — Philippes Wohnung. Bleibt jederzeit begehbar.
      {
        id: "door2613Philippe",
        x: 64.75,
        y: 26.5,
        w: 6.9,
        h: 64.5,
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
        x: 58.8,
        y: 32.5,
        w: 5.2,
        h: 47,
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
        x: 16.8,
        y: 19.8,
        w: 12.1,
        h: 74,
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
        x: 30.45,
        y: 26.4,
        w: 5.8,
        h: 65.1,
        label: "Tür 2612 (Bodo Marschke)",
        kind: "exit",
        onUse: (api) => api.goTo("apt2612"),
      },
      // Tür 2614 — Ennis Korr. Nur Türgespräch.
      {
        id: "door2614Ennis",
        x: 37.2,
        y: 32.8,
        w: 4,
        h: 42.5,
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
        x: 44.05,
        y: 34.7,
        w: 13.9,
        h: 40.4,
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
        x: 44.05,
        y: 34.7,
        w: 13.9,
        h: 40.4,
        label: "Aufzug (gesperrt — Wartung 4711)",
        kind: "look",
        requires: ["elevatorMaintBlocked"],
        hiddenWhen: ["elevatorMaintCleared"],
        onUse: (api) => {
          api.setFlag("elevatorMaintSeen");
          api.showText([
            "Display: „WARTUNGSANFRAGE 4711 — AUFZUG GESPERRT“.",
          ]);
        },
      },
    ],
  },
};
